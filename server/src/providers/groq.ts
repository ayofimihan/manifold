import type { ChatRequest } from '../chat.js';
import type { ChatEvent, Provider } from './types.js';
import { extractFollowUps } from './types.js';
import { TOOLS, runTool } from '../tools.js';
import type { DealerId } from '../fixtures.js';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

type OAIMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string; tool_calls?: OAIToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string };

interface OAIToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

const openAITools = TOOLS.map((t) => ({
  type: 'function' as const,
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}));

export function groqProvider(apiKey: string): Provider {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  return {
    id: 'groq',
    model,
    async *run(req: ChatRequest, system: string): AsyncGenerator<ChatEvent> {
      const messages: OAIMessage[] = [
        { role: 'system', content: system },
        ...req.messages.map<OAIMessage>((m) => ({ role: m.role, content: m.content })),
      ];
      let textBuffer = '';

      for (let turn = 0; turn < 4; turn++) {
        let res: Response;
        try {
          res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              tools: openAITools,
              stream: true,
              temperature: 0.4,
              max_tokens: 1500,
            }),
          });
        } catch (err) {
          yield { type: 'error', message: err instanceof Error ? err.message : 'network error' };
          return;
        }

        if (!res.ok || !res.body) {
          const body = await safeRead(res);
          yield { type: 'error', message: `Groq ${res.status}: ${body.slice(0, 200)}` };
          return;
        }

        const collectedCalls = new Map<number, OAIToolCall>();
        let finishReason: string | null = null;
        let buffer = '';
        const decoder = new TextDecoder();
        const reader = res.body.getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx: number;
            while ((idx = buffer.indexOf('\n\n')) !== -1) {
              const raw = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);
              const line = raw.trim();
              if (!line.startsWith('data:')) continue;
              const payload = line.slice(5).trim();
              if (payload === '[DONE]') {
                finishReason = finishReason ?? 'stop';
                break;
              }
              let chunk: {
                choices?: {
                  delta?: { content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] };
                  finish_reason?: string | null;
                }[];
              };
              try { chunk = JSON.parse(payload); } catch { continue; }
              const choice = chunk.choices?.[0];
              if (!choice) continue;

              const content = choice.delta?.content;
              if (content) {
                textBuffer += content;
                yield { type: 'delta', text: content };
              }

              const toolDeltas = choice.delta?.tool_calls;
              if (toolDeltas) {
                for (const td of toolDeltas) {
                  const existing = collectedCalls.get(td.index) ?? {
                    id: td.id ?? `call_${td.index}`,
                    type: 'function' as const,
                    function: { name: '', arguments: '' },
                  };
                  if (td.id) existing.id = td.id;
                  if (td.function?.name) existing.function.name = td.function.name;
                  if (td.function?.arguments) existing.function.arguments += td.function.arguments;
                  collectedCalls.set(td.index, existing);
                }
              }

              if (choice.finish_reason) finishReason = choice.finish_reason;
            }
          }
        } catch (err) {
          yield { type: 'error', message: err instanceof Error ? err.message : 'stream error' };
          return;
        }

        if (finishReason !== 'tool_calls' || collectedCalls.size === 0) {
          const fups = extractFollowUps(textBuffer);
          if (fups.length) yield { type: 'follow_ups', questions: fups };
          return;
        }

        const calls = Array.from(collectedCalls.values()).sort((a, b) => a.id.localeCompare(b.id));

        messages.push({ role: 'assistant', content: '', tool_calls: calls });

        for (const call of calls) {
          let parsed: Record<string, unknown> = {};
          try {
            const raw = JSON.parse(call.function.arguments || '{}');
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) parsed = raw as Record<string, unknown>;
          } catch {
            parsed = {};
          }
          yield { type: 'tool_use', name: call.function.name, input: parsed };
          const result = runTool(call.function.name, parsed, req.context.dealerId as DealerId, req.context.enabledConnectors);
          messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
        }
      }
    },
  };
}

async function safeRead(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}
