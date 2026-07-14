import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36.4 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

interface GoogleAuthButtonProps {
  onAuthCode: (code: string) => void;
}

/**
 * Só chama useGoogleLogin quando há um Client ID real configurado. O hook
 * inicializa o script do Google Identity Services e falha ao inicializar
 * com client_id vazio, então precisa ficar isolado num componente que só
 * monta quando o login com Google está de fato disponível.
 */
function GoogleLoginButton({ onAuthCode }: GoogleAuthButtonProps) {
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (response) => onAuthCode(response.code),
  });

  return (
    <Button type="button" variant="outline" className="w-full" onClick={() => login()}>
      <GoogleIcon />
      Continuar com Google
    </Button>
  );
}

export function GoogleAuthButton({ onAuthCode }: GoogleAuthButtonProps) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled title="Login com Google não configurado">
        <GoogleIcon />
        Continuar com Google
      </Button>
    );
  }

  return <GoogleLoginButton onAuthCode={onAuthCode} />;
}
