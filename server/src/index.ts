import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { streamSSE } from 'hono/streaming';
import { runChat, type ChatRequest } from './chat.js';

const app = new Hono();
app.use('*', cors());

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    live: !!process.env.ANTHROPIC_API_KEY,
  }),
);

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
console.log(`[manifold] server listening on http://localhost:${port}`);
console.log(`[manifold] anthropic live: ${!!process.env.ANTHROPIC_API_KEY}`);
