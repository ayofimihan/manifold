import { useDashboard } from '@/store/dashboard';
import { dealerById } from '@/data/dealers';
import { getKpiSnapshots, KPI_DEFS } from '@/data/kpis';
import { getCampaigns } from '@/data/campaigns';
import { getChannelMix } from '@/data/channelMix';
import { getAlerts } from '@/data/alerts';
import { KpiTile } from '@/components/KpiTile';
import { Card } from '@/components/Card';
import { TrendChart } from '@/components/TrendChart';
import { ChannelMixChart } from '@/components/ChannelMixChart';
import { AlertsPanel } from '@/components/AlertsPanel';
import { CampaignTable } from '@/components/CampaignTable';
import { AiBriefCard } from '@/components/AiBriefCard';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { DEFAULT_CONNECTORS } from '@/data/connectors';
import { StatusPill } from '@/components/StatusPill';

export function DashboardPage() {
  const dealerId = useDashboard((s) => s.dealerId);
  const enabledConnectors = useDashboard((s) => s.enabledConnectors);
  const dealer = dealerById(dealerId);

  const snapshots = getKpiSnapshots(dealerId);
  const primary = snapshots.find((s) => s.kpiId === 'cost_per_lead')!;
  const campaigns = getCampaigns(dealerId).slice(0, 6);
  const channelMix = getChannelMix(dealerId);
  const alerts = getAlerts(dealerId);
  const enabledCount = Object.values(enabledConnectors).filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl tracking-tight font-medium text-text-primary">{dealer.name}</h1>
          <div className="num text-xs text-text-tertiary mt-1 flex items-center gap-2 flex-wrap">
            <span>{dealer.metro}</span>
            <span className="text-text-muted">·</span>
            <span>{dealer.brand}</span>
            <span className="text-text-muted">·</span>
            <span>{dealer.rooftops} rooftops</span>
            <span className="text-text-muted">·</span>
            <span>{enabledCount}/{DEFAULT_CONNECTORS.length} connectors live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone="success" dot>Data fresh · 2m</StatusPill>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {snapshots.map((s) => (
          <KpiTile key={s.kpiId} def={KPI_DEFS[s.kpiId]} snapshot={s} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
        <div className="xl:col-span-2 space-y-4 md:space-y-5">
          <Card
            title={KPI_DEFS.cost_per_lead.label}
            meta={`L30D · ${dealer.shortName}`}
            action={
              <Link to="/kpi/cost_per_lead" className="text-xs num text-text-tertiary hover:text-accent flex items-center gap-1">
                Explore <ArrowRight size={11} />
              </Link>
            }
            padded={false}
          >
            <div className="px-2 pb-2 pt-3">
              <TrendChart def={KPI_DEFS.cost_per_lead} snapshot={primary} />
            </div>
          </Card>

          <Card title="Channel Mix" meta="Spend share · L30D">
            <ChannelMixChart rows={channelMix} />
          </Card>

          <Card
            title="Top Campaigns"
            meta={`${campaigns.length} of ${getCampaigns(dealerId).length}`}
            action={
              <Link to="/campaigns" className="text-xs num text-text-tertiary hover:text-accent flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            }
            padded={false}
          >
            <CampaignTable campaigns={campaigns} dense />
          </Card>
        </div>

        <div className="space-y-4 md:space-y-5">
          <AiBriefCard />

          <Card
            title="Active Alerts"
            meta={`${alerts.length} open`}
            action={
              <Link to="/alerts" className="text-xs num text-text-tertiary hover:text-accent flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            }
            padded={false}
          >
            <AlertsPanel alerts={alerts} limit={4} />
          </Card>

          <Card
            title="Sources"
            meta={`${enabledCount}/${DEFAULT_CONNECTORS.length} enabled`}
            action={
              <Link to="/connectors" className="text-xs num text-text-tertiary hover:text-accent flex items-center gap-1">
                Manage <ExternalLink size={11} />
              </Link>
            }
            padded={false}
          >
            <ul className="divide-y divide-border-subtle">
              {DEFAULT_CONNECTORS.map((c) => {
                const enabled = enabledConnectors[c.id];
                return (
                  <li key={c.id} className="px-3 py-2 flex items-center gap-2.5">
                    <span
                      className={
                        'size-1.5 ' +
                        (!enabled
                          ? 'bg-text-muted'
                          : c.status === 'healthy'
                          ? 'bg-success'
                          : c.status === 'degraded'
                          ? 'bg-warn'
                          : 'bg-danger')
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary truncate">{c.name}</div>
                      <div className="num text-2xs text-text-tertiary">{c.category} · {c.cadence}</div>
                    </div>
                    <span className={'num text-2xs ' + (enabled ? 'text-text-tertiary' : 'text-text-muted')}>
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
