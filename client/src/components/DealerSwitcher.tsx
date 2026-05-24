import { Check, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { DEALERS } from '@/data/dealers';
import { useDashboard } from '@/store/dashboard';
import { cn } from '@/lib/cn';

export function DealerSwitcher() {
  const dealerId = useDashboard((s) => s.dealerId);
  const setDealer = useDashboard((s) => s.setDealer);
  const current = DEALERS.find((d) => d.id === dealerId)!;

  return (
    <Menu placement="bottom-start" offset={[0, 4]} autoSelect={false}>
      {({ isOpen }) => (
        <>
          <MenuButton
            className={cn(
              'flex items-center gap-2.5 h-9 px-3 hairline bg-bg-surface text-sm',
              'hover:bg-bg-raised hover:border-border-muted transition-colors',
              isOpen && 'bg-bg-raised border-border-muted',
            )}
          >
            <span className="flex items-center gap-2.5">
              <span className="size-2" style={{ background: current.color }} />
              <span className="text-text-primary font-medium">{current.name}</span>
              <ChevronDown size={14} className="text-text-tertiary" />
            </span>
          </MenuButton>

          <MenuList className="animate-fadeIn">
            <div className="label-meta px-3 py-2 hairline-b">Switch dealership</div>
            {DEALERS.map((d) => {
              const selected = d.id === dealerId;
              return (
                <MenuItem
                  key={d.id}
                  onClick={() => setDealer(d.id)}
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
                </MenuItem>
              );
            })}
          </MenuList>
        </>
      )}
    </Menu>
  );
}
