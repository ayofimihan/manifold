import type { KpiUnit } from '@/types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const currencyCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const compactNum = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const fmt = {
  currency: (n: number) => currency.format(n),
  currencyCents: (n: number) => currencyCents.format(n),
  percent: (n: number) => percent.format(n / 100),
  percentRaw: (n: number) => percent.format(n),
  compact: (n: number) => compactNum.format(n),
  number: (n: number) => num.format(n),
  delta: (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`,
  days: (n: number) => `${n.toFixed(0)}d`,
  kpi: (value: number, unit: KpiUnit) => {
    switch (unit) {
      case 'currency':
        return value < 100 ? currencyCents.format(value) : currency.format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${value.toFixed(0)}d`;
      case 'number':
        return num.format(value);
    }
  },
  date: (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  time: (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  },
  relativeTime: (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  },
};
