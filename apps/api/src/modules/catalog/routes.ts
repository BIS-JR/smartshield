import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const catalogRouter = Router();

catalogRouter.get(
  '/',
  authGuard,
  asyncHandler(async (_req, res) => {
    const modules = await prisma.module.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(modules);
  }),
);
