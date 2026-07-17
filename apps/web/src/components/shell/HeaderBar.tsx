import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Menu } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { UserMenuDrawer } from './UserMenuDrawer';
import { useAuthStore } from '@/stores/authStore';

export function HeaderBar() {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <img src="/logos/smart-system.png" alt="Smart System" className="h-8 w-auto" />
        <img src="/logos/smart-shield.png" alt="SmartShield" className="h-8 w-auto" />
        <span className="whitespace-nowrap text-base font-bold text-foreground">SmartShield</span>
        <LiveClock />
      </div>

      <Link
        to="/dashboard"
        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:border-primary"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Console Geral</span>
      </Link>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">{user?.email.split('@')[0]}</span>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-md p-2 text-foreground hover:bg-surface-hover"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <UserMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
