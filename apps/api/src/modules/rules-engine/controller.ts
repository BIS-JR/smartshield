import type { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

const ruleSchema = z.object({
  name: z.string().min(2),
  moduleKey: z.enum(['document_ai', 'corporate_fraud', 'payment_risk', 'supplier_intelligence', 'investigation']),
  description: z.string().optional(),
  conditionExpression: z.string().min(1),
  threshold: z.number().optional(),
  outputSeverity: z.enum(['leve', 'moderado', 'grave']),
  action: z.enum(['bloquear', 'revisar', 'alertar']),
});

export async function listHandler(req: Request, res: Response) {
  const moduleKey = typeof req.query.module === 'string' ? req.query.module : undefined;
  res.json(await service.listRules(moduleKey));
}

export async function createHandler(req: Request, res: Response) {
  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Dados inválidos');

  const rule = await service.createRule(parsed.data, req.userId!);
  res.status(201).json(rule);
}

export async function updateHandler(req: Request, res: Response) {
  const parsed = ruleSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Dados inválidos');

  const rule = await service.updateRule(req.params.id, parsed.data, req.userId!);
  res.json(rule);
}

const activeSchema = z.object({ isActive: z.boolean() });

export async function setActiveHandler(req: Request, res: Response) {
  const parsed = activeSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'Dados inválidos');

  const rule = await service.setActive(req.params.id, parsed.data.isActive, req.userId!);
  res.json(rule);
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteRule(req.params.id, req.userId!);
  res.status(204).send();
}

export async function testHandler(req: Request, res: Response) {
  res.json(await service.testRule(req.params.id));
}
