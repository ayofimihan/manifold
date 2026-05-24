import Anthropic from '@anthropic-ai/sdk';
import { DEALERS, KPIS, ALERTS, type DealerId } from './fixtures.js';
import { TOOLS, runTool } from './tools.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

export interface ChatContext {
  dealerId: DealerId;
  enabledConnectors: string[];
  range: string;
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: ChatContext;
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
- Use tools when the user asks about specific KPIs, campaigns, channels, or alerts in detail.
- Never fabricate numbers — if a tool returns no data, say so.
- When data sources are disabled, note that the answer is incomplete.
- After your answer, propose 2-3 short follow-up questions inside a JSON block tagged like:
  <follow_ups>["q1","q2","q3"]</follow_ups>
  These should be specific to the user's question and the data you returned. Keep each under 60 chars.`;
}

export async function* runChat(req: ChatRequest): AsyncGenerator<
  | { type: 'delta'; text: string }
  | { type: 'tool_use'; name: string; input: Record<string, unknown> }
  | { type: 'follow_ups'; questions: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string }
> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    yield* mockChat(req);
    yield { type: 'done' };
    return;
  }

  const client = new Anthropic({ apiKey });
  const system = buildSystemPrompt(req.context);
  let messages: Anthropic.MessageParam[] = req.messages.map((m) => ({ role: m.role, content: m.content }));

  let buffer = '';

  for (let turn = 0; turn < 4; turn++) {
    try {
      const stream = await client.messages.stream({
        model: ANTHROPIC_MODEL,
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
        yield { type: 'done' };
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
              runTool(t.name, (t.input as Record<string, unknown>) ?? {}, req.context.dealerId as DealerId, req.context.enabledConnectors),
            ),
          })),
        },
      ];
    } catch (err) {
      yield { type: 'error', message: err instanceof Error ? err.message : 'unknown' };
      yield { type: 'done' };
      return;
    }
  }

  yield { type: 'done' };
}

function extractFollowUps(text: string): string[] {
  const m = text.match(/<follow_ups>(.*?)<\/follow_ups>/s);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[1]);
    return Array.isArray(arr) ? arr.slice(0, 3) : [];
  } catch {
    return [];
  }
}

async function* mockChat(req: ChatRequest): AsyncGenerator<{ type: 'delta'; text: string } | { type: 'tool_use'; name: string; input: Record<string, unknown> } | { type: 'follow_ups'; questions: string[] }> {
  const last = req.messages[req.messages.length - 1]?.content ?? '';
  const dealer = DEALERS[req.context.dealerId];
  const snaps = KPIS[req.context.dealerId];
  const alerts = ALERTS[req.context.dealerId];
  const lower = last.toLowerCase();

  yield { type: 'tool_use', name: 'get_kpi_snapshot', input: { kpi_id: 'cost_per_lead' } };

  let answer = '';
  if (lower.includes('why') && (lower.includes('lead') || lower.includes('drop'))) {
    yield { type: 'tool_use', name: 'list_alerts', input: { severity: 'critical' } };
    const top = alerts.find((a) => a.severity === 'critical') ?? alerts[0];
    answer = `Leads at **${dealer.name}** are tracking ${snaps.cost_per_lead.delta > 0 ? '+' : ''}${snaps.cost_per_lead.delta}% on CPL with current value **$${snaps.cost_per_lead.value}**.

The dominant driver is the active alert: **${top.title}**. ${top.narrative}

**Suggested action:** ${top.action}

<follow_ups>["Show channel breakdown","Compare to OEM benchmark","Top campaigns by ROAS"]</follow_ups>`;
  } else if (lower.includes('compare') || lower.includes('channel')) {
    yield { type: 'tool_use', name: 'get_channel_mix', input: {} };
    answer = `Across ${dealer.name}, **Search** and **OEM Co-op** lead spend share, while **Display** is trailing ROAS.

Top KPIs:
- Cost per Lead: **$${snaps.cost_per_lead.value}** (${snaps.cost_per_lead.delta > 0 ? '+' : ''}${snaps.cost_per_lead.delta}% vs prior period)
- Lead-to-Deal: **${snaps.lead_to_deal.value}%**
- Gross/VIN: **$${snaps.gross_per_vin.value}**

<follow_ups>["Why is Display underperforming?","Suggest reallocations","Show ROAS trend"]</follow_ups>`;
  } else if (lower.includes('summar') || lower.includes('brief')) {
    answer = `**${dealer.name}** L30D summary:
- CPL **$${snaps.cost_per_lead.value}** vs bench $${snaps.cost_per_lead.benchmark}
- Lead-to-Deal **${snaps.lead_to_deal.value}%**
- Gross/VIN **$${snaps.gross_per_vin.value}**
- Days to Turn **${snaps.days_to_turn.value}d**

${alerts.length} active alerts; ${alerts.filter((a) => a.severity === 'critical').length} critical.

<follow_ups>["Show critical alerts","Top campaigns","Where to reallocate spend?"]</follow_ups>`;
  } else {
    answer = `For ${dealer.name}, current CPL is **$${snaps.cost_per_lead.value}** vs benchmark $${snaps.cost_per_lead.benchmark}.

Set ANTHROPIC_API_KEY in the server .env to enable full chat with tool calling. This is the mock fallback.

<follow_ups>["Why did leads drop?","Compare channels","Summarize performance"]</follow_ups>`;
  }

  for (const char of answer) {
    yield { type: 'delta', text: char };
    await sleep(8);
  }
  const fups = extractFollowUps(answer);
  if (fups.length) yield { type: 'follow_ups', questions: fups };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
