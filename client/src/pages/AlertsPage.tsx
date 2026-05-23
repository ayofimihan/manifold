import { useMemo, useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getAlerts } from '@/data/alerts';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import type { Alert, AlertSeverity } from '@/types';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useChat } from '@/store/chat';

const ICONS = { critical: AlertOctagon, warning: AlertTriangle, info: Info };
const TONES = { critical: 'text-danger', warning: 'text-warn', info: 'text-info' } as const;

export function AlertsPage() {
  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const alerts = getAlerts(dealerId);
  const [sev, setSev] = useState<AlertSeverity | 'all'>('all');
  const [active, setActive] = useState<Alert | null>(alerts[0] ?? null);
  const setOpen = useChat((s) => s.setOpen);
  const setInput = useChat((s) => s.setInput);

  const filtered = useMemo(
    () => alerts.filter((a) => sev === 'all' || a.severity === sev),
    [alerts, sev],
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl tracking-tight font-medium">Alerts</h1>
          <div className="num text-xs text-text-tertiary mt-1">{dealer.name} · {alerts.length} active</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'critical', 'warning', 'info'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={cn(
                'chip',
                sev === s
                  ? 'text-accent border-accent/40 bg-accent/10'
                  : 'text-text-secondary border-border-subtle hover:border-border-muted',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card title="Open" meta={`${filtered.length}`} padded={false}>
          <ul className="divide-y divide-border-subtle max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
            {filtered.map((a) => {
              const Icon = ICONS[a.severity];
              const isActive = active?.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setActive(a)}
                    className={cn(
                      'w-full text-left px-3 py-3 flex items-start gap-2.5 hover:bg-bg-raised border-l-2',
                      isActive ? 'bg-bg-raised border-l-accent' : 'border-l-transparent',
                    )}
                  >
                    <Icon size={14} className={cn('mt-0.5 shrink-0', TONES[a.severity])} strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary font-medium leading-tight">{a.title}</div>
                      <div className="num text-2xs text-text-tertiary mt-1 flex items-center gap-1.5">
                        <span>{a.source}</span>
                        <span className="text-text-muted">·</span>
                        <span>{fmt.relativeTime(a.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {active && (
          <Card padded={false}>
            <header className="px-4 py-3 hairline-b flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusPill
                    tone={active.severity === 'critical' ? 'danger' : active.severity === 'warning' ? 'warn' : 'info'}
                    dot
                  >
                    {active.severity}
                  </StatusPill>
                  <span className="num text-2xs text-text-tertiary">{active.id}</span>
                </div>
                <h3 className="text-md font-medium text-text-primary">{active.title}</h3>
                <div className="num text-2xs text-text-tertiary mt-1">
                  {active.source} · {fmt.date(active.createdAt)} {fmt.time(active.createdAt)}
                </div>
              </div>
              <button
                onClick={() => {
                  setInput(`Explain this alert in detail: ${active.title}. ${active.narrative}`);
                  setOpen(true);
                }}
                className="hairline px-2.5 py-1.5 text-xs flex items-center gap-1.5 hover:border-accent/40 hover:text-accent"
              >
                <Sparkles size={12} />
                Ask Manifold
              </button>
            </header>
            <div className="p-4 space-y-4">
              <div>
                <div className="label-meta mb-1.5">What's happening</div>
                <p className="text-sm text-text-secondary leading-relaxed">{active.narrative}</p>
              </div>
              <div className="hairline-t pt-4">
                <div className="label-meta mb-1.5">Suggested action</div>
                <p className="text-sm text-text-primary leading-relaxed">{active.suggestedAction}</p>
              </div>
              <div className="flex flex-wrap gap-2 hairline-t pt-4">
                <button className="hairline px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary">Snooze 1d</button>
                <button className="hairline px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary">Snooze 1w</button>
                <button className="hairline px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary">Mark resolved</button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
