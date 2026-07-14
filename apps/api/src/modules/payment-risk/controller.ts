import type { Request, Response } from 'express';
import * as service from './service.js';

export async function summaryHandler(_req: Request, res: Response) {
  const summary = await service.getSummary();
  res.json(summary);
}

export async function alertsHandler(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 10);
  const alerts = await service.getRecentAlerts(limit);
  res.json(alerts);
}

export async function transactionDetailHandler(req: Request, res: Response) {
  const transaction = await service.getTransactionDetail(req.params.id);
  res.json(transaction);
}
