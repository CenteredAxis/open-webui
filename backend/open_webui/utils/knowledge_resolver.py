"""
KnowledgeResolver — resolves model-attached knowledge bases into file specs.

Given a model's configuration and the current request context, determines
which knowledge sources should be active for this turn and returns them as
a list of file spec dicts that feed directly into the RAG pipeline
(chat_completion_files_handler → get_sources_from_items).

Extracted from the "Model Knowledge handling" block in process_chat_payload()
in middleware.py (~lines 2115-2160). The coordinator replaces those ~45 lines
with a single await call.

Extension point: add new knowledge source types by adding elif branches to
_build_file_specs(), or subclass KnowledgeResolver and override resolve().
The coordinator and RAG pipeline are unchanged in either case.
"""

import logging
from typing import Callable

from open_webui.utils.misc import get_last_user_message

log = logging.getLogger(__name__)


class KnowledgeResolver:
    """
    Resolves the knowledge bases attached to a model into file spec dicts.

    The returned specs are appended to form_data["files"] by the coordinator,
    which then passes them to chat_completion_files_handler for retrieval.

    Args:
        form_data:     The current request body dict (read-only, not mutated).
        model:         The resolved model dict including meta/knowledge config.
        metadata:      Request metadata dict (checked for function_calling mode).
        user:          The authenticated user (passed to context signal writer).
        event_emitter: Async callable for emitting status events to the client.
    """

    def __init__(
        self,
        form_data: dict,
        model: dict,
        metadata: dict,
        user,
        event_emitter: Callable,
    ):
        self._form_data = form_data
        self._model = model
        self._metadata = metadata
        self._user = user
        self._event_emitter = event_emitter

    async def resolve(self) -> list[dict]:
        """
        Return file spec dicts for all knowledge bases attached to this model.

        Returns an empty list when:
        - The model has no attached knowledge
        - The request is using native function calling (which handles knowledge
          retrieval differently via tool specs)
        """
        model_knowledge = (
            self._model.get("info", {}).get("meta", {}).get("knowledge") or []
        )

        if not model_knowledge:
            return []

        if self._metadata.get("params", {}).get("function_calling") == "native":
            return []

        user_message = get_last_user_message(self._form_data.get("messages", []))

        await self._event_emitter(
            {
                "type": "status",
                "data": {
                    "action": "knowledge_search",
                    "query": user_message,
                    "done": False,
                },
            }
        )

        file_specs = self._build_file_specs(model_knowledge)

        # Record the knowledge access as a context signal (side effect).
        # Imported here to avoid circular import at module load time.
        try:
            from open_webui.routers.context import _context_note_knowledge

            _context_note_knowledge(
                self._user, [item.get("name") for item in model_knowledge]
            )
        except Exception:
            pass  # Signal write is never allowed to block resolution

        return file_specs

    @staticmethod
    def _build_file_specs(model_knowledge: list) -> list[dict]:
        """
        Convert raw knowledge item configs into file spec dicts.

        Three spec shapes are supported (matching the original inline logic):
        1. Legacy single-collection items  (collection_name present)
        2. Legacy multi-collection items   (collection_names present)
        3. New-style items                 (passed through as-is)
        """
        specs = []
        for item in model_knowledge:
            if item.get("collection_name"):
                specs.append(
                    {
                        "id": item["collection_name"],
                        "name": item.get("name"),
                        "legacy": True,
                    }
                )
            elif item.get("collection_names"):
                specs.append(
                    {
                        "name": item.get("name"),
                        "type": "collection",
                        "collection_names": item["collection_names"],
                        "legacy": True,
                    }
                )
            else:
                specs.append(item)
        return specs
