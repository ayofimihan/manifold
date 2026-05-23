import { useMemo, useState } from 'react';
import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getCampaigns } from '@/data/campaigns';
import { Card } from '@/components/Card';
import { CampaignTable } from '@/components/CampaignTable';
import type { Channel } from '@/types';
import { fmt } from '@/lib/format';
import { CHANNEL_COLORS } from '@/data/channelMix';
import { cn } from '@/lib/cn';

const CHANNELS: Channel[] = ['Search', 'Social', 'Display', 'Video', 'Marketplace', 'OEM Co-op', 'Email'];

export function CampaignsPage() {
  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const [filter, setFilter] = useState<Channel | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');

  const all = getCampaigns(dealerId);
  const filtered = useMemo(
    () =>
      all.filter(
        (c) =>
          (filter === 'All' || c.channel === filter) &&
          (statusFilter === 'all' || c.status === statusFilter),
      ),
    [all, filter, statusFilter],
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (a, c) => ({
          spend: a.spend + c.spend,
          leads: a.leads + c.leads,
          conv: a.conv + c.conversions,
        }),
        { spend: 0, leads: 0, conv: 0 },
      ),
    [filtered],
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Campaigns</h1>
        <div className="num text-xs text-text-tertiary mt-1">{dealer.name} · L30D</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card padded>
          <div className="label-meta">Total Spend</div>
          <div className="num text-2xl mt-1 font-medium">{fmt.currency(totals.spend)}</div>
        </Card>
        <Card padded>
          <div className="label-meta">Leads</div>
          <div className="num text-2xl mt-1 font-medium">{fmt.number(totals.leads)}</div>
        </Card>
        <Card padded>
          <div className="label-meta">Conversions</div>
          <div className="num text-2xl mt-1 font-medium">{fmt.number(totals.conv)}</div>
        </Card>
        <Card padded>
          <div className="label-meta">Blended CPL</div>
          <div className="num text-2xl mt-1 font-medium">{fmt.currencyCents(totals.spend / Math.max(1, totals.leads))}</div>
        </Card>
      </div>

      <Card title="Filters" padded>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === 'All'} onClick={() => setFilter('All')}>All channels</FilterChip>
          {CHANNELS.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} color={CHANNEL_COLORS[c]}>
              {c}
            </FilterChip>
          ))}
          <div className="mx-2 self-stretch hairline-l hidden sm:block" />
          {(['all', 'active', 'paused', 'ended'] as const).map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All statuses' : s}
            </FilterChip>
          ))}
        </div>
      </Card>

      <Card title="All Campaigns" meta={`${filtered.length} of ${all.length}`} padded={false}>
        <CampaignTable campaigns={filtered} />
      </Card>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs hairline',
        active
          ? 'border-accent/50 bg-accent/10 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:border-border-muted',
      )}
    >
      {color && <span className="size-1.5" style={{ background: color }} />}
      <span>{children}</span>
    </button>
  );
}
