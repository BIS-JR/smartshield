import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AuthCardShell } from './AuthCardShell';
import { OtpInput } from './OtpInput';
import { Button } from '@/components/ui/button';
import { twoFactorLoginRequest } from './api';
import { useAuthStore } from '@/stores/authStore';

export function TwoFactorVerifyPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleVerify() {
    setServerError(null);
    setSubmitting(true);
    try {
      const { user, accessToken } = await twoFactorLoginRequest(email, token);
      setSession(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Código inválido.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCardShell
      title="Verificação em duas etapas"
      subtitle="Digite o código do seu aplicativo autenticador"
      icon={<ShieldCheck className="h-6 w-6 text-primary-foreground" />}
    >
      <div className="flex flex-col gap-4">
        <OtpInput value={token} onChange={setToken} />
        {serverError && <p className="text-sm text-status-critical">{serverError}</p>}
        <Button className="w-full" disabled={token.length !== 6 || submitting} onClick={handleVerify}>
          {submitting ? 'Verificando...' : 'Verificar'}
        </Button>
      </div>
    </AuthCardShell>
  );
}
