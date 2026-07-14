import type { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listHandler(req: Request, res: Response) {
  const range = typeof req.query.range === 'string' ? req.query.range : undefined;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);

  const result = await service.listCases(range, page, pageSize);
  res.json(result);
}

export async function detailHandler(req: Request, res: Response) {
  const documentCase = await service.getCaseDetail(req.params.id);
  res.json(documentCase);
}

const decisionSchema = z.object({
  action: z.enum(['bloquear', 'liberar']),
  reason: z.string().optional(),
});

export async function decisionHandler(req: Request, res: Response) {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Dados inválidos');
  }

  const updated = await service.decideCase(req.params.id, parsed.data.action, req.userId!, parsed.data.reason);
  res.json(updated);
}
