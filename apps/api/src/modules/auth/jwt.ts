import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as unknown as AccessTokenPayload;
}

export function signRefreshToken(payload: { sub: string }): string {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as unknown as { sub: string };
}
