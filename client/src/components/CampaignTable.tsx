import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { Campaign } from '@/types';
import { fmt } from '@/lib/format';
import { Sparkline } from './Sparkline';
import { StatusPill } from './StatusPill';
import { CHANNEL_COLORS } from '@/data/channelMix';
import { cn } from '@/lib/cn';

type SortKey = 'name' | 'channel' | 'spend' | 'leads' | 'cpl' | 'roas';

export function CampaignTable({ campaigns, dense = false }: { campaigns: Campaign[]; dense?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...campaigns].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'string' && typeof bv === 'string') {
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return dir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function onSort(k: SortKey) {
    if (k === sortKey) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setDir('desc');
    }
  }

  const header = (label: string, k: SortKey, align: 'left' | 'right' = 'right') => (
    <th
      onClick={() => onSort(k)}
      className={cn(
        'label-meta cursor-pointer select-none px-3 py-2',
        align === 'right' ? 'text-right' : 'text-left',
        sortKey === k ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={9} className="opacity-60" />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-sm min-w-[760px]">
        <thead className="hairline-b">
          <tr>
            {header('Campaign', 'name', 'left')}
            <th className="label-meta text-left px-3 py-2 hidden md:table-cell">Channel</th>
            <th className="label-meta text-left px-3 py-2 hidden sm:table-cell">Status</th>
            {header('Spend', 'spend')}
            {header('Leads', 'leads')}
            {header('CPL', 'cpl')}
            {header('ROAS', 'roas')}
            <th className="label-meta text-right px-3 py-2 hidden lg:table-cell">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.id} className="hairline-b last:border-0 hover:bg-bg-raised">
              <td className="px-3 py-2.5">
                <div className="text-text-primary font-medium leading-tight">{c.name}</div>
                <div className="num text-2xs text-text-tertiary mt-0.5">{c.id} · since {fmt.date(c.startedAt)}</div>
              </td>
              <td className="px-3 py-2.5 hidden md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-text-secondary">
                  <span className="size-2" style={{ background: CHANNEL_COLORS[c.channel] }} />
                  {c.channel}
                </span>
              </td>
              <td className="px-3 py-2.5 hidden sm:table-cell">
                <StatusPill
                  tone={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warn' : 'neutral'}
                  dot
                >
                  {c.status}
                </StatusPill>
              </td>
              <td className="px-3 py-2.5 text-right num text-text-primary">{fmt.currency(c.spend)}</td>
              <td className="px-3 py-2.5 text-right num text-text-primary">{fmt.number(c.leads)}</td>
              <td className="px-3 py-2.5 text-right num text-text-secondary">{fmt.currencyCents(c.cpl)}</td>
              <td className="px-3 py-2.5 text-right num">
                <span className={c.roas >= 5 ? 'text-success' : c.roas >= 2 ? 'text-text-primary' : 'text-danger'}>
                  {c.roas.toFixed(2)}x
                </span>
              </td>
              <td className="px-3 py-2.5 text-right hidden lg:table-cell">
                <div className="inline-block">
                  <Sparkline data={c.trend} width={dense ? 60 : 96} height={20} color="#5C6469" fill={false} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
