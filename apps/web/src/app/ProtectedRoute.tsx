import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Carregando...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
