import crypto from 'node:crypto';
import { prisma } from '../../db/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function issueTokenPair(userId: string, role: string, meta: { ip?: string; userAgent?: string }) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });

  const decoded = verifyRefreshToken(refreshToken);
  void decoded;

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      ip: meta.ip,
      userAgent: meta.userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(refreshToken: string, meta: { ip?: string; userAgent?: string }) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null },
  });

  if (!stored || stored.expiresAt < new Date()) {
    return null;
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  return issueTokenPair(user.id, user.role, meta).then((pair) => ({ ...pair, user }));
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
