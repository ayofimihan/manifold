import { Menu, MessageSquare, Sparkles } from 'lucide-react';
import { DealerSwitcher } from './DealerSwitcher';
import { useChat } from '@/store/chat';
import { useState } from 'react';
import { MobileNav } from './MobileNav';

export function TopBar() {
  const toggle = useChat((s) => s.toggle);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header className="h-14 hairline-b bg-bg-surface/40 backdrop-blur sticky top-0 z-30">
        <div className="h-full flex items-center gap-3 px-3 md:px-4">
          <button
            className="md:hidden p-1.5 hairline text-text-secondary hover:text-text-primary"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={16} />
          </button>

          <DealerSwitcher />

          <div className="flex-1" />

          <button
            onClick={toggle}
            className="hidden sm:flex items-center gap-2 h-9 px-3 hairline text-sm text-text-primary bg-accent/5 border-accent/40 hover:bg-accent/10 transition-colors"
          >
            <Sparkles size={13} className="text-accent" />
            <span>Ask Manifold</span>
          </button>
          <button
            onClick={toggle}
            className="sm:hidden p-2 hairline text-accent"
            aria-label="Ask Manifold"
          >
            <MessageSquare size={16} />
          </button>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
