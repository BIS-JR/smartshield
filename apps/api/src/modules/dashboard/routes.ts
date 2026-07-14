import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import type { CaseStatus } from '@prisma/client';

export const dashboardRouter = Router();

interface StatusCounts {
  aprovado: number;
  rejeitado: number;
  aguardando: number;
}

function toCounts(rows: { status: CaseStatus; _count: number }[]): StatusCounts {
  const counts: StatusCounts = { aprovado: 0, rejeitado: 0, aguardando: 0 };
  for (const row of rows) {
    counts[row.status] = row._count;
  }
  return counts;
}

dashboardRouter.get(
  '/summary',
  authGuard,
  asyncHandler(async (_req, res) => {
    const [documentAiRows, corporateFraudRows] = await Promise.all([
      prisma.documentCase.groupBy({ by: ['status'], _count: true }),
      prisma.corporateEntity.groupBy({ by: ['status'], _count: true }),
    ]);

    res.json({
      document_ai: toCounts(documentAiRows.map((r) => ({ status: r.status, _count: r._count }))),
      corporate_fraud: toCounts(corporateFraudRows.map((r) => ({ status: r.status, _count: r._count }))),
    });
  }),
);
