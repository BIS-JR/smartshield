import { prisma } from '../../db/prisma.js';
import type { AuthEventType } from '@prisma/client';

export async function logAuthEvent(
  eventType: AuthEventType,
  opts: { userId?: string; ip?: string; userAgent?: string; metadata?: object },
) {
  await prisma.authEvent.create({
    data: {
      eventType,
      userId: opts.userId,
      ip: opts.ip,
      userAgent: opts.userAgent,
      metadata: opts.metadata,
    },
  });
}
