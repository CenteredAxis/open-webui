"""
Google Context Enricher — pulls signals from five Google APIs into the context document.

APIs used (all read-only, metadata only where possible):
  - Google Calendar  — event titles, past/next 7 days
  - Google Drive     — recently modified file names (metadata, no content)
  - Gmail            — sent email subjects (no body content)
  - YouTube          — liked video titles + subscribed channel names
  - Google Tasks     — active (incomplete) task titles

All five fetches run concurrently via asyncio.gather. Any individual source
that fails (e.g. due to missing scope from before a reconnect) degrades
gracefully — the others still contribute. Only the auth failure path
(no session, expired token) raises ValueError to the caller.

Requires scopes (added to GOOGLE_OAUTH_SCOPE):
  calendar.readonly, drive.metadata.readonly,
  gmail.metadata, youtube.readonly, tasks.readonly
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import Request

from open_webui.models.oauth_sessions import OAuthSessions
from open_webui.models.users import Users
from open_webui.utils.chat import generate_chat_completion
from open_webui.utils.task import get_task_model_id

log = logging.getLogger(__name__)

# ── API endpoints ────────────────────────────────────────────────────────────

_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
_DRIVE_URL = "https://www.googleapis.com/drive/v3/files"
_GMAIL_MESSAGES_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
_GMAIL_MESSAGE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}"
_YT_LIKED_URL = "https://www.googleapis.com/youtube/v3/videos"
_YT_SUBS_URL = "https://www.googleapis.com/youtube/v3/subscriptions"
_TASKS_LISTS_URL = "https://tasks.googleapis.com/tasks/v1/users/@me/lists"
_TASKS_URL = "https://tasks.googleapis.com/tasks/v1/lists/{list_id}/tasks"


# ── Orchestrator ─────────────────────────────────────────────────────────────


async def enrich_from_google(request: Request, user) -> dict:
    """
    Pull signals from all available Google APIs; extract topics via LLM; merge
    into the context document. Returns the updated context dict.

    Raises ValueError with a reason string on auth failures:
        "no_google_session"    — user has not connected Google
        "google_token_expired" — token refresh failed
    """
    session = OAuthSessions.get_session_by_provider_and_user_id("google", user.id)
    if not session:
        raise ValueError("no_google_session")

    token = await request.app.state.oauth_manager.get_oauth_token(user.id, session.id)
    if not token:
        raise ValueError("google_token_expired")

    access_token = token["access_token"]

    # Fetch all five sources concurrently — individual failures degrade gracefully
    results = await asyncio.gather(
        _fetch_calendar_events(access_token),
        _fetch_drive_files(access_token),
        _fetch_gmail_subjects(access_token),
        _fetch_youtube_signals(access_token),
        _fetch_tasks(access_token),
        return_exceptions=True,
    )

    calendar_items, drive_items, gmail_subjects, youtube_signals, task_items = (
        r if not isinstance(r, Exception) else _empty_for(r) for r in results
    )

    # Log any unexpected fetch errors at debug level
    for label, result in zip(
        ["calendar", "drive", "gmail", "youtube", "tasks"], results
    ):
        if isinstance(result, Exception):
            log.debug(f"google_enricher: {label} fetch degraded: {result}")

    all_empty = (
        not calendar_items
        and not drive_items
        and not gmail_subjects
        and not youtube_signals
        and not task_items
    )
    if all_empty:
        user_obj = Users.get_user_by_id(user.id)
        return (user_obj.info or {}).get("context", {})

    extracted = await _extract_topics(
        request, user,
        calendar_items=calendar_items,
        drive_items=drive_items,
        gmail_subjects=gmail_subjects,
        youtube_signals=youtube_signals,
        task_items=task_items,
    )

    return _merge_google_signals(user, extracted)


def _empty_for(exc: Exception):
    """Return an appropriate empty value for a failed fetch."""
    return []  # all fetchers return lists; empty list is safe default


# ── Google Calendar ───────────────────────────────────────────────────────────


async def _fetch_calendar_events(access_token: str) -> list[str]:
    """Event summary strings, past/next 7 days, max 20."""
    now = datetime.now(timezone.utc)
    params = {
        "orderBy": "startTime",
        "singleEvents": "true",
        "timeMin": (now - timedelta(days=7)).isoformat(),
        "timeMax": (now + timedelta(days=7)).isoformat(),
        "maxResults": "20",
        "fields": "items(summary)",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                _CALENDAR_URL,
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            resp.raise_for_status()
            return [
                item["summary"]
                for item in resp.json().get("items", [])
                if item.get("summary")
            ]
    except Exception as e:
        log.debug(f"calendar fetch: {e}")
        return []


# ── Google Drive ──────────────────────────────────────────────────────────────


async def _fetch_drive_files(access_token: str) -> list[dict]:
    """File names + MIME types for files modified in the past 7 days, max 20."""
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    params = {
        "orderBy": "modifiedTime desc",
        "pageSize": "20",
        "q": f"modifiedTime > '{seven_days_ago}'",
        "fields": "files(name,mimeType)",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                _DRIVE_URL,
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            resp.raise_for_status()
            return [
                {"name": f["name"], "mimeType": f.get("mimeType", "")}
                for f in resp.json().get("files", [])
                if f.get("name")
            ]
    except Exception as e:
        log.debug(f"drive fetch: {e}")
        return []


# ── Gmail (metadata only — subjects of sent mail) ────────────────────────────


async def _fetch_gmail_subjects(access_token: str) -> list[str]:
    """
    Subject lines from the user's 15 most recently sent emails.

    Sent mail is higher signal than inbox (avoids newsletters, spam, notifications).
    Fetches message IDs first, then subject headers concurrently — no body content
    is accessed or returned.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Step 1: get message IDs from SENT label
            list_resp = await client.get(
                _GMAIL_MESSAGES_URL,
                params={"maxResults": "15", "labelIds": "SENT"},
                headers=headers,
            )
            list_resp.raise_for_status()
            message_ids = [
                m["id"] for m in list_resp.json().get("messages", [])
            ]
            if not message_ids:
                return []

            # Step 2: fetch subject header for each message concurrently
            async def get_subject(msg_id: str) -> str:
                try:
                    r = await client.get(
                        _GMAIL_MESSAGE_URL.format(id=msg_id),
                        params={
                            "format": "metadata",
                            "metadataHeaders": "Subject",
                            "fields": "payload/headers",
                        },
                        headers=headers,
                    )
                    r.raise_for_status()
                    for header in r.json().get("payload", {}).get("headers", []):
                        if header.get("name", "").lower() == "subject":
                            return header.get("value", "")
                except Exception:
                    pass
                return ""

            subjects = await asyncio.gather(*[get_subject(mid) for mid in message_ids])
            return [s for s in subjects if s and len(s) > 3]  # filter empty/trivial

    except Exception as e:
        log.debug(f"gmail fetch: {e}")
        return []


# ── YouTube ───────────────────────────────────────────────────────────────────


async def _fetch_youtube_signals(access_token: str) -> list[str]:
    """
    Returns a combined list of signal strings:
      - Titles of the 20 most recently liked videos
      - Names of the 25 most recently subscribed channels

    Together these are the most direct signal of learning interests and
    ongoing consumption without requiring watch history (which the API
    doesn't expose directly).
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    signals: list[str] = []

    async with httpx.AsyncClient(timeout=10) as client:
        liked_task = client.get(
            _YT_LIKED_URL,
            params={
                "part": "snippet",
                "myRating": "like",
                "maxResults": "20",
                "fields": "items/snippet/title",
            },
            headers=headers,
        )
        subs_task = client.get(
            _YT_SUBS_URL,
            params={
                "part": "snippet",
                "mine": "true",
                "maxResults": "25",
                "order": "relevance",
                "fields": "items/snippet/title",
            },
            headers=headers,
        )

        results = await asyncio.gather(liked_task, subs_task, return_exceptions=True)

    for resp in results:
        if isinstance(resp, Exception):
            log.debug(f"youtube fetch partial: {resp}")
            continue
        try:
            resp.raise_for_status()
            for item in resp.json().get("items", []):
                title = item.get("snippet", {}).get("title", "")
                if title:
                    signals.append(title)
        except Exception as e:
            log.debug(f"youtube parse: {e}")

    return signals


# ── Google Tasks ──────────────────────────────────────────────────────────────


async def _fetch_tasks(access_token: str) -> list[str]:
    """
    Returns titles of all incomplete tasks across the user's task lists.

    Fetches up to 5 task lists, then up to 15 active tasks per list,
    all concurrently. Task titles are the most direct signal of what
    the user is actively trying to accomplish.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    task_titles: list[str] = []

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Step 1: get task lists
            lists_resp = await client.get(
                _TASKS_LISTS_URL,
                params={"maxResults": "5"},
                headers=headers,
            )
            lists_resp.raise_for_status()
            list_ids = [
                item["id"]
                for item in lists_resp.json().get("items", [])
                if item.get("id")
            ]
            if not list_ids:
                return []

            # Step 2: fetch active tasks for each list concurrently
            async def get_list_tasks(list_id: str) -> list[str]:
                try:
                    r = await client.get(
                        _TASKS_URL.format(list_id=list_id),
                        params={
                            "showCompleted": "false",
                            "showHidden": "false",
                            "maxResults": "15",
                            "fields": "items/title",
                        },
                        headers=headers,
                    )
                    r.raise_for_status()
                    return [
                        item["title"]
                        for item in r.json().get("items", [])
                        if item.get("title")
                    ]
                except Exception:
                    return []

            per_list = await asyncio.gather(*[get_list_tasks(lid) for lid in list_ids])
            for titles in per_list:
                task_titles.extend(titles)

    except Exception as e:
        log.debug(f"tasks fetch: {e}")

    return task_titles


# ── LLM topic extraction ─────────────────────────────────────────────────────


async def _extract_topics(
    request: Request,
    user,
    *,
    calendar_items: list[str],
    drive_items: list[dict],
    gmail_subjects: list[str],
    youtube_signals: list[str],
    task_items: list[str],
) -> dict:
    """
    Use a small LLM task call to extract interests and a profile note from
    all five Google signal sources. Returns {"interests": [...], "profile_note": "..."}.
    Falls back to empty dict on any error.
    """
    task_model_id = get_task_model_id(
        request.app.state.config.DEFAULT_MODELS
        or (list(request.app.state.MODELS.keys())[0] if request.app.state.MODELS else ""),
        request.app.state.config.TASK_MODEL,
        request.app.state.config.TASK_MODEL_EXTERNAL,
        request.app.state.MODELS,
    )
    if not task_model_id:
        return {}

    def fmt(items: list, label_fn=None) -> str:
        if not items:
            return "(none)"
        return "\n".join(
            f"- {label_fn(i) if label_fn else i}" for i in items[:20]
        )

    prompt = f"""Based only on the metadata titles below, identify what topics, projects, and areas this person is currently focused on. Return compact JSON only — no explanation.

Calendar events (past/next 7 days):
{fmt(calendar_items)}

Recently modified Drive files:
{fmt(drive_items, lambda f: f['name'])}

Recently sent email subjects:
{fmt(gmail_subjects)}

YouTube liked videos and subscribed channels:
{fmt(youtube_signals)}

Active tasks (to-do items):
{fmt(task_items)}

Return JSON with exactly these keys:
{{
  "interests": ["topic1", "topic2", ...],
  "profile_note": "one sentence about what this person seems to be working on and focused on right now"
}}"""

    try:
        response = await generate_chat_completion(
            request,
            form_data={
                "model": task_model_id,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "max_completion_tokens": 300,
                "metadata": {"task": "google_context_enrich"},
            },
            user=user,
            bypass_filter=True,
        )
        content = response["choices"][0]["message"]["content"]
        bracket_start = content.find("{")
        bracket_end = content.rfind("}") + 1
        if bracket_start == -1 or bracket_end == 0:
            return {}
        return json.loads(content[bracket_start:bracket_end])
    except Exception as e:
        log.debug(f"google_enricher: LLM extraction failed: {e}")
        return {}


# ── Merge ─────────────────────────────────────────────────────────────────────


def _merge_google_signals(user, extracted: dict) -> dict:
    """
    Merge extracted topics into the existing context document.
    New interests are unioned (deduplicated). Profile note is appended
    if not already present. Records _google_synced_at.
    """
    user_obj = Users.get_user_by_id(user.id)
    if not user_obj:
        return {}

    info = dict(user_obj.info or {})
    ctx = dict(info.get("context", {}))

    existing = list(ctx.get("interests", []))
    new_interests = [i for i in extracted.get("interests", []) if i not in existing]
    ctx["interests"] = existing + new_interests

    profile_note = (extracted.get("profile_note") or "").strip()
    if profile_note:
        existing_profile = ctx.get("profile", "").strip()
        if profile_note not in existing_profile:
            ctx["profile"] = (
                f"{existing_profile} {profile_note}".strip()
                if existing_profile
                else profile_note
            )

    ctx["_google_synced_at"] = int(time.time())
    ctx["updated_at"] = int(time.time())

    info["context"] = ctx
    Users.update_user_by_id(user.id, {"info": info})

    return ctx
