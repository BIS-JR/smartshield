import type { Request, Response } from 'express';
import * as service from './service.js';

export async function summaryHandler(_req: Request, res: Response) {
  res.json(await service.getSummary());
}

export async function fraudByModuleHandler(_req: Request, res: Response) {
  res.json(await service.getFraudByModule());
}

export async function severityDistributionHandler(_req: Request, res: Response) {
  res.json(await service.getSeverityDistribution());
}

export async function trendsHandler(_req: Request, res: Response) {
  res.json(await service.getWeeklyTrends());
}

export async function regionRiskHandler(_req: Request, res: Response) {
  res.json(await service.getRegionRisk());
}
