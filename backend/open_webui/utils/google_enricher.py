"""
Google Context Enricher — pulls Calendar + Drive signals into the context document.

Uses the existing OAuth token infrastructure (OAuthSessions + OAuthManager).
Requires calendar.readonly + drive.metadata.readonly scopes; raises ValueError
with a machine-readable reason string if they are not available.

Called by the context router's POST /enrich/google endpoint.
"""

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

_GOOGLE_CALENDAR_URL = (
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
)
_GOOGLE_DRIVE_URL = "https://www.googleapis.com/drive/v3/files"


async def enrich_from_google(request: Request, user) -> dict:
    """
    Pull Calendar and Drive signals; extract topics via LLM; merge into context.
    Returns the updated context dict.

    Raises ValueError with a reason string on any recoverable failure:
        "no_google_session"          — user has not connected Google
        "google_token_expired"       — token refresh failed
        "insufficient_google_scope"  — calendar/drive scopes not granted
    """
    # 1. Get stored Google OAuth session
    session = OAuthSessions.get_session_by_provider_and_user_id("google", user.id)
    if not session:
        raise ValueError("no_google_session")

    # 2. Get a valid (auto-refreshed) access token
    token = await request.app.state.oauth_manager.get_oauth_token(user.id, session.id)
    if not token:
        raise ValueError("google_token_expired")

    access_token = token["access_token"]

    # 3. Fetch signals from Google APIs
    calendar_items = await _fetch_calendar_events(access_token)
    drive_items = await _fetch_drive_files(access_token)

    if not calendar_items and not drive_items:
        # Nothing to extract — return the current context unchanged
        user_obj = Users.get_user_by_id(user.id)
        return (user_obj.info or {}).get("context", {})

    # 4. Extract interests/topics via LLM task call
    extracted = await _extract_topics(request, user, calendar_items, drive_items)

    # 5. Merge into the existing context document and persist
    return _merge_google_signals(user, extracted)


# ── Google API helpers ──────────────────────────────────────────────────────


async def _fetch_calendar_events(access_token: str) -> list[str]:
    """Return a list of event summary strings from the primary calendar.

    Covers the past 7 days and the next 7 days (max 20 events).
    Returns an empty list on permission errors — the caller handles 403 separately.
    """
    now = datetime.now(timezone.utc)
    time_min = (now - timedelta(days=7)).isoformat()
    time_max = (now + timedelta(days=7)).isoformat()

    params = {
        "orderBy": "startTime",
        "singleEvents": "true",
        "timeMin": time_min,
        "timeMax": time_max,
        "maxResults": "20",
        "fields": "items(summary)",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                _GOOGLE_CALENDAR_URL,
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.status_code == 403:
                raise ValueError("insufficient_google_scope")
            resp.raise_for_status()
            data = resp.json()
            return [
                item["summary"]
                for item in data.get("items", [])
                if item.get("summary")
            ]
    except ValueError:
        raise
    except Exception as e:
        log.debug(f"Google Calendar fetch error: {e}")
        return []


async def _fetch_drive_files(access_token: str) -> list[dict]:
    """Return a list of {name, mimeType} dicts for recently modified Drive files.

    Covers files modified in the past 7 days (max 20). Metadata only — no content.
    """
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
                _GOOGLE_DRIVE_URL,
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.status_code == 403:
                raise ValueError("insufficient_google_scope")
            resp.raise_for_status()
            data = resp.json()
            return [
                {"name": f["name"], "mimeType": f.get("mimeType", "")}
                for f in data.get("files", [])
                if f.get("name")
            ]
    except ValueError:
        raise
    except Exception as e:
        log.debug(f"Google Drive fetch error: {e}")
        return []


# ── LLM extraction ──────────────────────────────────────────────────────────


async def _extract_topics(
    request: Request,
    user,
    calendar_items: list[str],
    drive_items: list[dict],
) -> dict:
    """
    Use a small LLM task call to extract interests and a profile note from
    raw Calendar + Drive metadata. Returns {"interests": [...], "profile_note": "..."}.
    Falls back to empty dict on any error — the enricher degrades gracefully.
    """
    task_model_id = get_task_model_id(
        request.app.state.config.DEFAULT_MODELS
        or (list(request.app.state.MODELS.keys())[0] if request.app.state.MODELS else ""),
        request.app.state.config.TASK_MODEL,
        request.app.state.config.TASK_MODEL_EXTERNAL,
        request.app.state.MODELS,
    )
    if not task_model_id:
        log.debug("google_enricher: no task model available, skipping extraction")
        return {}

    calendar_text = (
        "\n".join(f"- {e}" for e in calendar_items) if calendar_items else "(none)"
    )
    drive_text = (
        "\n".join(f"- {f['name']}" for f in drive_items) if drive_items else "(none)"
    )

    prompt = f"""Based only on the titles below, identify what topics and projects this person is currently working on or focused on. Return compact JSON only — no explanation.

Calendar events (past/next 7 days):
{calendar_text}

Recently modified Drive files:
{drive_text}

Return JSON with exactly these keys:
{{
  "interests": ["topic1", "topic2", ...],
  "profile_note": "one sentence about what this person seems to be focused on right now"
}}"""

    try:
        response = await generate_chat_completion(
            request,
            form_data={
                "model": task_model_id,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "max_completion_tokens": 200,
                "metadata": {"task": "google_context_enrich"},
            },
            user=user,
            bypass_filter=True,
        )
        content = response["choices"][0]["message"]["content"]

        # Extract JSON from response
        bracket_start = content.find("{")
        bracket_end = content.rfind("}") + 1
        if bracket_start == -1 or bracket_end == 0:
            return {}
        return json.loads(content[bracket_start:bracket_end])
    except Exception as e:
        log.debug(f"google_enricher: LLM extraction failed: {e}")
        return {}


# ── Merge ───────────────────────────────────────────────────────────────────


def _merge_google_signals(user, extracted: dict) -> dict:
    """
    Merge extracted Google signals into the existing context document.

    - New interests are unioned with existing (deduplicated).
    - profile_note is appended to existing profile if non-empty.
    - _google_synced_at is set to now.
    - Writes back via Users.update_user_by_id and returns the updated context.
    """
    user_obj = Users.get_user_by_id(user.id)
    if not user_obj:
        return {}

    info = dict(user_obj.info or {})
    ctx = dict(info.get("context", {}))

    # Merge interests (union, preserve order, deduplicate)
    existing = list(ctx.get("interests", []))
    new_interests = [
        i for i in extracted.get("interests", []) if i not in existing
    ]
    ctx["interests"] = existing + new_interests

    # Append profile note if meaningful
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
