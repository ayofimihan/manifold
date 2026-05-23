import { CheckCircle2, CircleAlert, CircleOff, Pause, RefreshCw } from 'lucide-react';
import { DEFAULT_CONNECTORS } from '@/data/connectors';
import { useDashboard } from '@/store/dashboard';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import type { Connector } from '@/types';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/cn';

export function ConnectorsPage() {
  const enabled = useDashboard((s) => s.enabledConnectors);
  const toggle = useDashboard((s) => s.toggleConnector);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Connectors</h1>
        <p className="num text-xs text-text-tertiary mt-1">
          Toggle data sources to see how the dashboard adapts. Disabled sources stop contributing to charts and AI context.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEFAULT_CONNECTORS.map((c) => (
          <ConnectorCard key={c.id} connector={c} enabled={enabled[c.id]} onToggle={() => toggle(c.id)} />
        ))}
      </div>

      <Card title="What changes when a source is toggled off?" padded>
        <ul className="text-sm text-text-secondary space-y-1.5">
          <li className="flex gap-2">
            <span className="text-accent num">→</span>
            Channel mix and campaign tables exclude the source from totals.
          </li>
          <li className="flex gap-2">
            <span className="text-accent num">→</span>
            KPI computations use only enabled sources. Benchmarks remain on.
          </li>
          <li className="flex gap-2">
            <span className="text-accent num">→</span>
            The chat assistant is told which sources are off and answers accordingly.
          </li>
          <li className="flex gap-2">
            <span className="text-accent num">→</span>
            Alerts from disabled sources are hidden from the active list.
          </li>
        </ul>
      </Card>
    </div>
  );
}

function ConnectorCard({
  connector,
  enabled,
  onToggle,
}: {
  connector: Connector;
  enabled: boolean;
  onToggle: () => void;
}) {
  const { name, category, description, status, lastSyncedAt, cadence, rows24h } = connector;
  return (
    <div
      className={cn(
        'panel p-4 flex flex-col gap-3 transition-colors group',
        enabled ? 'hover:border-border-muted' : 'opacity-65 hover:opacity-90',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusPill tone="neutral">{category}</StatusPill>
            {enabled && status === 'healthy' && <StatusPill tone="success" dot>healthy</StatusPill>}
            {enabled && status === 'degraded' && <StatusPill tone="warn" dot>degraded</StatusPill>}
            {enabled && status === 'failed' && <StatusPill tone="danger" dot>failed</StatusPill>}
            {!enabled && <StatusPill tone="neutral" dot>off</StatusPill>}
          </div>
          <h3 className="text-md text-text-primary font-medium truncate">{name}</h3>
          <p className="text-xs text-text-tertiary mt-0.5 leading-snug">{description}</p>
        </div>
        <Toggle on={enabled} onChange={onToggle} />
      </div>

      <dl className="grid grid-cols-2 gap-y-1 text-xs hairline-t pt-3">
        <dt className="label-meta">Cadence</dt>
        <dd className="num text-text-secondary text-right">{cadence}</dd>
        <dt className="label-meta">Rows 24h</dt>
        <dd className="num text-text-secondary text-right">{fmt.number(rows24h)}</dd>
        <dt className="label-meta">Last sync</dt>
        <dd className="num text-text-secondary text-right">{fmt.relativeTime(lastSyncedAt)}</dd>
      </dl>

      <div className="hairline-t pt-3 flex items-center justify-between gap-2">
        <span className="num text-2xs text-text-muted">
          {enabled ? (
            status === 'healthy' ? (
              <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 size={11} /> Operational</span>
            ) : status === 'degraded' ? (
              <span className="inline-flex items-center gap-1 text-warn"><CircleAlert size={11} /> Stale</span>
            ) : status === 'failed' ? (
              <span className="inline-flex items-center gap-1 text-danger"><CircleAlert size={11} /> Failed</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-text-tertiary"><Pause size={11} /> Paused</span>
            )
          ) : (
            <span className="inline-flex items-center gap-1"><CircleOff size={11} /> Excluded from analytics</span>
          )}
        </span>
        <button
          className="hairline px-2 py-1 text-2xs text-text-tertiary hover:text-text-secondary"
          aria-label="Force sync"
        >
          <RefreshCw size={11} />
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={cn(
        'relative shrink-0 w-9 h-5 hairline transition-colors',
        on ? 'bg-accent/15 border-accent/50' : 'bg-bg-inset',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] size-3.5 transition-transform',
          on ? 'translate-x-[18px] bg-accent' : 'translate-x-[2px] bg-text-tertiary',
        )}
      />
    </button>
  );
}
