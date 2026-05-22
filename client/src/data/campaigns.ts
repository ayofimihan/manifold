import type { Campaign, Channel, DealerId } from '@/types';

function trend(seed: number, len: number, base: number, noise: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < len; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(Math.max(0, base + ((s / 233280 - 0.5) * 2) * noise + Math.sin(i / 3) * noise * 0.4));
  }
  return out;
}

interface CampaignSeed {
  name: string;
  channel: Channel;
  status: Campaign['status'];
  spend: number;
  leads: number;
  conversions: number;
  startedAt: string;
  seed: number;
}

const A: CampaignSeed[] = [
  { name: 'Spring Sales Event — Search', channel: 'Search', status: 'active', spend: 18420, leads: 612, conversions: 73, startedAt: '2026-03-04', seed: 11 },
  { name: 'Used SUV Inventory — Meta', channel: 'Social', status: 'active', spend: 12860, leads: 488, conversions: 41, startedAt: '2026-02-18', seed: 13 },
  { name: 'Service Retention — Email', channel: 'Email', status: 'active', spend: 2140, leads: 196, conversions: 38, startedAt: '2026-01-12', seed: 17 },
  { name: 'Toyota Co-op Q2', channel: 'OEM Co-op', status: 'active', spend: 21300, leads: 540, conversions: 64, startedAt: '2026-04-01', seed: 19 },
  { name: 'YouTube Pre-roll — Trucks', channel: 'Video', status: 'paused', spend: 7820, leads: 142, conversions: 9, startedAt: '2026-03-22', seed: 23 },
  { name: 'Cars.com VDP Boost', channel: 'Marketplace', status: 'active', spend: 9640, leads: 314, conversions: 31, startedAt: '2026-02-05', seed: 29 },
  { name: 'Display Remarketing', channel: 'Display', status: 'active', spend: 4380, leads: 82, conversions: 6, startedAt: '2026-01-22', seed: 31 },
];

const B: CampaignSeed[] = [
  { name: 'Honda Loyalty — Search', channel: 'Search', status: 'active', spend: 22140, leads: 482, conversions: 38, startedAt: '2026-03-10', seed: 37 },
  { name: 'Display Remarketing (Q2)', channel: 'Display', status: 'active', spend: 8200, leads: 96, conversions: 5, startedAt: '2026-04-02', seed: 41 },
  { name: 'Used Cars — Meta Carousel', channel: 'Social', status: 'paused', spend: 11460, leads: 318, conversions: 21, startedAt: '2026-02-28', seed: 43 },
  { name: 'Service Drive — Email Drip', channel: 'Email', status: 'active', spend: 1860, leads: 112, conversions: 19, startedAt: '2026-01-08', seed: 47 },
  { name: 'Autotrader Premium Listings', channel: 'Marketplace', status: 'active', spend: 14820, leads: 376, conversions: 28, startedAt: '2026-02-12', seed: 53 },
  { name: 'TikTok Awareness — Trucks', channel: 'Video', status: 'active', spend: 9320, leads: 184, conversions: 8, startedAt: '2026-03-18', seed: 59 },
  { name: 'OEM Tier 2 — Toyota', channel: 'OEM Co-op', status: 'ended', spend: 17640, leads: 412, conversions: 36, startedAt: '2026-01-04', seed: 61 },
];

const C: CampaignSeed[] = [
  { name: 'Ford F-150 Launch — Search', channel: 'Search', status: 'active', spend: 28640, leads: 824, conversions: 96, startedAt: '2026-03-15', seed: 67 },
  { name: 'Lincoln Luxury — Display', channel: 'Display', status: 'active', spend: 6420, leads: 138, conversions: 12, startedAt: '2026-02-10', seed: 71 },
  { name: 'Pre-owned Trucks — Meta', channel: 'Social', status: 'active', spend: 14260, leads: 522, conversions: 47, startedAt: '2026-02-22', seed: 73 },
  { name: 'YouTube — Mustang Mach-E', channel: 'Video', status: 'active', spend: 11820, leads: 246, conversions: 18, startedAt: '2026-03-01', seed: 79 },
  { name: 'Ford Co-op Q2', channel: 'OEM Co-op', status: 'active', spend: 24380, leads: 698, conversions: 82, startedAt: '2026-04-01', seed: 83 },
  { name: 'Cars.com Listings', channel: 'Marketplace', status: 'active', spend: 12640, leads: 412, conversions: 39, startedAt: '2026-01-18', seed: 89 },
  { name: 'Service Reminder — Email', channel: 'Email', status: 'active', spend: 1980, leads: 218, conversions: 41, startedAt: '2026-01-04', seed: 97 },
];

function build(seeds: CampaignSeed[], dealerId: DealerId): Campaign[] {
  return seeds.map((s, i) => ({
    id: `${dealerId}_cmp_${i + 1}`.toUpperCase(),
    name: s.name,
    channel: s.channel,
    status: s.status,
    spend: s.spend,
    leads: s.leads,
    cpl: +(s.spend / Math.max(1, s.leads)).toFixed(2),
    conversions: s.conversions,
    roas: +((s.conversions * 2850) / Math.max(1, s.spend)).toFixed(2),
    trend: trend(s.seed, 30, s.leads / 30, (s.leads / 30) * 0.35),
    startedAt: s.startedAt,
  }));
}

export const CAMPAIGNS: Record<DealerId, Campaign[]> = {
  dlr_a: build(A, 'dlr_a'),
  dlr_b: build(B, 'dlr_b'),
  dlr_c: build(C, 'dlr_c'),
};

export function getCampaigns(dealerId: DealerId): Campaign[] {
  return CAMPAIGNS[dealerId];
}
