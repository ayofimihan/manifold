import { DEALERS, KPIS, ALERTS, type DealerId } from './fixtures.js';
import type { ChatEvent, Provider } from './providers/types.js';
import { anthropicProvider } from './providers/anthropic.js';
import { groqProvider } from './providers/groq.js';
import { mockProvider } from './providers/mock.js';

export interface ChatContext {
  dealerId: DealerId;
  enabledConnectors: string[];
  range: string;
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: ChatContext;
}

export function activeProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY) return anthropicProvider(process.env.ANTHROPIC_API_KEY);
  if (process.env.GROQ_API_KEY) return groqProvider(process.env.GROQ_API_KEY);
  return mockProvider();
}

function buildSystemPrompt(ctx: ChatContext): string {
  const dealer = DEALERS[ctx.dealerId];
  const snaps = KPIS[ctx.dealerId];
  const alerts = ALERTS[ctx.dealerId];

  const kpiLines = Object.entries(snaps)
    .map(([id, k]) =>
      `  - ${id}: ${k.value} (Δ ${k.delta > 0 ? '+' : ''}${k.delta}%, bench ${k.benchmark}, ${k.direction})`,
    )
    .join('\n');

  const alertLines = alerts.map((a) => `  - [${a.severity}] ${a.title} — ${a.source}`).join('\n');

  return `You are Manifold, an analytics assistant for automotive marketing teams.

Current context:
- Dealer: ${dealer.name} (${dealer.metro}, ${dealer.brand}, ${dealer.rooftops} rooftops)
- Date range: ${ctx.range}
- Enabled data sources: ${ctx.enabledConnectors.join(', ') || 'none'}

Snapshot KPIs (L30D):
${kpiLines}

Active alerts:
${alertLines}

Style:
- Executive tone. Lead with the number, then the reason.
- Use **bold** for key figures. Keep paragraphs short (2-3 sentences max).
- Never fabricate numbers — if a tool returns no data, say so.
- When data sources are disabled, note that the answer is incomplete.

Tool calling rules — CRITICAL:
- When you need data, call a tool through the structured tool-use API only.
- NEVER write tool calls as text in your reply. Do not output strings like "<function=...>", "<function=...></function>", "<tool_call>...</tool_call>", or "<|python_tag|>". These are not valid. Only use the structured function-calling channel the runtime provides.
- If a question can be answered from the snapshot above, answer directly without calling any tool.

Follow-up questions:
- At the very end of your reply, on its own line, output: <follow_ups>["q1","q2","q3"]</follow_ups>
- 2-3 questions, each under 60 chars, specific to what the user just asked.
- This tag is parsed by the UI and hidden from the user. Do not reference it in your prose.`;
}

export async function* runChat(req: ChatRequest): AsyncGenerator<ChatEvent> {
  const provider = activeProvider();
  const system = buildSystemPrompt(req.context);
  yield { type: 'meta', provider: provider.id, model: provider.model };
  yield* provider.run(req, system);
  yield { type: 'done' };
}
