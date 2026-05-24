# Manifold

Portfolio analytics cockpit for automotive marketing. Unifies CRM, inventory, ad spend, web behavior, and OEM benchmarks into a single decision-grade surface — with a chat assistant that can query the data via tool calls.

## Stack

- **client** — React 18 + TypeScript + Vite + Chakra + Tailwind + TanStack Query + Zustand + Recharts + React Router
- **server** — Hono on Node, Anthropic SDK with tool calling, SSE streaming
- **data** — fully simulated; 3 dealerships (A, B, C), 7 data sources, 90 days of daily KPI history, campaigns, alerts etcc

## Run

```bash
npm install
cp .env.example .env
# Then add ONE of these to .env (or neither — see fallback below):
#   GROQ_API_KEY=…
#   ANTHROPIC_API_KEY=…

npm run dev   # server (:8787) and client (:5173) run concurrently
```

Open http://localhost:5173.
