import { Sparkles, ArrowRight } from 'lucide-react';
import { useChat } from '@/store/chat';
import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getKpiSnapshots, KPI_DEFS } from '@/data/kpis';
import { getAlerts } from '@/data/alerts';
import { fmt } from '@/lib/format';

export function AiBriefCard() {
  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const snapshots = getKpiSnapshots(dealerId);
  const alerts = getAlerts(dealerId);
  const setOpen = useChat((s) => s.setOpen);
  const setInput = useChat((s) => s.setInput);

  const topAlert = alerts.find((a) => a.severity === 'critical') ?? alerts[0];
  const movers = [...snapshots]
    .filter((s) => Math.abs(s.delta) > 0.5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2);

  const askAbout = (q: string) => {
    setInput(q);
    setOpen(true);
  };

  return (
    <div className="panel">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-accent" />
          <h3 className="text-md font-medium">Daily Brief</h3>
          <span className="label-meta hidden sm:inline">{dealer.shortName} · {fmt.date(new Date().toISOString())}</span>
        </div>
      </header>
      <div className="p-4 space-y-3">
        <p className="text-sm text-text-secondary leading-relaxed">
          {topAlert
            ? <>Top issue today: <span className="text-text-primary">{topAlert.title}</span>. {topAlert.narrative.split('. ')[0]}.</>
            : <>No critical alerts. Last 24h activity is within expected bands.</>}
        </p>

        {movers.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-2">
            {movers.map((m) => {
              const def = KPI_DEFS[m.kpiId];
              const good = def.direction === 'higher_is_better' ? m.delta > 0 : m.delta < 0;
              return (
                <button
                  key={m.kpiId}
                  onClick={() => askAbout(`Why did ${def.label} move ${m.delta > 0 ? 'up' : 'down'} ${Math.abs(m.delta).toFixed(1)}% this period?`)}
                  className="hairline px-3 py-2 text-left hover:border-accent/40 hover:bg-bg-raised transition-colors"
                >
                  <div className="label-meta">{def.label}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="num text-md font-medium text-text-primary">{fmt.kpi(m.value, def.unit)}</span>
                    <span className={'num text-xs font-medium ' + (good ? 'text-success' : 'text-danger')}>
                      {m.delta > 0 ? '+' : ''}{m.delta.toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Why did leads drop this month?',
            'Compare channel ROAS',
            'Top 3 reallocations to make',
          ].map((q) => (
            <button
              key={q}
              onClick={() => askAbout(q)}
              className="chip text-text-secondary border-border-subtle hover:border-accent/40 hover:text-text-primary"
            >
              {q}
              <ArrowRight size={10} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
