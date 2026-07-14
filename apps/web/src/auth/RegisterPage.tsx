import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@smartshield/shared';
import { AuthCardShell } from './AuthCardShell';
import { GoogleAuthButton } from './GoogleAuthButton';
import { OtpInput } from './OtpInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { registerRequest, verifySignupOtpRequest, googleLoginRequest } from './api';
import { useAuthStore } from '@/stores/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(input: RegisterInput) {
    setServerError(null);
    try {
      const result = await registerRequest(input);
      setEmail(result.email);
      setStep('otp');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Não foi possível criar a conta.');
    }
  }

  async function handleVerifyOtp() {
    setServerError(null);
    setOtpSubmitting(true);
    try {
      const { user, accessToken } = await verifySignupOtpRequest(email, otp);
      setSession(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Código inválido.');
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function handleGoogle(code: string) {
    setServerError(null);
    try {
      const { user, accessToken } = await googleLoginRequest(code);
      setSession(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Não foi possível continuar com o Google.');
    }
  }

  if (step === 'otp') {
    return (
      <AuthCardShell title="Confirme seu e-mail" subtitle={`Enviamos um código para ${email}`}>
        <div className="flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} />
          {serverError && <p className="text-sm text-status-critical">{serverError}</p>}
          <Button className="w-full" disabled={otp.length !== 6 || otpSubmitting} onClick={handleVerifyOtp}>
            {otpSubmitting ? 'Verificando...' : 'Confirmar código'}
          </Button>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Criar conta"
      subtitle="Comece a usar o SmartShield"
      icon={<UserPlus className="h-6 w-6 text-primary-foreground" />}
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
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
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Seu nome" icon={<User className="h-4 w-4" />} {...register('name')} />
            {errors.name && <p className="text-xs text-status-critical">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} {...register('email')} />
            {errors.email && <p className="text-xs text-status-critical">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} {...register('password')} />
            {errors.password && <p className="text-xs text-status-critical">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-status-critical">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </AuthCardShell>
  );
}
