import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConnectorId, DealerId } from '@/types';
import { DEFAULT_CONNECTORS } from '@/data/connectors';

export type RangePreset = 'L7D' | 'L30D' | 'MTD' | 'QTD' | 'YTD';
export type Comparison = 'prior_period' | 'prior_year' | 'benchmark';

interface DashboardState {
  dealerId: DealerId;
  range: RangePreset;
  comparison: Comparison;
  enabledConnectors: Record<ConnectorId, boolean>;
  setDealer: (id: DealerId) => void;
  setRange: (r: RangePreset) => void;
  setComparison: (c: Comparison) => void;
  toggleConnector: (id: ConnectorId) => void;
  setConnector: (id: ConnectorId, enabled: boolean) => void;
}

const initialConnectors = DEFAULT_CONNECTORS.reduce<Record<ConnectorId, boolean>>((acc, c) => {
  acc[c.id] = c.enabled;
  return acc;
}, {} as Record<ConnectorId, boolean>);

export const useDashboard = create<DashboardState>()(
  persist(
    (set) => ({
      dealerId: 'dlr_a',
      range: 'L30D',
      comparison: 'prior_period',
      enabledConnectors: initialConnectors,
      setDealer: (dealerId) => set({ dealerId }),
      setRange: (range) => set({ range }),
      setComparison: (comparison) => set({ comparison }),
      toggleConnector: (id) =>
        set((s) => ({ enabledConnectors: { ...s.enabledConnectors, [id]: !s.enabledConnectors[id] } })),
      setConnector: (id, enabled) =>
        set((s) => ({ enabledConnectors: { ...s.enabledConnectors, [id]: enabled } })),
    }),
    { name: 'manifold-dashboard' },
  ),
);
