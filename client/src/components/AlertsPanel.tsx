import { AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Alert } from '@/types';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICONS = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  critical: 'text-danger',
  warning: 'text-warn',
  info: 'text-info',
};

const BORDERS = {
  critical: 'border-l-danger',
  warning: 'border-l-warn',
  info: 'border-l-info',
};

export function AlertsPanel({ alerts, limit }: { alerts: Alert[]; limit?: number }) {
  const list = limit ? alerts.slice(0, limit) : alerts;
  if (list.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-text-tertiary">
        Nothing on fire. Last sweep clean.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border-subtle">
      {list.map((a) => {
        const Icon = ICONS[a.severity];
        return (
          <li key={a.id} className={cn('pl-3 border-l-2', BORDERS[a.severity])}>
            <Link to={`/alerts#${a.id}`} className="block px-3 py-3 hover:bg-bg-raised group">
              <div className="flex items-start gap-2.5">
                <Icon size={14} className={cn('mt-0.5 shrink-0', TONES[a.severity])} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm text-text-primary font-medium leading-tight">{a.title}</div>
                    <span className="num text-2xs text-text-tertiary shrink-0">{fmt.relativeTime(a.createdAt)}</span>
                  </div>
                  <div className="text-xs text-text-tertiary num mt-1 flex items-center gap-2 flex-wrap">
                    <span>{a.source}</span>
                    {a.delta !== 0 && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className={a.delta > 0 ? 'text-success' : 'text-danger'}>
                          {a.delta > 0 ? '+' : ''}
                          {a.delta.toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
