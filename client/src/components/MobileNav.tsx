import { NavLink } from 'react-router-dom';
import { AlertTriangle, BarChart3, LayoutDashboard, Plug, Target, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campaigns', icon: Target },
  { to: '/kpi/cost_per_lead', label: 'KPI Explorer', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/connectors', label: 'Connectors', icon: Plug },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/70 animate-fadeIn" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-64 bg-bg-surface hairline-r flex flex-col animate-slideIn">
        <div className="h-14 flex items-center justify-between px-4 hairline-b">
          <span className="text-lg font-medium">manifold</span>
          <button onClick={onClose} className="p-1 text-text-secondary"><X size={16} /></button>
        </div>
        <nav className="flex-1 py-3 px-2">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 text-sm',
                      'text-text-secondary hover:text-text-primary',
                      isActive && 'text-accent bg-accent/5',
                    )
                  }
                >
                  <item.icon size={14} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
