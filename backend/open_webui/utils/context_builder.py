"""
ContextBuilder — the stable interface for assembling conversation context.

Anything that produces source documents — RAG retrieval, tool results,
knowledge base queries, future graph searches — implements ContextSource.
ContextBuilder accumulates them and formats them into the message list via
the RAG template. The coordinator doesn't care where sources came from.

Extracted from apply_source_context_to_messages() in middleware.py.
That function is preserved here and re-exported so existing call sites
in middleware.py continue to work unchanged during the transition.
"""

from typing import Protocol, runtime_checkable
from fastapi import Request

from open_webui.env import RAG_SYSTEM_CONTEXT
from open_webui.utils.misc import (
    add_or_update_system_message,
    add_or_update_user_message,
)
from open_webui.utils.task import rag_template


##################################
#
# Protocol — the extension point
#
##################################


@runtime_checkable
class ContextSource(Protocol):
    """
    Anything that can contribute source documents to a conversation.

    Implement this to plug in new retrieval backends without touching
    the coordinator or the formatting logic:
    - RAG over a vector DB
    - Graph-based retrieval
    - External knowledge APIs
    - Personal memory stores
    """

    def as_source_dict(self) -> dict:
        """
        Return a source dict in the standard shape:
        {
          "source": {"id": "...", "name": "..."},
          "document": ["text of doc 1", "text of doc 2", ...],
          "metadata": [{"source": "doc_id_1"}, ...],
        }
        """
        ...


##################################
#
# ContextBuilder
#
##################################


class ContextBuilder:
    """
    Accumulates source contributions from multiple retrievers and formats
    them into conversation messages via the RAG template.

    Usage:
        ctx = ContextBuilder(request)
        ctx.extend_sources(rag_sources)          # from file retrieval
        ctx.extend_sources(tool_sources)         # from tool results
        messages = ctx.build_messages(messages, user_query)

    The coordinator adds sources; this class handles formatting.
    Swap the RAG template in config without touching the coordinator.
    """

    def __init__(self, request: Request):
        self._request = request
        self._sources: list[dict] = []

    def add_source(self, source: dict) -> None:
        """Add a single source dict."""
        self._sources.append(source)

    def extend_sources(self, sources: list[dict]) -> None:
        """Add multiple source dicts at once."""
        self._sources.extend(sources)

    @property
    def sources(self) -> list[dict]:
        return list(self._sources)

    @property
    def has_sources(self) -> bool:
        return bool(self._sources)

    def build_messages(self, messages: list, user_message: str) -> list:
        """
        Apply accumulated sources to the message list via the RAG template.
        Returns the original messages unchanged if no sources have been added.
        """
        if not self._sources or not user_message:
            return messages
        return apply_source_context_to_messages(
            self._request, messages, self._sources, user_message
        )


##################################
#
# Core formatting function
# (moved from middleware.py — re-exported for backward compatibility)
#
##################################


def apply_source_context_to_messages(
    request: Request,
    messages: list,
    sources: list,
    user_message: str,
) -> list:
    """
    Build source context from citation sources and apply to messages.
    Uses the RAG template (request.app.state.config.RAG_TEMPLATE) to
    format context for model consumption.

    Originally defined in middleware.py; moved here so the formatting
    logic is co-located with the ContextSource protocol and ContextBuilder.
    Middleware re-imports this to keep existing call sites unchanged.
    """
    if not sources or not user_message:
        return messages

    context_string = ""
    citation_idx: dict[str, int] = {}

    for source in sources:
        for doc, meta in zip(source.get("document", []), source.get("metadata", [])):
            src_id = (
                meta.get("source")
                or source.get("source", {}).get("id")
                or "N/A"
            )
            if src_id not in citation_idx:
                citation_idx[src_id] = len(citation_idx) + 1
            src_name = source.get("source", {}).get("name")
            context_string += (
                f'<source id="{citation_idx[src_id]}"'
                + (f' name="{src_name}"' if src_name else "")
                + f">{doc}</source>\n"
            )

    context_string = context_string.strip()
    if not context_string:
        return messages

    formatted = rag_template(
        request.app.state.config.RAG_TEMPLATE, context_string, user_message
    )

    if RAG_SYSTEM_CONTEXT:
        return add_or_update_system_message(formatted, messages, append=True)
    else:
        return add_or_update_user_message(formatted, messages, append=False)
