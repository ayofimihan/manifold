# Manifold

Portfolio analytics cockpit for automotive marketing. Unifies CRM, inventory, ad spend, web behavior, and OEM benchmarks into a single decision-grade surface — with a chat assistant that can query the data via tool calls.

## Stack

- **client** — React 18 + TypeScript + Vite + Tailwind + TanStack Query + Zustand + Recharts + React Router
- **server** — Hono on Node, Anthropic SDK with tool calling, SSE streaming
- **data** — fully simulated; 3 dealerships (A, B, C), 7 data sources, 90 days of daily KPI history, ~20 campaigns, ~15 alerts

## Run

```bash
npm install
cp .env.example .env
# Then add ONE of these to .env (or neither — see fallback below):
#   GROQ_API_KEY=…       free, no card, sign up at console.groq.com/keys
#   ANTHROPIC_API_KEY=…  paid, console.anthropic.com

npm run dev   # server (:8787) and client (:5173) run concurrently
```

Open http://localhost:5173.

## LLM provider fallback

The chat backend picks a provider at request time with this precedence:

| Order | Trigger | Model | Cost |
|---|---|---|---|
| 1 | `ANTHROPIC_API_KEY` set | `claude-sonnet-4-5` | paid |
| 2 | `GROQ_API_KEY` set | `llama-3.3-70b-versatile` | **free** |
| 3 | neither set | pattern-match mock | free, offline |

The chat drawer header shows which provider is active for the current session (`Claude` / `Groq` / `mock`).

Both real providers use the same tool definitions (`get_kpi_snapshot`, `list_campaigns`, `get_channel_mix`, `list_alerts`) and emit the same SSE event shape downstream — Anthropic via its native SDK, Groq via OpenAI-compatible REST. The mock streams a deterministic, pattern-matched answer so the UX still demos end-to-end with zero keys.

## Try

1. **Switch dealerships** — top-left dealer pill. Watch all KPIs, alerts, campaigns reload.
2. **Toggle data sources** — Connectors page. Watch the dashboard and AI context update.
3. **Press ⌘K** — opens the Ask Manifold drawer. Try:
   - *Why did leads drop this month?*
   - *Compare channel ROAS*
   - *Summarize marketing performance*
4. **Click a KPI tile** — opens KPI Explorer with channel breakdown + benchmark detail.
5. **Click an alert** — full narrative + suggested action.

## Architecture notes

- Data is hardcoded in `client/src/data/*` and `server/src/fixtures.ts`. Mirrored intentionally so client renders fast and server can answer LLM tool calls without re-traversing the client.
- Chat is a single POST `/api/chat` with SSE response. Events: `delta`, `tool_use`, `follow_ups`, `done`, `error`.
- LLM uses Anthropic tool calling. Tools: `get_kpi_snapshot`, `list_campaigns`, `get_channel_mix`, `list_alerts`. The agent never sees raw rows — only typed summaries.
- Theme is token-first Tailwind. Sharp edges (`rounded-none/sm`), hairline borders, monospace numbers, semantic colors for success/warn/danger.
- Responsive: sidebar collapses on mobile (sheet nav), ticker truncates, charts reflow.
