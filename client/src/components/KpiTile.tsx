import { Link } from 'react-router-dom';
import type { KpiDef, KpiSnapshot } from '@/types';
import { fmt } from '@/lib/format';
import { Sparkline } from './Sparkline';
import { DeltaBadge } from './DeltaBadge';
import { cn } from '@/lib/cn';

export function KpiTile({
  def,
  snapshot,
  active,
  className,
}: {
  def: KpiDef;
  snapshot: KpiSnapshot;
  active?: boolean;
  className?: string;
}) {
  const benchDelta = ((snapshot.value - snapshot.benchmark) / snapshot.benchmark) * 100;
  const vsBenchGood =
    def.direction === 'higher_is_better' ? snapshot.value > snapshot.benchmark : snapshot.value < snapshot.benchmark;
  const tone = vsBenchGood ? '#22C55E' : '#EF4444';

  return (
    <Link
      to={`/kpi/${def.id}`}
      className={cn(
        'panel relative block group transition-colors hover:bg-bg-raised focus-visible:bg-bg-raised',
        active && 'ring-1 ring-accent/40',
        className,
      )}
    >
      <div className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="label-meta truncate">{def.label}</div>
            <div className="num text-2xl font-medium text-text-primary mt-1 tracking-tight tabular-nums">
              {fmt.kpi(snapshot.value, def.unit)}
            </div>
          </div>
          <div className="shrink-0 -mr-1 -mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <Sparkline data={snapshot.series.slice(-30)} width={84} height={28} color={tone} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <DeltaBadge value={snapshot.delta} direction={def.direction} />
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className="label-meta">vs bench</span>
            <span className={cn('num tabular-nums font-medium', vsBenchGood ? 'text-success' : 'text-danger')}>
              {benchDelta > 0 ? '+' : ''}
              {benchDelta.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
