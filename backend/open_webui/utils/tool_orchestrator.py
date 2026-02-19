"""
ToolOrchestrator — decides how tools are surfaced and invoked for a turn.

There are two tool calling modes in Open WebUI:

1. Native function calling: the model receives tool specs via the `tools`
   field and makes calls itself. The orchestrator sets up the specs and
   lets the model drive.

2. Handler-based calling: the middleware intercepts, calls
   chat_completion_tools_handler to let the model decide which tool to
   call via a smaller LLM task, then executes it and injects the result.

The coordinator (process_chat_payload) currently makes this decision
inline with ~20 lines of logic. ToolOrchestrator owns that decision,
keeps the sources it collects, and returns cleanly.

Extracted from the tools_dict block in process_chat_payload() in
middleware.py (~lines 2528-2547). The coordinator replaces those lines
with a single await call.

Extension point: override resolve() or add a new calling mode without
touching the coordinator.
"""

import logging
from dataclasses import dataclass, field
from typing import Optional

from fastapi import Request

log = logging.getLogger(__name__)


@dataclass
class ToolResolution:
    """The result of resolving tools for a turn."""

    form_data: dict
    """The (potentially modified) request body — may have tools specs added."""

    metadata: dict
    """The (potentially modified) metadata — may have tools dict added."""

    sources: list[dict] = field(default_factory=list)
    """Citation sources collected during handler-based tool calling."""

    used_native: bool = False
    """True if native function calling specs were injected."""


class ToolOrchestrator:
    """
    Determines how tools are invoked for a given turn and executes the setup.

    Args:
        request:     The FastAPI request object.
        form_data:   The current request body (mutated in-place for native FC).
        extra_params: The extra_params dict (contains event emitter, user, etc.).
        user:        The authenticated user model.
        models:      The loaded models registry.
        metadata:    The assembled request metadata dict.
        tools_dict:  The resolved tools dict {name: tool_spec}.
    """

    def __init__(
        self,
        request: Request,
        form_data: dict,
        extra_params: dict,
        user,
        models: dict,
        metadata: dict,
        tools_dict: dict,
    ):
        self._request = request
        self._form_data = form_data
        self._extra_params = extra_params
        self._user = user
        self._models = models
        self._metadata = metadata
        self._tools_dict = tools_dict

    async def resolve(self) -> ToolResolution:
        """
        Set up tool calling for this turn.

        If tools_dict is empty, returns immediately with no changes.
        Otherwise, chooses native or handler-based calling and applies it.
        """
        if not self._tools_dict:
            return ToolResolution(
                form_data=self._form_data,
                metadata=self._metadata,
            )

        is_native = (
            self._metadata.get("params", {}).get("function_calling") == "native"
        )

        if is_native:
            return await self._resolve_native()
        else:
            return await self._resolve_handler()

    async def _resolve_native(self) -> ToolResolution:
        """Inject tool specs into form_data for native function calling."""
        self._metadata["tools"] = self._tools_dict
        self._form_data["tools"] = [
            {"type": "function", "function": tool.get("spec", {})}
            for tool in self._tools_dict.values()
        ]
        return ToolResolution(
            form_data=self._form_data,
            metadata=self._metadata,
            used_native=True,
        )

    async def _resolve_handler(self) -> ToolResolution:
        """
        Use the LLM-based tool selection handler.

        chat_completion_tools_handler makes a small LLM call to determine
        which tool to invoke, executes it, and injects the result into the
        conversation. Sources collected during this process are returned.
        """
        # Imported here to avoid circular import at module load time.
        from open_webui.utils.middleware import chat_completion_tools_handler

        sources: list[dict] = []
        try:
            self._form_data, flags = await chat_completion_tools_handler(
                self._request,
                self._form_data,
                self._extra_params,
                self._user,
                self._models,
                self._tools_dict,
            )
            sources.extend(flags.get("sources", []))
        except Exception as e:
            log.exception(f"ToolOrchestrator handler error: {e}")

        return ToolResolution(
            form_data=self._form_data,
            metadata=self._metadata,
            sources=sources,
            used_native=False,
        )
