import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordInput, type ResetPasswordInput } from '@smartshield/shared';
import { AuthCardShell } from './AuthCardShell';
import { OtpInput } from './OtpInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { forgotPasswordRequest, resetPasswordRequest } from './api';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const requestForm = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const resetForm = useForm<Omit<ResetPasswordInput, 'email' | 'code'>>({
    resolver: zodResolver(resetPasswordSchema.omit({ email: true, code: true })),
  });
  const [code, setCode] = useState('');

  async function onRequest(input: ForgotPasswordInput) {
    setServerError(null);
    try {
      await forgotPasswordRequest(input);
      setEmail(input.email);
      setStep('reset');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Não foi possível enviar o código.');
    }
  }

  async function onReset(input: { newPassword: string }) {
    setServerError(null);
    try {
      await resetPasswordRequest({ email, code, newPassword: input.newPassword });
      setStep('done');
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Código inválido ou expirado.');
    }
  }

  if (step === 'done') {
    return (
      <AuthCardShell title="Senha redefinida" subtitle="Sua senha foi atualizada com sucesso">
        <Button asChild className="w-full">
          <Link to="/login">Voltar para o login</Link>
        </Button>
      </AuthCardShell>
    );
  }

  if (step === 'reset') {
    return (
      <AuthCardShell title="Redefinir senha" subtitle={`Enviamos um código para ${email}`} icon={<KeyRound className="h-6 w-6 text-primary-foreground" />}>
        <form onSubmit={resetForm.handleSubmit(onReset)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Código de verificação</Label>
            <OtpInput value={code} onChange={setCode} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" {...resetForm.register('newPassword')} />
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-status-critical">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-status-critical">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={code.length !== 6 || resetForm.formState.isSubmitting}>
            {resetForm.formState.isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Esqueceu a senha?"
      subtitle="Informe seu e-mail para receber um código"
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={requestForm.handleSubmit(onRequest)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} {...requestForm.register('email')} />
          {requestForm.formState.errors.email && (
            <p className="text-xs text-status-critical">{requestForm.formState.errors.email.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-status-critical">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={requestForm.formState.isSubmitting}>
          {requestForm.formState.isSubmitting ? 'Enviando...' : 'Enviar código'}
        </Button>
      </form>
    </AuthCardShell>
  );
}
