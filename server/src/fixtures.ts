export type DealerId = 'dlr_a' | 'dlr_b' | 'dlr_c';

export const DEALERS = {
  dlr_a: { name: 'Clement Pre-Owned', metro: 'St. Louis, MO', brand: 'Multi-franchise', rooftops: 4 },
  dlr_b: { name: 'TKO Auto Group', metro: 'Atlanta, GA', brand: 'Toyota / Honda', rooftops: 3 },
  dlr_c: { name: 'Apex Motors', metro: 'Dallas, TX', brand: 'Ford / Lincoln', rooftops: 5 },
};

export const KPIS: Record<DealerId, Record<string, { value: number; delta: number; benchmark: number; unit: string; direction: string }>> = {
  dlr_a: {
    cost_per_lead: { value: 32.4, delta: -3.6, benchmark: 38.0, unit: 'currency', direction: 'lower_is_better' },
    lead_to_deal: { value: 14.1, delta: 2.8, benchmark: 12.5, unit: 'percent', direction: 'higher_is_better' },
    gross_per_vin: { value: 2840, delta: 2.1, benchmark: 2600, unit: 'currency', direction: 'higher_is_better' },
    vdp_to_lead: { value: 3.6, delta: 1.4, benchmark: 3.1, unit: 'percent', direction: 'higher_is_better' },
    days_to_turn: { value: 41, delta: -2.4, benchmark: 47, unit: 'days', direction: 'lower_is_better' },
  },
  dlr_b: {
    cost_per_lead: { value: 41.7, delta: 5.5, benchmark: 38.0, unit: 'currency', direction: 'lower_is_better' },
    lead_to_deal: { value: 9.4, delta: -3.1, benchmark: 12.5, unit: 'percent', direction: 'higher_is_better' },
    gross_per_vin: { value: 2210, delta: -1.8, benchmark: 2600, unit: 'currency', direction: 'higher_is_better' },
    vdp_to_lead: { value: 2.4, delta: -3.3, benchmark: 3.1, unit: 'percent', direction: 'higher_is_better' },
    days_to_turn: { value: 54, delta: 2.8, benchmark: 47, unit: 'days', direction: 'lower_is_better' },
  },
  dlr_c: {
    cost_per_lead: { value: 36.1, delta: 1.1, benchmark: 38.0, unit: 'currency', direction: 'lower_is_better' },
    lead_to_deal: { value: 11.8, delta: 1.6, benchmark: 12.5, unit: 'percent', direction: 'higher_is_better' },
    gross_per_vin: { value: 2705, delta: 1.1, benchmark: 2600, unit: 'currency', direction: 'higher_is_better' },
    vdp_to_lead: { value: 3.0, delta: 0.7, benchmark: 3.1, unit: 'percent', direction: 'higher_is_better' },
    days_to_turn: { value: 46, delta: -0.9, benchmark: 47, unit: 'days', direction: 'lower_is_better' },
  },
};

interface CampaignRow {
  id: string; name: string; channel: string; status: string;
  spend: number; leads: number; cpl: number; conversions: number; roas: number;
}

function build(seeds: Omit<CampaignRow, 'id' | 'cpl' | 'roas'>[], prefix: string): CampaignRow[] {
  return seeds.map((s, i) => ({
    id: `${prefix}_${i + 1}`.toUpperCase(),
    ...s,
    cpl: +(s.spend / Math.max(1, s.leads)).toFixed(2),
    roas: +((s.conversions * 2850) / Math.max(1, s.spend)).toFixed(2),
  }));
}

export const CAMPAIGNS: Record<DealerId, CampaignRow[]> = {
  dlr_a: build([
    { name: 'Spring Sales Event — Search', channel: 'Search', status: 'active', spend: 18420, leads: 612, conversions: 73 },
    { name: 'Used SUV Inventory — Meta', channel: 'Social', status: 'active', spend: 12860, leads: 488, conversions: 41 },
    { name: 'Service Retention — Email', channel: 'Email', status: 'active', spend: 2140, leads: 196, conversions: 38 },
    { name: 'Toyota Co-op Q2', channel: 'OEM Co-op', status: 'active', spend: 21300, leads: 540, conversions: 64 },
    { name: 'YouTube Pre-roll — Trucks', channel: 'Video', status: 'paused', spend: 7820, leads: 142, conversions: 9 },
    { name: 'Cars.com VDP Boost', channel: 'Marketplace', status: 'active', spend: 9640, leads: 314, conversions: 31 },
    { name: 'Display Remarketing', channel: 'Display', status: 'active', spend: 4380, leads: 82, conversions: 6 },
  ], 'dlr_a_cmp'),
  dlr_b: build([
    { name: 'Honda Loyalty — Search', channel: 'Search', status: 'active', spend: 22140, leads: 482, conversions: 38 },
    { name: 'Display Remarketing (Q2)', channel: 'Display', status: 'active', spend: 8200, leads: 96, conversions: 5 },
    { name: 'Used Cars — Meta Carousel', channel: 'Social', status: 'paused', spend: 11460, leads: 318, conversions: 21 },
    { name: 'Service Drive — Email Drip', channel: 'Email', status: 'active', spend: 1860, leads: 112, conversions: 19 },
    { name: 'Autotrader Premium Listings', channel: 'Marketplace', status: 'active', spend: 14820, leads: 376, conversions: 28 },
    { name: 'TikTok Awareness — Trucks', channel: 'Video', status: 'active', spend: 9320, leads: 184, conversions: 8 },
    { name: 'OEM Tier 2 — Toyota', channel: 'OEM Co-op', status: 'ended', spend: 17640, leads: 412, conversions: 36 },
  ], 'dlr_b_cmp'),
  dlr_c: build([
    { name: 'Ford F-150 Launch — Search', channel: 'Search', status: 'active', spend: 28640, leads: 824, conversions: 96 },
    { name: 'Lincoln Luxury — Display', channel: 'Display', status: 'active', spend: 6420, leads: 138, conversions: 12 },
    { name: 'Pre-owned Trucks — Meta', channel: 'Social', status: 'active', spend: 14260, leads: 522, conversions: 47 },
    { name: 'YouTube — Mustang Mach-E', channel: 'Video', status: 'active', spend: 11820, leads: 246, conversions: 18 },
    { name: 'Ford Co-op Q2', channel: 'OEM Co-op', status: 'active', spend: 24380, leads: 698, conversions: 82 },
    { name: 'Cars.com Listings', channel: 'Marketplace', status: 'active', spend: 12640, leads: 412, conversions: 39 },
    { name: 'Service Reminder — Email', channel: 'Email', status: 'active', spend: 1980, leads: 218, conversions: 41 },
  ], 'dlr_c_cmp'),
};

export const ALERTS: Record<DealerId, { id: string; title: string; severity: string; source: string; delta: number; narrative: string; action: string }[]> = {
  dlr_a: [
    { id: 'alr_a_1', title: 'Display CPL up 38% week-over-week', severity: 'warning', source: 'Google Ads', delta: 38, narrative: 'Display CPL jumped from $34.10 to $47.20 between May 16 and May 23. Creative fatigue on Spring Sales Event set.', action: 'Rotate creative; reallocate $4.2k to Search.' },
    { id: 'alr_a_2', title: 'F-150 inventory 22 days over target turn', severity: 'critical', source: 'DMS', delta: 47, narrative: '14 F-150 units sat 60+ days. Dragging Gross/VIN down 4.2%.', action: 'Trigger price tier 2; marketplace boost.' },
    { id: 'alr_a_3', title: 'Service-defection risk: 142 owners', severity: 'warning', source: 'CRM', delta: 12, narrative: '142 owners past expected service interval. $96k projected RO revenue at risk.', action: 'Trigger service reminder drip + SMS.' },
  ],
  dlr_b: [
    { id: 'alr_b_1', title: 'Lead volume down 14.3% MTD', severity: 'critical', source: 'CRM', delta: -14.3, narrative: 'Lead volume MTD -14.3%. Display -38%, Search -2%, Social -5%. Market only down 3%. Dealer-specific.', action: 'Refresh Display creative; investigate Meta Carousel pause.' },
    { id: 'alr_b_2', title: 'CPL 9.7% above benchmark', severity: 'warning', source: 'Google Ads', delta: 9.7, narrative: 'Blended CPL $41.70 vs benchmark $38.', action: 'Audit non-brand Search queries; pause weak placements.' },
    { id: 'alr_b_3', title: 'Meta connector sync failed', severity: 'critical', source: 'Meta Ads', delta: 0, narrative: 'Meta Insights API returned 401. Data stale 14h.', action: 'Rotate access token in Connectors.' },
  ],
  dlr_c: [
    { id: 'alr_c_1', title: 'F-150 launch hitting ROAS targets', severity: 'info', source: 'Google Ads', delta: 18, narrative: 'F-150 Launch — Search generating $9.55 ROAS, 18% above target.', action: 'Increase budget +$400/day; expand audience.' },
    { id: 'alr_c_2', title: 'Lincoln Display CPL spike', severity: 'warning', source: 'Google Ads', delta: 28, narrative: 'Lincoln Luxury Display CPL up 28% L7D. Frequency cap exceeded.', action: 'Lower frequency cap to 3/day; refresh creative.' },
  ],
};
