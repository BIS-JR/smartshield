import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'O código tem 6 dígitos'),
  purpose: z.enum(['signup', 'login', 'password_reset']),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const googleLoginSchema = z.object({
  code: z.string().min(1),
});
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const twoFactorVerifySchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, 'O código tem 6 dígitos'),
});
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;

export const twoFactorDisableSchema = z.object({
  token: z.string().length(6, 'O código tem 6 dígitos'),
});
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'analyst' | 'viewer';
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
