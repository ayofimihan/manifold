export type DealerId = 'dlr_a' | 'dlr_b' | 'dlr_c';

export interface Dealer {
  id: DealerId;
  name: string;
  shortName: string;
  metro: string;
  brand: string;
  rooftops: number;
  color: string;
}

export type ConnectorId =
  | 'google_ads'
  | 'meta_ads'
  | 'ga4'
  | 'crm'
  | 'dms'
  | 'inventory'
  | 'oem';

export interface Connector {
  id: ConnectorId;
  name: string;
  category: 'Media' | 'Web' | 'CRM' | 'DMS' | 'Inventory' | 'OEM';
  description: string;
  enabled: boolean;
  status: 'healthy' | 'degraded' | 'failed' | 'paused';
  lastSyncedAt: string;
  cadence: string;
  rows24h: number;
}

export type KpiId =
  | 'cost_per_lead'
  | 'lead_to_deal'
  | 'gross_per_vin'
  | 'vdp_to_lead'
  | 'days_to_turn';

export type KpiDirection = 'higher_is_better' | 'lower_is_better';
export type KpiUnit = 'currency' | 'percent' | 'number' | 'days';

export interface KpiDef {
  id: KpiId;
  label: string;
  unit: KpiUnit;
  direction: KpiDirection;
  description: string;
}

export interface KpiSnapshot {
  kpiId: KpiId;
  value: number;
  delta: number;
  benchmark: number;
  series: number[];
}

export type Channel = 'Search' | 'Social' | 'Display' | 'Video' | 'Marketplace' | 'OEM Co-op' | 'Email';

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: 'active' | 'paused' | 'ended';
  spend: number;
  leads: number;
  cpl: number;
  conversions: number;
  roas: number;
  trend: number[];
  startedAt: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  source: string;
  createdAt: string;
  delta: number;
  narrative: string;
  suggestedAction: string;
  status: 'active' | 'snoozed' | 'resolved';
}

export interface ChannelMixRow {
  channel: Channel;
  spend: number;
  leads: number;
  share: number;
}

export interface TickerItem {
  label: string;
  value: string;
  delta?: number;
  tone?: 'up' | 'down' | 'neutral';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; input: Record<string, unknown> }[];
  followUps?: string[];
  createdAt: number;
}
