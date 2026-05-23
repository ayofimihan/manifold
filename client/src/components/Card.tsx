import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  title,
  meta,
  action,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className={cn('panel relative', className)}>
      {(title || meta || action) && (
        <header className="flex items-center justify-between px-4 py-3 hairline-b">
          <div className="flex items-center gap-3 min-w-0">
            {title && <h3 className="text-md font-medium text-text-primary truncate">{title}</h3>}
            {meta && <span className="label-meta">{meta}</span>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-4')}>{children}</div>
    </section>
  );
}
