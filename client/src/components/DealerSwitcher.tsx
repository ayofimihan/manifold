import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DEALERS } from '@/data/dealers';
import { useDashboard } from '@/store/dashboard';
import { cn } from '@/lib/cn';

export function DealerSwitcher() {
  const dealerId = useDashboard((s) => s.dealerId);
  const setDealer = useDashboard((s) => s.setDealer);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = DEALERS.find((d) => d.id === dealerId)!;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2.5 h-9 px-3 hairline bg-bg-surface text-sm',
          'hover:bg-bg-raised hover:border-border-muted transition-colors',
          open && 'bg-bg-raised border-border-muted',
        )}
      >
        <span className="size-2" style={{ background: current.color }} />
        <span className="text-text-primary font-medium">{current.name}</span>
        <ChevronDown size={14} className="text-text-tertiary" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] w-72 panel-raised z-40 animate-fadeIn">
          <div className="label-meta px-3 py-2 hairline-b">Switch dealership</div>
          <ul>
            {DEALERS.map((d) => {
              const selected = d.id === dealerId;
              return (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setDealer(d.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm',
                      'hover:bg-bg-raised',
                      selected && 'bg-bg-raised',
                    )}
                  >
                    <span className="size-2.5" style={{ background: d.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary font-medium truncate">{d.name}</div>
                      <div className="text-2xs text-text-tertiary num">{d.metro} · {d.brand}</div>
                    </div>
                    {selected && <Check size={14} className="text-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
