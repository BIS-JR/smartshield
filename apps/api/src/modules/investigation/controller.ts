import type { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listHandler(_req: Request, res: Response) {
  res.json(await service.listBlocks());
}

export async function detailHandler(req: Request, res: Response) {
  res.json(await service.getBlock(req.params.id));
}

export async function briefingHandler(req: Request, res: Response) {
  res.json(await service.getOrCreateBriefing(req.params.id));
}

export async function messagesHandler(req: Request, res: Response) {
  res.json(await service.getMessages(req.params.id));
}

const questionSchema = z.object({ question: z.string().min(1) });

export async function askHandler(req: Request, res: Response) {
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'Pergunta inválida');

  res.json(await service.askQuestion(req.params.id, parsed.data.question));
}

const unblockSchema = z.object({ reason: z.string().optional() });

export async function unblockHandler(req: Request, res: Response) {
  const parsed = unblockSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'Dados inválidos');

  res.json(await service.unblock(req.params.id, req.userId!, parsed.data.reason));
}
