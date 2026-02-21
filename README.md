# Open WebUI — Personal Fork

A personal fork of [Open WebUI](https://github.com/open-webui/open-webui) with several UX-focused additions layered on top of the upstream project.

> **Based on Open WebUI** — the extensible, self-hosted AI platform by [Timothy Jaeryang Baek](https://github.com/tjbck) and contributors. All core functionality, documentation, and licensing originate from that project. See [upstream repo](https://github.com/open-webui/open-webui) for full docs, Docker images, and community support.

---

## What's Different

### Chat Branching

Branch a conversation from any message — user or assistant — without touching the original chat.

- A **Branch** button appears in each message's action toolbar (hidden in temporary chats).
- The branch captures only the message path from the root up to the branch point, giving you a clean fork to explore.
- When viewing a branch, a navbar banner shows the source chat's title with two actions:
  - **Return** — go straight back to the original chat.
  - **Return with context** — formats the new messages from the branch into a markdown transcript and pre-fills the original chat's input with it. Only appears once new messages exist past the branch point.

### System Telemetry Panel

A collapsible **System Telemetry** section at the top of the Chat Controls pane (right sidebar). All data comes from existing message metadata — no backend changes required.

| Section | Details |
|---|---|
| **Generation speed** | Live tokens/second with a rolling sparkline (last 12 responses) |
| **Context window** | Token usage bar (prompt + completion vs. context limit); colour shifts green → amber → red as it fills |
| **Parameters** | Interactive sliders for Temperature, Top P, and Frequency Penalty — changes apply to the next message |
| **Session stats** | Per-message prompt / generated / total token counts |

Sections that have no data (e.g. when using an OpenAI-only backend without usage metadata) hide themselves automatically.

### Unified Add-ons Page

Replaces the separate **Tools** and **Skills** workspace tabs with a single **Add-ons** page at `/workspace/addons`. The page presents the full stack in one scrollable view:

| Layer | What it is |
|---|---|
| **Tools** | Atomic capabilities — API calls, code execution, etc. |
| **MCP Servers** | OpenAPI / MCP connections. Enable/disable toggle per server, type badge, inline configure/add/delete. |
| **Skills** | When/how to use tools and general behaviour shaping. |

Deep-links to the existing editors (`/workspace/tools/…`, `/workspace/skills/…`) continue to work — the Add-ons tab stays highlighted when you navigate into them.

### Folded Admin Settings

All admin configuration panels live inside the regular user **Settings** modal — no separate admin area, no role guards. The panels covered:

General · Connections · Models · Audio Backends · Images · Documents · Web Search · Interface · Pipelines · Tools

This is a deliberate single-user / trusted-install assumption. If you need role-based access control, use upstream Open WebUI.

---

## Running It

The quickest path is Docker, using the upstream image:

```bash
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

Then open [http://localhost:3000](http://localhost:3000).

For Ollama on a separate host, GPU support, pip install, Kubernetes, and everything else, see the [upstream documentation](https://docs.openwebui.com/getting-started/).

### Running from Source (this fork)

```bash
git clone <this-repo>
cd open-webui

# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
uvicorn open_webui.main:app --reload --port 8080
```

### Running Tests

```bash
# Unit tests (Vitest)
npm run test:frontend

# E2E tests (requires a running server on :3000)
npx cypress run --spec cypress/e2e/settings.cy.ts
```

---

## License

This fork inherits the upstream licensing. See [LICENSE](./LICENSE) and [LICENSE_HISTORY](./LICENSE_HISTORY) for full details.
