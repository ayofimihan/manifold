import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomTicker } from './BottomTicker';
import { ChatDrawer } from './ChatDrawer';
import { useChat } from '@/store/chat';

export function AppShell() {
  const toggle = useChat((s) => s.toggle);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-w-0 grid-bg">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomTicker />
      <ChatDrawer />
    </div>
  );
}
