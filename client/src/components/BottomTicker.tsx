import { Activity, Clock, Database } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getKpiSnapshots } from '@/data/kpis';
import { KPI_DEFS } from '@/data/kpis';
import { fmt } from '@/lib/format';
import { useEffect, useState } from 'react';

export function BottomTicker() {
  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const snapshots = getKpiSnapshots(dealerId);

  const items = snapshots.map((s) => ({
    label: KPI_DEFS[s.kpiId].label,
    value: fmt.kpi(s.value, KPI_DEFS[s.kpiId].unit),
    delta: s.delta,
    direction: KPI_DEFS[s.kpiId].direction,
  }));

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="hairline-t bg-bg-surface/60 backdrop-blur sticky bottom-0 z-20 h-9 flex items-center text-xs overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-3 hairline-r h-full">
        <span className="size-1.5 bg-success animate-pulse" />
        <span className="text-text-secondary num">LIVE</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap will-change-transform">
          {[...items, ...items, ...items, ...items].map((it, i) => {
            const good = it.direction === 'higher_is_better' ? it.delta > 0 : it.delta < 0;
            const flat = Math.abs(it.delta) < 0.05;
            return (
              <div key={i} className="flex items-center gap-2 px-3 hairline-r">
                <span className="label-meta">{it.label}</span>
                <span className="num text-text-primary">{it.value}</span>
                <span
                  className={
                    'num font-medium ' +
                    (flat ? 'text-text-tertiary' : good ? 'text-success' : 'text-danger')
                  }
                >
                  {it.delta > 0 ? '+' : ''}
                  {it.delta.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3 px-3 hairline-l h-full">
        <span className="hidden lg:flex items-center gap-1.5 text-text-tertiary">
          <Database size={11} />
          <span className="num">{dealer.shortName}</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5 text-text-tertiary">
          <Activity size={11} />
          <span className="num">7/7</span>
        </span>
        <span className="flex items-center gap-1.5 text-text-tertiary">
          <Clock size={11} />
          <span className="num">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </span>
      </div>
    </footer>
  );
}
