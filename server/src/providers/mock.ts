import type { ChatRequest } from '../chat.js';
import type { ChatEvent, Provider } from './types.js';
import { extractFollowUps } from './types.js';
import { ALERTS, DEALERS, KPIS } from '../fixtures.js';

export function mockProvider(): Provider {
  return {
    id: 'mock',
    model: 'pattern-match',
    async *run(req: ChatRequest): AsyncGenerator<ChatEvent> {
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

Set GROQ_API_KEY (free) or ANTHROPIC_API_KEY to enable real chat with tool calling. This is the mock fallback.

<follow_ups>["Why did leads drop?","Compare channels","Summarize performance"]</follow_ups>`;
      }

      for (const char of answer) {
        yield { type: 'delta', text: char };
        await new Promise((r) => setTimeout(r, 8));
      }
      const fups = extractFollowUps(answer);
      if (fups.length) yield { type: 'follow_ups', questions: fups };
    },
  };
}
