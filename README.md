# Manifold

Portfolio analytics cockpit for automotive marketing. Unifies CRM, inventory, ad spend, web behavior, and OEM benchmarks into a single surface.

## Stack

- React 18 + TypeScript + Vite + Tailwind
- TanStack Query + Zustand + Recharts + React Router
- Hono on Node for the chat backend
- Anthropic SDK with tool calling

## Run

```bash
npm install
cp .env.example .env
# add ANTHROPIC_API_KEY for the live chat backend

npm run dev   # server :8787 and client :5173 concurrently
```

Open http://localhost:5173.
