import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginInput } from '@smartshield/shared';
import { AuthCardShell } from './AuthCardShell';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { loginRequest, googleLoginRequest } from './api';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(input: LoginInput) {
    setServerError(null);
    try {
      const result = await loginRequest(input);
      if (result.requiresTwoFactor) {
        navigate(`/verificar-2fa?email=${encodeURIComponent(result.email!)}`);
        return;
      }
      setSession(result.user!, result.accessToken!);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Não foi possível entrar. Tente novamente.');
    }
  }

  async function handleGoogle(code: string) {
    setServerError(null);
    try {
      const { user, accessToken } = await googleLoginRequest(code);
      setSession(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Não foi possível entrar com o Google.');
    }
  }

  return (
    <AuthCardShell
      title="Bem-vindo de volta"
      subtitle="Acesse sua conta"
      footer={
        <>
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <GoogleAuthButton onAuthCode={handleGoogle} />

        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} {...register('email')} />
            {errors.email && <p className="text-xs text-status-critical">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link to="/esqueci-senha" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} {...register('password')} />
            {errors.password && <p className="text-xs text-status-critical">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-status-critical">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </AuthCardShell>
  );
}
