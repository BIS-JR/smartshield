import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, ShieldCheck, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { RightDrawer } from './RightDrawer';
import { AboutModal } from './AboutModal';
import { ModuleHelpDrawer } from './ModuleHelpDrawer';
import { useAuthStore } from '@/stores/authStore';
import { logoutRequest } from '@/auth/api';

interface UserMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserMenuDrawer({ open, onOpenChange }: UserMenuDrawerProps) {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  async function handleLogout() {
    onOpenChange(false);
    await logoutRequest();
    clearSession();
    navigate('/login');
  }

  const items = [
    { icon: Info, label: 'Sobre o Produto', onClick: () => setAboutOpen(true) },
    { icon: ShieldCheck, label: 'Segurança (2FA)', onClick: () => { onOpenChange(false); navigate('/security'); } },
    { icon: HelpCircle, label: 'Ajuda', onClick: () => setHelpOpen(true) },
    { icon: LogOut, label: 'Sair', onClick: handleLogout, danger: true },
  ];

  return (
    <>
      <RightDrawer open={open} onOpenChange={onOpenChange} title="Menu">
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`flex items-center justify-between rounded-md px-3 py-3 text-sm transition-colors hover:bg-surface-hover ${
                item.danger ? 'text-status-critical' : 'text-foreground'
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          ))}
        </div>
      </RightDrawer>

      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
      <ModuleHelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
