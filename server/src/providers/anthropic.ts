import Anthropic from '@anthropic-ai/sdk';
import type { ChatRequest } from '../chat.js';
import type { ChatEvent, Provider } from './types.js';
import { extractFollowUps } from './types.js';
import { TOOLS, runTool } from '../tools.js';
import type { DealerId } from '../fixtures.js';

export function anthropicProvider(apiKey: string): Provider {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  const client = new Anthropic({ apiKey });

  return {
    id: 'anthropic',
    model,
    async *run(req: ChatRequest, system: string): AsyncGenerator<ChatEvent> {
      let messages: Anthropic.MessageParam[] = req.messages.map((m) => ({ role: m.role, content: m.content }));
      let buffer = '';

      for (let turn = 0; turn < 4; turn++) {
        try {
          const stream = await client.messages.stream({
            model,
            max_tokens: 1500,
            system,
            tools: TOOLS as unknown as Anthropic.Tool[],
            messages,
          });

          const toolUses: { id: string; name: string; input: unknown }[] = [];

          for await (const evt of stream) {
            if (evt.type === 'content_block_start' && evt.content_block.type === 'tool_use') {
              yield {
                type: 'tool_use',
                name: evt.content_block.name,
                input: (evt.content_block as { input?: Record<string, unknown> }).input ?? {},
              };
            } else if (evt.type === 'content_block_delta' && evt.delta.type === 'text_delta') {
              buffer += evt.delta.text;
              yield { type: 'delta', text: evt.delta.text };
            }
          }

          const final = await stream.finalMessage();

          for (const block of final.content) {
            if (block.type === 'tool_use') {
              toolUses.push({ id: block.id, name: block.name, input: block.input });
            }
          }

          if (final.stop_reason !== 'tool_use' || toolUses.length === 0) {
            const fups = extractFollowUps(buffer);
            if (fups.length) yield { type: 'follow_ups', questions: fups };
            return;
          }

          messages = [
            ...messages,
            { role: 'assistant', content: final.content },
            {
              role: 'user',
              content: toolUses.map((t) => ({
                type: 'tool_result' as const,
                tool_use_id: t.id,
                content: JSON.stringify(
                  runTool(
                    t.name,
                    (t.input as Record<string, unknown>) ?? {},
                    req.context.dealerId as DealerId,
                    req.context.enabledConnectors,
                  ),
                ),
              })),
            },
          ];
        } catch (err) {
          yield { type: 'error', message: err instanceof Error ? err.message : 'unknown' };
          return;
        }
      }
    },
  };
}
