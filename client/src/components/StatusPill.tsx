import { cn } from '@/lib/cn';

type Tone = 'success' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent';

const STYLES: Record<Tone, string> = {
  success: 'text-success border-success/30 bg-success-bg',
  warn: 'text-warn border-warn/30 bg-warn-bg',
  danger: 'text-danger border-danger/40 bg-danger-bg',
  info: 'text-info border-info/40 bg-info/10',
  accent: 'text-accent border-accent/40 bg-accent/10',
  neutral: 'text-text-secondary border-border-muted bg-bg-raised',
};

export function StatusPill({
  tone = 'neutral',
  children,
  className,
  dot = false,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={cn('chip', STYLES[tone], className)}>
      {dot && <span className={cn('inline-block size-1.5 rounded-full', {
        'bg-success': tone === 'success',
        'bg-warn': tone === 'warn',
        'bg-danger': tone === 'danger',
        'bg-info': tone === 'info',
        'bg-accent': tone === 'accent',
        'bg-text-tertiary': tone === 'neutral',
      })} />}
      {children}
    </span>
  );
}
