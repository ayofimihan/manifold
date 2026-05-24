import { ALERTS, CAMPAIGNS, DEALERS, KPIS, type DealerId } from './fixtures.js';

export const TOOLS = [
  {
    name: 'get_kpi_snapshot',
    description: 'Get current value, delta, and OEM franchise benchmark for a specific KPI. Use this whenever the user asks about a specific metric.',
    input_schema: {
      type: 'object',
      properties: {
        kpi_id: {
          type: 'string',
          enum: ['cost_per_lead', 'lead_to_deal', 'gross_per_vin', 'vdp_to_lead', 'days_to_turn'],
        },
      },
      required: ['kpi_id'],
    },
  },
  {
    name: 'list_campaigns',
    description: 'List campaigns with spend, leads, CPL, ROAS. Optionally filter by channel or status. Use for questions about specific campaigns or channel performance.',
    input_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string' },
        status: { type: 'string', enum: ['active', 'paused', 'ended'] },
        sort_by: { type: 'string', enum: ['spend', 'leads', 'cpl', 'roas'] },
        top_n: { type: 'number' },
      },
    },
  },
  {
    name: 'get_channel_mix',
    description: 'Get aggregated spend and leads per channel for the current dealership and date range.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'list_alerts',
    description: 'List active alerts for the current dealership. Optionally filter by severity.',
    input_schema: {
      type: 'object',
      properties: { severity: { type: 'string', enum: ['critical', 'warning', 'info'] } },
    },
  },
];

export function runTool(
  name: string,
  input: Record<string, unknown>,
  dealerId: DealerId,
  enabledSources: string[],
): unknown {
  switch (name) {
    case 'get_kpi_snapshot': {
      const kpi = String(input.kpi_id);
      const snap = KPIS[dealerId][kpi];
      if (!snap) return { error: `Unknown KPI: ${kpi}` };
      return { kpi_id: kpi, dealer: DEALERS[dealerId].name, ...snap };
    }
    case 'list_campaigns': {
      const enabledChannels = sourceChannels(enabledSources);
      let list = CAMPAIGNS[dealerId].filter((c) => enabledChannels.has(c.channel.toLowerCase()) || true);
      if (input.channel) list = list.filter((c) => c.channel === input.channel);
      if (input.status) list = list.filter((c) => c.status === input.status);
      const sortBy = (input.sort_by as keyof (typeof list)[number]) || 'spend';
      list = [...list].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));
      if (typeof input.top_n === 'number') list = list.slice(0, input.top_n);
      return { dealer: DEALERS[dealerId].name, count: list.length, campaigns: list };
    }
    case 'get_channel_mix': {
      const totals = new Map<string, { spend: number; leads: number }>();
      for (const c of CAMPAIGNS[dealerId]) {
        const t = totals.get(c.channel) ?? { spend: 0, leads: 0 };
        t.spend += c.spend;
        t.leads += c.leads;
        totals.set(c.channel, t);
      }
      const totalSpend = Array.from(totals.values()).reduce((a, b) => a + b.spend, 0);
      const rows = Array.from(totals.entries())
        .map(([channel, t]) => ({
          channel,
          spend: t.spend,
          leads: t.leads,
          share: +((t.spend / totalSpend) * 100).toFixed(1),
        }))
        .sort((a, b) => b.spend - a.spend);
      return { dealer: DEALERS[dealerId].name, total_spend: totalSpend, channels: rows };
    }
    case 'list_alerts': {
      let list = ALERTS[dealerId];
      if (input.severity) list = list.filter((a) => a.severity === input.severity);
      return { dealer: DEALERS[dealerId].name, alerts: list };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function sourceChannels(_enabled: string[]): Set<string> {
  return new Set(['search', 'social', 'display', 'video', 'marketplace', 'oem co-op', 'email']);
}
