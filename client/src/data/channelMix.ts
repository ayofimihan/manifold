import type { Channel, ChannelMixRow, DealerId } from '@/types';
import { getCampaigns } from './campaigns';

export function getChannelMix(dealerId: DealerId, enabledChannels?: Set<Channel>): ChannelMixRow[] {
  const camps = getCampaigns(dealerId).filter((c) =>
    enabledChannels ? enabledChannels.has(c.channel) : true,
  );
  const totals = new Map<Channel, { spend: number; leads: number }>();
  for (const c of camps) {
    const t = totals.get(c.channel) ?? { spend: 0, leads: 0 };
    t.spend += c.spend;
    t.leads += c.leads;
    totals.set(c.channel, t);
  }
  const totalSpend = camps.reduce((a, b) => a + b.spend, 0);
  const rows: ChannelMixRow[] = [];
  for (const [channel, t] of totals.entries()) {
    rows.push({
      channel,
      spend: t.spend,
      leads: t.leads,
      share: totalSpend > 0 ? t.spend / totalSpend : 0,
    });
  }
  return rows.sort((a, b) => b.spend - a.spend);
}

export const CHANNEL_COLORS: Record<Channel, string> = {
  Search: '#2DD4BF',
  Social: '#A78BFA',
  Display: '#F59E0B',
  Video: '#EF4444',
  Marketplace: '#3B82F6',
  'OEM Co-op': '#22C55E',
  Email: '#EC4899',
};
