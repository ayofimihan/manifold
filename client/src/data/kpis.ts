import type { DealerId, KpiDef, KpiId, KpiSnapshot } from '@/types';

export const KPI_DEFS: Record<KpiId, KpiDef> = {
  cost_per_lead: {
    id: 'cost_per_lead',
    label: 'Cost per Lead',
    unit: 'currency',
    direction: 'lower_is_better',
    description: 'Total media spend divided by attributed leads.',
  },
  lead_to_deal: {
    id: 'lead_to_deal',
    label: 'Lead-to-Deal',
    unit: 'percent',
    direction: 'higher_is_better',
    description: 'Share of leads that closed within 30 days.',
  },
  gross_per_vin: {
    id: 'gross_per_vin',
    label: 'Gross per VIN',
    unit: 'currency',
    direction: 'higher_is_better',
    description: 'Average front-end gross per vehicle sold.',
  },
  vdp_to_lead: {
    id: 'vdp_to_lead',
    label: 'VDP-to-Lead',
    unit: 'percent',
    direction: 'higher_is_better',
    description: 'Share of VDP views generating a lead.',
  },
  days_to_turn: {
    id: 'days_to_turn',
    label: 'Days to Turn',
    unit: 'days',
    direction: 'lower_is_better',
    description: 'Average days from inventory list to sale.',
  },
};

function seedSeries(seed: number, len: number, base: number, drift: number, noise: number): number[] {
  const out: number[] = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < len; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280 - 0.5) * 2;
    v += drift / len + r * noise;
    out.push(Math.max(0, v));
  }
  return out;
}

type DealerKpiSpec = Record<KpiId, { base: number; drift: number; noise: number; benchmark: number; seed: number }>;

const SPECS: Record<DealerId, DealerKpiSpec> = {
  dlr_a: {
    cost_per_lead: { base: 32.4, drift: -1.2, noise: 1.4, benchmark: 38.0, seed: 17 },
    lead_to_deal: { base: 14.1, drift: 0.4, noise: 0.6, benchmark: 12.5, seed: 23 },
    gross_per_vin: { base: 2840, drift: 60, noise: 90, benchmark: 2600, seed: 31 },
    vdp_to_lead: { base: 3.6, drift: 0.05, noise: 0.18, benchmark: 3.1, seed: 41 },
    days_to_turn: { base: 41, drift: -1, noise: 1.5, benchmark: 47, seed: 53 },
  },
  dlr_b: {
    cost_per_lead: { base: 41.7, drift: 2.3, noise: 1.8, benchmark: 38.0, seed: 11 },
    lead_to_deal: { base: 9.4, drift: -0.3, noise: 0.5, benchmark: 12.5, seed: 19 },
    gross_per_vin: { base: 2210, drift: -40, noise: 70, benchmark: 2600, seed: 29 },
    vdp_to_lead: { base: 2.4, drift: -0.08, noise: 0.16, benchmark: 3.1, seed: 37 },
    days_to_turn: { base: 54, drift: 1.5, noise: 2.0, benchmark: 47, seed: 47 },
  },
  dlr_c: {
    cost_per_lead: { base: 36.1, drift: 0.4, noise: 1.3, benchmark: 38.0, seed: 13 },
    lead_to_deal: { base: 11.8, drift: 0.2, noise: 0.5, benchmark: 12.5, seed: 21 },
    gross_per_vin: { base: 2705, drift: 30, noise: 80, benchmark: 2600, seed: 33 },
    vdp_to_lead: { base: 3.0, drift: 0.02, noise: 0.14, benchmark: 3.1, seed: 43 },
    days_to_turn: { base: 46, drift: -0.4, noise: 1.6, benchmark: 47, seed: 59 },
  },
};

export function getKpiSnapshots(dealerId: DealerId, days = 90): KpiSnapshot[] {
  const spec = SPECS[dealerId];
  return (Object.keys(spec) as KpiId[]).map((kpiId) => {
    const s = spec[kpiId];
    const series = seedSeries(s.seed, days, s.base, s.drift, s.noise);
    const value = series[series.length - 1];
    const prior = series[Math.floor(series.length / 2)];
    const delta = ((value - prior) / Math.max(0.01, prior)) * 100;
    return { kpiId, value, delta, benchmark: s.benchmark, series };
  });
}

export function getKpiSeries(dealerId: DealerId, kpiId: KpiId, days = 90): number[] {
  const s = SPECS[dealerId][kpiId];
  return seedSeries(s.seed, days, s.base, s.drift, s.noise);
}

export function getBenchmark(dealerId: DealerId, kpiId: KpiId): number {
  return SPECS[dealerId][kpiId].benchmark;
}
