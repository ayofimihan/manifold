import { useDashboard, type RangePreset } from '@/store/dashboard';
import { cn } from '@/lib/cn';

const PRESETS: RangePreset[] = ['L7D', 'L30D', 'MTD', 'QTD', 'YTD'];

export function RangePicker() {
  const range = useDashboard((s) => s.range);
  const setRange = useDashboard((s) => s.setRange);
  return (
    <div className="flex items-stretch h-9 hairline overflow-hidden">
      {PRESETS.map((p, i) => (
        <button
          key={p}
          onClick={() => setRange(p)}
          className={cn(
            'num px-2.5 text-xs font-medium transition-colors',
            i > 0 && 'hairline-l',
            p === range
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-raised',
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
