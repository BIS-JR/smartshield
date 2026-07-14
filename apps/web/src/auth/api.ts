import { api } from '@/lib/api';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthUser,
} from '@smartshield/shared';

interface SessionResponse {
  user: AuthUser;
  accessToken: string;
}

interface LoginResponse {
  requiresTwoFactor: boolean;
  email?: string;
  user?: AuthUser;
  accessToken?: string;
}

export async function registerRequest(input: RegisterInput) {
  const { data } = await api.post<{ email: string }>('/auth/register', input);
  return data;
}

export async function verifySignupOtpRequest(email: string, code: string) {
  const { data } = await api.post<SessionResponse>('/auth/verify-signup-otp', {
    email,
    code,
    purpose: 'signup',
  });
  return data;
}

export async function loginRequest(input: LoginInput) {
  const { data } = await api.post<LoginResponse>('/auth/login', input);
  return data;
}

export async function twoFactorLoginRequest(email: string, token: string) {
  const { data } = await api.post<SessionResponse>('/auth/2fa/login', { email, token });
  return data;
}

export async function googleLoginRequest(code: string) {
  const { data } = await api.post<SessionResponse>('/auth/google', { code });
  return data;
}

export async function forgotPasswordRequest(input: ForgotPasswordInput) {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', input);
  return data;
}

export async function resetPasswordRequest(input: ResetPasswordInput) {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', input);
  return data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

export async function meRequest() {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me');
  return data.user;
}

export async function setupTwoFactorRequest() {
  const { data } = await api.post<{ qrCodeDataUrl: string; secret: string }>('/auth/2fa/setup');
  return data;
}

export async function confirmTwoFactorRequest(token: string) {
  const { data } = await api.post<{ enabled: boolean }>('/auth/2fa/confirm', { token });
  return data;
}

export async function disableTwoFactorRequest(token: string) {
  const { data } = await api.post<{ enabled: boolean }>('/auth/2fa/disable', { token });
  return data;
}
