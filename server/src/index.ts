import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { streamSSE } from 'hono/streaming';
import { loadEnv } from './env.js';

const envPath = loadEnv();

import { runChat, activeProvider, type ChatRequest } from './chat.js';

const app = new Hono();
app.use('*', cors());

app.get('/health', (c) => {
  const p = activeProvider();
  return c.json({ status: 'ok', provider: p.id, model: p.model, live: p.id !== 'mock' });
});

app.post('/api/chat', async (c) => {
  const body = (await c.req.json()) as ChatRequest;
  return streamSSE(c, async (stream) => {
    try {
      for await (const evt of runChat(body)) {
        await stream.writeSSE({ data: JSON.stringify(evt) });
      }
    } catch (err) {
      await stream.writeSSE({
        data: JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : 'stream error' }),
      });
    }
  });
});

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port });
const provider = activeProvider();
console.log(`[manifold] server listening on http://localhost:${port}`);
console.log(`[manifold] env: ${envPath ?? 'no .env loaded (using process env only)'}`);
console.log(`[manifold] provider: ${provider.id} (${provider.model})`);
