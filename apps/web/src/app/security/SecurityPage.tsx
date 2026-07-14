import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/auth/OtpInput';
import { useAuthStore } from '@/stores/authStore';
import { setupTwoFactorRequest, confirmTwoFactorRequest, disableTwoFactorRequest } from '@/auth/api';

export function SecurityPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<'idle' | 'qr' | 'disable'>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartSetup() {
    setError(null);
    setLoading(true);
    try {
      const { qrCodeDataUrl, secret } = await setupTwoFactorRequest();
      setQrCodeDataUrl(qrCodeDataUrl);
      setSecret(secret);
      setStep('qr');
    } catch {
      setError('Não foi possível iniciar a configuração do 2FA.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      await confirmTwoFactorRequest(code);
      if (user && accessToken) setSession({ ...user, twoFactorEnabled: true }, accessToken);
      setStep('idle');
      setCode('');
    } catch {
      setError('Código inválido.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setLoading(true);
    try {
      await disableTwoFactorRequest(code);
      if (user && accessToken) setSession({ ...user, twoFactorEnabled: false }, accessToken);
      setStep('idle');
      setCode('');
    } catch {
      setError('Código inválido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Segurança</h1>
          <p className="text-sm text-muted">Gerencie a autenticação em dois fatores da sua conta</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          Proteja sua conta exigindo um código gerado por um aplicativo autenticador (Google Authenticator, Microsoft
          Authenticator, etc.) a cada login. Isso é opcional, você pode ativar ou desativar quando quiser.
        </p>

        {step === 'idle' && (
          <div className="mt-4">
            {user?.twoFactorEnabled ? (
              <Button variant="destructive" onClick={() => setStep('disable')}>
                <ShieldOff className="h-4 w-4" />
                Desativar 2FA
              </Button>
            ) : (
              <Button onClick={handleStartSetup} disabled={loading}>
                {loading ? 'Gerando...' : 'Configurar 2FA'}
              </Button>
            )}
          </div>
        )}

        {step === 'qr' && qrCodeDataUrl && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <img src={qrCodeDataUrl} alt="QR code para configurar 2FA" className="h-44 w-44 rounded-md border border-border bg-white p-2" />
            <p className="text-xs text-muted">
              Escaneie com seu aplicativo autenticador. Não conseguiu escanear? Digite manualmente:{' '}
              <span className="font-mono text-foreground">{secret}</span>
            </p>
            <div className="w-full max-w-xs">
              <OtpInput value={code} onChange={setCode} />
            </div>
            {error && <p className="text-sm text-status-critical">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('idle'); setCode(''); setError(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={code.length !== 6 || loading}>
                {loading ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}

        {step === 'disable' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-foreground">Digite o código atual do seu aplicativo autenticador para desativar o 2FA.</p>
            <div className="w-full max-w-xs">
              <OtpInput value={code} onChange={setCode} />
            </div>
            {error && <p className="text-sm text-status-critical">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('idle'); setCode(''); setError(null); }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDisable} disabled={code.length !== 6 || loading}>
                {loading ? 'Desativando...' : 'Desativar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
