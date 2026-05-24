import { NavLink } from 'react-router-dom';
import { AlertTriangle, LayoutDashboard, MessageSquare, Target } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useChat } from '@/store/chat';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campaigns', icon: Target },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

export function Sidebar() {
  const toggle = useChat((s) => s.toggle);
  return (
    <aside className="hidden md:flex shrink-0 flex-col w-56 hairline-r bg-bg-surface/40">
      <div className="px-4 h-14 flex items-center hairline-b">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="label-meta px-2 pb-2">Workspace</div>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 text-sm group relative',
                    'text-text-secondary hover:text-text-primary hover:bg-bg-raised',
                    isActive && 'text-accent bg-accent/5 hover:bg-accent/10',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent" />}
                    <item.icon size={14} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 px-2">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 hairline text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-accent/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={14} strokeWidth={1.8} />
              Ask Manifold
            </span>
            <kbd className="num text-2xs text-text-tertiary border border-border-muted px-1 py-px">⌘K</kbd>
          </button>
        </div>
      </nav>

    </aside>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M2 18 L8 6 L12 14 L16 6 L22 18" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M2 18 L22 18" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
      <span className="text-lg font-medium tracking-tight">manifold</span>
    </div>
  );
}
