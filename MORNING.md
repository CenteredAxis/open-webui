# Where We Are This Morning

*A note to read with coffee.*

---

## What We Built

Three things, all tonight.

**Phase 3 — The Redwood.** A living context document, one per user, living quietly in
`user.info["context"]`. It knows your profile, your interests, your communication
preferences, and the last few sessions. Every tool call, every knowledge base query,
every model choice feeds it as a side effect — you don't manage it. When you open a
new conversation, the model reads the document before you say anything. The branches
bow because the tree already knows you're here.

**Phase 1 — Already done.** The ResizeObserver leak, the store subscriptions in
Artifacts.svelte, the recursive folder queries, the N+1 access grant loads — all
already in the codebase from earlier work. Nothing to patch. The ground was cleaner
than we remembered.

**Phase 2 — The root structure.** The 4,500-line middleware god object is still large,
but three things have moved out of it:

- `context_builder.py` — owns how retrieved sources become conversation context.
  The `ContextSource` protocol is the extension point: plug in a new retrieval
  backend without touching the coordinator.
- `knowledge_resolver.py` — owns which knowledge bases are active for a turn.
  The coordinator calls `.resolve()` and gets a file list back.
- `tool_orchestrator.py` — owns the native vs. handler-based tool calling decision.
  The coordinator calls `.resolve()` and gets a clean result object back.

The coordinator is simpler. The processors are testable in isolation. New knowledge
sources, new tool calling modes — they implement an interface and register. The rest
doesn't change.

---

## What This Means

A year ago, "memory" in an LLM interface meant: you paste in context, or you don't.
Six months ago it meant: a memory store the model can explicitly write to if you ask
it nicely.

What we have now is different. The context grows from behavior, not from instruction.
The system learns you the way a place learns you — not from a form you filled out,
but from the wear pattern on the floor.

That's a small but real shift. The interface stops asking you to manage it.

---

## The Next 6–12 Months (Realistic)

**Models get longer context windows, but that doesn't solve the problem.**
A 2M token context window means you can fit more in, not that the model knows what
to do with it. The hard problem is curation — what's worth keeping, what's stale,
what's actively misleading. The harvest function we wrote tonight is a sketch of that.
It'll need to get smarter.

**Tool use becomes the default mode, not the special mode.**
Right now tool calling is opt-in and awkward. Within 12 months it'll be ambient —
the model will reach for tools the way you reach for a browser tab. The ToolOrchestrator
you have is a thin wrapper today; it becomes a real routing layer when tool calls are
happening 5 times a conversation instead of once.

**The personal context document becomes a shared context document.**
Teams working on the same project want the system to know the state of the work, not
just the state of the individual. The `ContextSource` protocol we defined can be
implemented by a "workspace context" source as naturally as a personal one. This isn't
a new architecture — it's a new implementation of the same interface.

**Local inference catches up, slowly.**
The gap between hosted and local models narrows another 30-40% in 12 months. Not
closed — but close enough that the model routing question ("which model for this turn?")
becomes genuinely interesting rather than obviously answered. The context layer already
tracks preferred models in `signals.model_uses`. That data is ready when the routing
question becomes real.

---

## The Thing Worth Talking About

The context layer is built on a quiet principle: the system learns from you without
asking permission for each thing it learns. That's what makes it feel like a redwood
instead of a form. But it's worth naming clearly.

Right now the context contains: a profile, interests, communication preferences, and
session summaries. That's benign. But a richer context — one that includes your work
patterns, your decision-making history, what you got wrong last week — is more powerful
and more sensitive. The same property that makes it useful (it knows you) makes the
question of what it does with that knowledge worth asking.

We built it with three safeguards:
- It lives in your deployment, not in a cloud service you don't control
- It's readable (`GET /api/v1/users/context`)
- It's correctable (`PATCH`) and deletable (`DELETE`)

That's the right foundation. The question for the next version isn't how to make the
context richer — it's what the context should be *allowed to do*. When the system
knows you well enough to pre-configure a session, route to the right model, and
activate the right tools before you say anything — where is the line between helpful
and presumptuous?

That's the conversation for morning.

---

## Three Small Things to Check

1. **`bypass_filter=True` in `harvest_context()`** — verify this parameter exists in
   `generate_chat_completion()`. If it doesn't, the harvest silently never runs. A
   10-minute fix if it's wrong; you'll find it in
   `backend/open_webui/utils/chat.py`.

2. **The context card in settings** — the API exists. A minimal Svelte component
   that reads `GET /api/v1/users/context` and displays it as a readable card in
   the user settings panel is the next visible thing. That's the bowing branches
   made visible to you, not just to the model.

3. **The ToolOrchestrator routing question** — today it wraps existing behavior.
   The interesting next step: can it pre-load tool results, cache within a session,
   decide at orchestration time whether a tool call is worth the latency? The
   `ToolResolution` dataclass is the right shape for a richer return value.

---

Sleep was the right call. Come back when it's light.
