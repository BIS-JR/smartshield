import type { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './service.js';
import { rotateRefreshToken, revokeRefreshToken } from './tokens.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE = 'smartshield_refresh';

function meta(req: Request) {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    // 'none' é necessário para o cookie ser enviado quando o frontend está
    // num domínio diferente da API (ex: Vercel + Render); exige Secure.
    // Em dev local (http, mesmo domínio/porta) usamos 'lax' sem Secure.
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.register(req.body, meta(req));
  res.status(201).json(result);
}

export async function verifySignupOtpHandler(req: Request, res: Response) {
  const { email, code } = req.body;
  const { user, accessToken, refreshToken } = await authService.verifySignupOtp(email, code, meta(req));
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body, meta(req));
  if (result.requiresTwoFactor) {
    return res.json({ requiresTwoFactor: true, email: result.email });
  }
  setRefreshCookie(res, result.refreshToken);
  res.json({ requiresTwoFactor: false, user: result.user, accessToken: result.accessToken });
}

export async function twoFactorLoginHandler(req: Request, res: Response) {
  const { email, token } = req.body;
  const { user, accessToken, refreshToken } = await authService.completeTwoFactorLogin(email, token, meta(req));
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function googleLoginHandler(req: Request, res: Response) {
  const { code } = req.body;
  const { user, accessToken, refreshToken } = await authService.googleLogin(code, meta(req));
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  const result = await authService.forgotPassword(req.body, meta(req));
  res.json(result);
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const result = await authService.resetPassword(req.body, meta(req));
  res.json(result);
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, 'Sessão ausente ou expirada');

  const result = await rotateRefreshToken(token, meta(req));
  if (!result) throw new HttpError(401, 'Sessão ausente ou expirada');

  setRefreshCookie(res, result.refreshToken);
  res.json({ user: authService.toAuthUser(result.user), accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await revokeRefreshToken(token);
  }
  res.clearCookie(REFRESH_COOKIE, {
    path: '/api/auth',
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
  });
  if (req.userId) {
    const { logAuthEvent } = await import('./authEvents.js');
    await logAuthEvent('logout', { userId: req.userId, ...meta(req) });
  }
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.userId!);
  res.json({ user });
}

export async function setupTwoFactorHandler(req: Request, res: Response) {
  const result = await authService.setupTwoFactor(req.userId!);
  res.json(result);
}

const confirmSchema = z.object({ token: z.string().length(6) });

export async function confirmTwoFactorHandler(req: Request, res: Response) {
  const { token } = confirmSchema.parse(req.body);
  const result = await authService.confirmTwoFactor(req.userId!, token);
  res.json(result);
}

export async function disableTwoFactorHandler(req: Request, res: Response) {
  const { token } = confirmSchema.parse(req.body);
  const result = await authService.disableTwoFactor(req.userId!, token);
  res.json(result);
}
