import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { issueOtp, verifyOtp } from './otp.js';
import { issueTokenPair } from './tokens.js';
import { logAuthEvent } from './authEvents.js';
import { generateTwoFactorSecret, generateQrCodeDataUrl, verifyTwoFactorToken } from './twoFactor.js';
import type { AuthUser } from '@smartshield/shared';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@smartshield/shared';

const googleClient = new OAuth2Client({
  clientId: env.google.clientId,
  clientSecret: env.google.clientSecret,
  // Fluxo popup/postMessage do @react-oauth/google (flow: 'auth-code') exige
  // esse valor literal como redirect_uri na troca do code por tokens.
  redirectUri: 'postmessage',
});

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  twoFactorEnabled: boolean;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role as AuthUser['role'],
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export async function register(input: RegisterInput, meta: RequestMeta) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'Já existe uma conta com este e-mail');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  await issueOtp(user.email, 'signup', user.id);
  await logAuthEvent('otp_sent', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent, metadata: { purpose: 'signup' } });

  return { email: user.email };
}

export async function verifySignupOtp(email: string, code: string, meta: RequestMeta) {
  const valid = await verifyOtp(email, 'signup', code);
  if (!valid) throw new HttpError(400, 'Código inválido ou expirado');

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  await logAuthEvent('otp_verified', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent, metadata: { purpose: 'signup' } });

  const tokens = await issueTokenPair(user.id, user.role, meta);
  return { user: toAuthUser(user), ...tokens };
}

export async function login(input: LoginInput, meta: RequestMeta) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.passwordHash) {
    await logAuthEvent('login_failed', { ip: meta.ip, userAgent: meta.userAgent, metadata: { email: input.email } });
    throw new HttpError(401, 'E-mail ou senha incorretos');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    await logAuthEvent('login_failed', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent });
    throw new HttpError(401, 'E-mail ou senha incorretos');
  }

  if (user.twoFactorEnabled) {
    return { requiresTwoFactor: true as const, email: user.email };
  }

  await logAuthEvent('login_success', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent });
  const tokens = await issueTokenPair(user.id, user.role, meta);
  return { requiresTwoFactor: false as const, user: toAuthUser(user), ...tokens };
}

export async function completeTwoFactorLogin(email: string, token: string, meta: RequestMeta) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new HttpError(400, 'Verificação em duas etapas não está ativa para esta conta');
  }

  const valid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!valid) {
    await logAuthEvent('login_failed', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent, metadata: { stage: '2fa' } });
    throw new HttpError(401, 'Código de verificação inválido');
  }

  await logAuthEvent('login_success', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent, metadata: { via: '2fa' } });
  const tokens = await issueTokenPair(user.id, user.role, meta);
  return { user: toAuthUser(user), ...tokens };
}

export async function googleLogin(code: string, meta: RequestMeta) {
  if (!env.google.clientId || !env.google.clientSecret) {
    throw new HttpError(503, 'Login com Google não está configurado neste ambiente');
  }

  const { tokens: googleTokens } = await googleClient.getToken(code);
  if (!googleTokens.id_token) {
    throw new HttpError(400, 'Não foi possível validar o login com Google');
  }

  const ticket = await googleClient.verifyIdToken({ idToken: googleTokens.id_token, audience: env.google.clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new HttpError(400, 'Token do Google inválido');
  }

  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub, avatarUrl: payload.picture } });
    } else {
      user = await prisma.user.create({
        data: {
          name: payload.name ?? payload.email,
          email: payload.email,
          googleId: payload.sub,
          avatarUrl: payload.picture,
        },
      });
    }
  }

  await logAuthEvent('google_login', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent });
  const tokens = await issueTokenPair(user.id, user.role, meta);
  return { user: toAuthUser(user), ...tokens };
}

export async function forgotPassword(input: ForgotPasswordInput, meta: RequestMeta) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (user) {
    await issueOtp(user.email, 'password_reset', user.id);
    await logAuthEvent('password_reset_requested', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent });
  }
  // Resposta sempre genérica: não revela se o e-mail existe na base.
  return { message: 'Se o e-mail existir, um código de verificação foi enviado.' };
}

export async function resetPassword(input: ResetPasswordInput, meta: RequestMeta) {
  const valid = await verifyOtp(input.email, 'password_reset', input.code);
  if (!valid) throw new HttpError(400, 'Código inválido ou expirado');

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  const user = await prisma.user.update({ where: { email: input.email }, data: { passwordHash } });

  await logAuthEvent('password_reset_completed', { userId: user.id, ip: meta.ip, userAgent: meta.userAgent });
  return { message: 'Senha redefinida com sucesso.' };
}

export async function setupTwoFactor(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);

  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
  await prisma.twoFactorEvent.create({ data: { userId, eventType: 'setup_started' } });

  const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);
  return { qrCodeDataUrl, secret };
}

export async function confirmTwoFactor(userId: string, token: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.twoFactorSecret) throw new HttpError(400, 'Inicie a configuração do 2FA primeiro');

  const valid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!valid) {
    await prisma.twoFactorEvent.create({ data: { userId, eventType: 'failed_attempt' } });
    throw new HttpError(400, 'Código inválido');
  }

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  await prisma.twoFactorEvent.create({ data: { userId, eventType: 'enabled' } });
  await logAuthEvent('two_factor_enabled', { userId });

  return { enabled: true };
}

export async function disableTwoFactor(userId: string, token: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new HttpError(400, '2FA não está ativo');
  }

  const valid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!valid) {
    await prisma.twoFactorEvent.create({ data: { userId, eventType: 'failed_attempt' } });
    throw new HttpError(400, 'Código inválido');
  }

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await prisma.twoFactorEvent.create({ data: { userId, eventType: 'disabled' } });
  await logAuthEvent('two_factor_disabled', { userId });

  return { enabled: false };
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return toAuthUser(user);
}

export { toAuthUser };
