import json
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request

from open_webui.constants import ERROR_MESSAGES
from open_webui.models.users import Users
from open_webui.utils.auth import get_verified_user
from open_webui.utils.chat import generate_chat_completion
from open_webui.utils.task import get_task_model_id

log = logging.getLogger(__name__)

router = APIRouter()

##################################
#
# Living Context Layer
#
# The context document lives in user.info["context"].
# It is injected into every conversation and grows as a side
# effect of normal activity (tool use, knowledge queries, etc).
#
##################################

_ALLOWED_PATCH_KEYS = {"profile", "interests", "preferences"}


@router.get("/")
async def get_user_context(user=Depends(get_verified_user)):
    user_obj = Users.get_user_by_id(user.id)
    if not user_obj:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES.USER_NOT_FOUND)
    return (user_obj.info or {}).get("context", {})


@router.patch("/")
async def update_user_context(form_data: dict, user=Depends(get_verified_user)):
    """Merge a partial update into the user's context.

    Only narrative fields (profile, interests, preferences) are writable here.
    Signal telemetry (signals, recent_sessions) is system-maintained.
    """
    user_obj = Users.get_user_by_id(user.id)
    if not user_obj:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES.USER_NOT_FOUND)
    info = dict(user_obj.info or {})
    ctx = dict(info.get("context", {}))
    for k, v in form_data.items():
        if k in _ALLOWED_PATCH_KEYS:
            ctx[k] = v
    ctx["updated_at"] = int(time.time())
    info["context"] = ctx
    Users.update_user_by_id(user.id, {"info": info})
    return ctx


@router.delete("/")
async def reset_user_context(user=Depends(get_verified_user)):
    """Wipe the context document entirely. The tree forgets you; it will learn again."""
    user_obj = Users.get_user_by_id(user.id)
    if not user_obj:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES.USER_NOT_FOUND)
    info = dict(user_obj.info or {})
    info.pop("context", None)
    Users.update_user_by_id(user.id, {"info": info})
    return True


##################################
#
# Ecosystem feed-in helpers
#
# One-liners called from middleware.py as side effects of normal activity.
# Every call is wrapped in try/except — these must never block a request.
#
##################################


def _context_note_tool(user, tool_function_name: str) -> None:
    """Record a tool invocation in the user's context signals."""
    try:
        user_obj = Users.get_user_by_id(user.id)
        if not user_obj:
            return
        info = dict(user_obj.info or {})
        ctx = dict(info.get("context", {}))
        signals = dict(ctx.get("signals", {}))
        tool_uses = dict(signals.get("tool_uses", {}))
        tool_uses[tool_function_name] = tool_uses.get(tool_function_name, 0) + 1
        last_tools = list(set(signals.get("_last_tools", [])) | {tool_function_name})
        signals["tool_uses"] = tool_uses
        signals["_last_tools"] = last_tools
        ctx["signals"] = signals
        info["context"] = ctx
        Users.update_user_by_id(user.id, {"info": info})
    except Exception:
        pass


def _context_note_knowledge(user, kb_names: list) -> None:
    """Record a knowledge base query in the user's context signals."""
    try:
        names = [n for n in kb_names if n]
        if not names:
            return
        user_obj = Users.get_user_by_id(user.id)
        if not user_obj:
            return
        info = dict(user_obj.info or {})
        ctx = dict(info.get("context", {}))
        signals = dict(ctx.get("signals", {}))
        kb_counts = dict(signals.get("knowledge_bases", {}))
        for name in names:
            kb_counts[name] = kb_counts.get(name, 0) + 1
        last_kb = list(set(signals.get("_last_knowledge", [])) | set(names))
        signals["knowledge_bases"] = kb_counts
        signals["_last_knowledge"] = last_kb
        ctx["signals"] = signals
        info["context"] = ctx
        Users.update_user_by_id(user.id, {"info": info})
    except Exception:
        pass


def _context_note_model(user, model_id: str) -> None:
    """Record model usage in the user's context signals."""
    try:
        if not model_id:
            return
        user_obj = Users.get_user_by_id(user.id)
        if not user_obj:
            return
        info = dict(user_obj.info or {})
        ctx = dict(info.get("context", {}))
        signals = dict(ctx.get("signals", {}))
        model_uses = dict(signals.get("model_uses", {}))
        model_uses[model_id] = model_uses.get(model_id, 0) + 1
        signals["model_uses"] = model_uses
        ctx["signals"] = signals
        info["context"] = ctx
        Users.update_user_by_id(user.id, {"info": info})
    except Exception:
        pass


##################################
#
# Context Harvester
#
# Called as an asyncio background task from background_tasks_handler
# in middleware.py after a conversation completes.
#
# Makes one small LLM call to extract what's worth remembering,
# then merges the result back into user.info["context"].
# Fails silently — the tree grows without announcing itself.
#
##################################


async def harvest_context(request: Request, messages: list, user, metadata: dict):
    """Extract durable facts from a completed conversation and update the user's context."""
    try:
        if not messages or len(messages) < 4:
            return

        model_id = metadata.get("model")
        if not model_id and messages:
            model_id = messages[-1].get("model")
        if not model_id:
            return

        user_obj = Users.get_user_by_id(user.id)
        if not user_obj:
            return

        existing_ctx = (user_obj.info or {}).get("context", {})
        existing_profile = existing_ctx.get("profile", "None yet.")
        existing_interests = json.dumps(existing_ctx.get("interests", []))
        existing_prefs = json.dumps(existing_ctx.get("preferences", {}))

        convo_text = "\n".join(
            f"{m['role'].upper()}: {str(m.get('content', ''))[:500]}"
            for m in messages[-20:]
            if isinstance(m.get("content"), str)
        )

        if not convo_text.strip():
            return

        prompt = (
            "You are a memory extractor. Given a conversation, update the user profile.\n\n"
            f"Current profile: {existing_profile}\n"
            f"Current interests: {existing_interests}\n"
            f"Current preferences: {existing_prefs}\n\n"
            f"Conversation:\n{convo_text}\n\n"
            "Respond with ONLY valid JSON in this exact shape:\n"
            '{"profile": "one or two sentence description", '
            '"interests": ["list", "of", "topics"], '
            '"preferences": {"style": "...", "avoid": []}, '
            '"session_summary": "one sentence summary of what was discussed"}\n\n'
            "Rules:\n"
            "- Merge new information with existing; do not discard what was already there.\n"
            "- Only include information actually evidenced by the conversation.\n"
            "- Keep each field brief. Profile max 2 sentences."
        )

        task_model_id = get_task_model_id(
            model_id,
            request.app.state.config.TASK_MODEL,
            request.app.state.config.TASK_MODEL_EXTERNAL,
            request.app.state.MODELS,
        )

        res = await generate_chat_completion(
            request,
            form_data={
                "model": task_model_id,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "max_completion_tokens": 400,
                "metadata": {"task": "context_harvest", "chat_id": metadata.get("chat_id")},
            },
            user=user,
            bypass_filter=True,
        )

        if not res or not isinstance(res, dict):
            return

        raw = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        raw = raw[raw.find("{") : raw.rfind("}") + 1]
        if not raw:
            return
        extracted = json.loads(raw)

        signals = dict(existing_ctx.get("signals", {}))
        new_session = {
            "at": int(time.time()),
            "summary": extracted.get("session_summary", ""),
            "tools_used": list(set(signals.pop("_last_tools", []))),
            "knowledge_queried": list(set(signals.pop("_last_knowledge", []))),
            "model": model_id,
        }

        sessions = list(existing_ctx.get("recent_sessions", []))
        sessions = [*sessions, new_session][-5:]

        new_ctx = {
            "v": 1,
            "updated_at": int(time.time()),
            "profile": extracted.get("profile") or existing_ctx.get("profile", ""),
            "interests": extracted.get("interests") or existing_ctx.get("interests", []),
            "preferences": extracted.get("preferences") or existing_ctx.get("preferences", {}),
            "recent_sessions": sessions,
            "signals": signals,
        }

        current_info = dict(user_obj.info or {})
        current_info["context"] = new_ctx
        Users.update_user_by_id(user.id, {"info": current_info})

    except Exception as e:
        log.debug(f"Context harvest failed silently: {e}")
