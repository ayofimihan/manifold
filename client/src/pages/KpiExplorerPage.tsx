import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { TrendChart } from '@/components/TrendChart';
import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getKpiSnapshots, KPI_DEFS } from '@/data/kpis';
import type { KpiId } from '@/types';
import { fmt } from '@/lib/format';
import { DeltaBadge } from '@/components/DeltaBadge';
import { cn } from '@/lib/cn';
import { getChannelMix } from '@/data/channelMix';
import { CHANNEL_COLORS } from '@/data/channelMix';
import { Sparkles } from 'lucide-react';
import { useChat } from '@/store/chat';

export function KpiExplorerPage() {
  const { kpiId = 'cost_per_lead' } = useParams<{ kpiId: KpiId }>();
  const navigate = useNavigate();
  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const snapshots = getKpiSnapshots(dealerId);
  const snapshot = snapshots.find((s) => s.kpiId === kpiId)!;
  const def = KPI_DEFS[kpiId as KpiId];
  const setOpen = useChat((s) => s.setOpen);
  const setInput = useChat((s) => s.setInput);

  const benchDelta = ((snapshot.value - snapshot.benchmark) / snapshot.benchmark) * 100;
  const vsBenchGood = def.direction === 'higher_is_better' ? snapshot.value > snapshot.benchmark : snapshot.value < snapshot.benchmark;
  const mix = getChannelMix(dealerId);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <nav className="flex flex-wrap items-center gap-1.5 num text-xs text-text-tertiary">
        <Link to="/" className="hover:text-accent">Overview</Link>
        <span>/</span>
        <span className="text-text-secondary">KPI Explorer</span>
        <span>/</span>
        <span className="text-text-primary">{def.label}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 md:gap-5">
        <aside className="space-y-3">
          <div className="label-meta">KPI Catalog</div>
          <Card padded={false}>
            <ul className="divide-y divide-border-subtle">
              {snapshots.map((s) => {
                const d = KPI_DEFS[s.kpiId];
                const active = s.kpiId === kpiId;
                return (
                  <li key={s.kpiId}>
                    <button
                      onClick={() => navigate(`/kpi/${s.kpiId}`)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 hover:bg-bg-raised flex items-center justify-between border-l-2',
                        active ? 'bg-bg-raised border-l-accent text-text-primary' : 'border-l-transparent text-text-secondary',
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">{d.label}</div>
                        <div className="num text-2xs text-text-tertiary">{fmt.kpi(s.value, d.unit)}</div>
                      </div>
                      <DeltaBadge value={s.delta} direction={d.direction} size="xs" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        <div className="space-y-4 min-w-0">
          <Card padded={false}>
            <header className="px-4 py-3 hairline-b flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="label-meta">{dealer.name} · L30D</div>
                <h2 className="text-2xl tracking-tight font-medium mt-1">{def.label}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="num text-3xl text-text-primary tracking-tight">{fmt.kpi(snapshot.value, def.unit)}</span>
                  <DeltaBadge value={snapshot.delta} direction={def.direction} size="md" />
                  <span className={'num text-xs ' + (vsBenchGood ? 'text-success' : 'text-danger')}>
                    {benchDelta > 0 ? '+' : ''}{benchDelta.toFixed(1)}% vs benchmark
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-2 max-w-prose">{def.description}</p>
              </div>
              <button
                onClick={() => {
                  setInput(`Explain ${def.label} for ${dealer.name}. What's driving the current ${snapshot.delta > 0 ? '+' : ''}${snapshot.delta.toFixed(1)}% change and how does it compare to benchmark?`);
                  setOpen(true);
                }}
                className="hairline px-3 py-1.5 text-xs flex items-center gap-1.5 hover:border-accent/40 hover:text-accent"
              >
                <Sparkles size={12} /> Ask Manifold
              </button>
            </header>
            <div className="px-2 pb-2 pt-3">
              <TrendChart def={def} snapshot={snapshot} height={320} />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Breakdown by Channel" meta="Contribution" padded>
              <ul className="space-y-2">
                {mix.map((m) => (
                  <li key={m.channel} className="flex items-center gap-3">
                    <span className="size-2" style={{ background: CHANNEL_COLORS[m.channel] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-text-primary">{m.channel}</span>
                        <span className="num text-xs text-text-secondary">{(m.share * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1 bg-bg-inset overflow-hidden mt-1">
                        <div
                          className="h-full"
                          style={{ width: `${m.share * 100}%`, background: CHANNEL_COLORS[m.channel] }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Benchmark Detail" meta="OEM Franchise" padded>
              <div className="space-y-3">
                <Row label="Current" value={fmt.kpi(snapshot.value, def.unit)} />
                <Row label="OEM Franchise Avg" value={fmt.kpi(snapshot.benchmark, def.unit)} />
                <Row
                  label="Gap"
                  value={
                    <span className={vsBenchGood ? 'text-success' : 'text-danger'}>
                      {benchDelta > 0 ? '+' : ''}{benchDelta.toFixed(1)}%
                    </span>
                  }
                />
                <Row label="Direction" value={def.direction === 'higher_is_better' ? 'Higher is better' : 'Lower is better'} />
                <div className="hairline-t pt-3 text-xs text-text-tertiary leading-relaxed">
                  Benchmark joined from OEM source weekly. Like-sized, like-market peer band sits within ±8% of franchise average.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="label-meta">{label}</span>
      <span className="num text-md text-text-primary tabular-nums">{value}</span>
    </div>
  );
}
