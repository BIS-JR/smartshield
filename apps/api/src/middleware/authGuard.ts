import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../modules/auth/jwt.js';
import { HttpError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new HttpError(401, 'Sessão ausente ou expirada');
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new HttpError(401, 'Sessão ausente ou expirada');
  }
}
