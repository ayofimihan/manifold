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
        'label-meta cursor-pointer select-none px-3 py-2 whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left',
        sortKey === k ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
      )}
    >
      <span className={cn('inline-flex items-center gap-1', align === 'right' && 'justify-end w-full')}>
        {label}
        <ArrowUpDown size={9} className="opacity-60" />
      </span>
    </th>
  );

  const sparkW = dense ? 72 : 96;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px] table-fixed">
        <colgroup>
          <col />
          <col className="hidden md:table-column" style={{ width: '11rem' }} />
          <col className="hidden sm:table-column" style={{ width: '6.5rem' }} />
          <col style={{ width: '7rem' }} />
          <col style={{ width: '5.5rem' }} />
          <col style={{ width: '6rem' }} />
          <col style={{ width: '5rem' }} />
          <col className="hidden lg:table-column" style={{ width: `${sparkW + 32}px` }} />
        </colgroup>
        <thead className="hairline-b">
          <tr>
            {header('Campaign', 'name', 'left')}
            <th className="label-meta text-left px-3 py-2 hidden md:table-cell whitespace-nowrap">Channel</th>
            <th className="label-meta text-left px-3 py-2 hidden sm:table-cell whitespace-nowrap">Status</th>
            {header('Spend', 'spend')}
            {header('Leads', 'leads')}
            {header('CPL', 'cpl')}
            {header('ROAS', 'roas')}
            <th className="label-meta text-right px-3 py-2 hidden lg:table-cell whitespace-nowrap">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.id} className="hairline-b last:border-b-0 hover:bg-bg-raised">
              <td className="px-3 py-2.5 min-w-0">
                <div className="text-text-primary font-medium leading-tight truncate" title={c.name}>{c.name}</div>
                <div className="num text-2xs text-text-tertiary mt-0.5 truncate">{c.id} · since {fmt.date(c.startedAt)}</div>
              </td>
              <td className="px-3 py-2.5 hidden md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-text-secondary whitespace-nowrap">
                  <span className="size-2 shrink-0" style={{ background: CHANNEL_COLORS[c.channel] }} />
                  <span className="truncate">{c.channel}</span>
                </span>
              </td>
              <td className="px-3 py-2.5 hidden sm:table-cell whitespace-nowrap">
                <StatusPill
                  tone={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warn' : 'neutral'}
                  dot
                >
                  {c.status}
                </StatusPill>
              </td>
              <td className="px-3 py-2.5 text-right num text-text-primary whitespace-nowrap">{fmt.currency(c.spend)}</td>
              <td className="px-3 py-2.5 text-right num text-text-primary whitespace-nowrap">{fmt.number(c.leads)}</td>
              <td className="px-3 py-2.5 text-right num text-text-secondary whitespace-nowrap">{fmt.currencyCents(c.cpl)}</td>
              <td className="px-3 py-2.5 text-right num whitespace-nowrap">
                <span className={c.roas >= 5 ? 'text-success' : c.roas >= 2 ? 'text-text-primary' : 'text-danger'}>
                  {c.roas.toFixed(2)}x
                </span>
              </td>
              <td className="px-3 py-2.5 hidden lg:table-cell">
                <div className="flex justify-end">
                  <Sparkline data={c.trend} width={sparkW} height={22} color="#5C6469" fill={false} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
