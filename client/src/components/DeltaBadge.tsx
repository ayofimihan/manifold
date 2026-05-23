import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { KpiDirection } from '@/types';
import { cn } from '@/lib/cn';

export function DeltaBadge({
  value,
  direction = 'higher_is_better',
  size = 'sm',
  showIcon = true,
}: {
  value: number;
  direction?: KpiDirection;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
}) {
  const flat = Math.abs(value) < 0.05;
  const good = flat ? null : direction === 'higher_is_better' ? value > 0 : value < 0;
  const tone = good === null ? 'text-text-tertiary' : good ? 'text-success' : 'text-danger';
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const sz = size === 'md' ? 'text-md' : size === 'sm' ? 'text-sm' : 'text-xs';
  const iconSz = size === 'md' ? 14 : size === 'sm' ? 12 : 10;
  return (
    <span className={cn('inline-flex items-center gap-0.5 num font-medium', sz, tone)}>
      {showIcon && <Icon size={iconSz} strokeWidth={2.5} />}
      <span>
        {value > 0 ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    </span>
  );
}
