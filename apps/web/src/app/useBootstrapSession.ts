import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useBootstrapSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== 'idle') return;

    api
      .post('/auth/refresh')
      .then(({ data }) => setSession(data.user, data.accessToken))
      .catch(() => clearSession());
  }, [status, setSession, clearSession]);
}
