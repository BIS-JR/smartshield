import { prisma } from '../../db/prisma.js';
import type { PaymentType, RiskLevel } from '@prisma/client';

const LAST_24H = () => new Date(Date.now() - 24 * 60 * 60 * 1000);

export async function countTransactionsSince(since?: Date) {
  return prisma.paymentTransaction.count({ where: since ? { createdAt: { gte: since } } : {} });
}

export async function countByStatusSince(status: 'bloqueada' | 'suspeita', since?: Date) {
  return prisma.paymentTransaction.count({ where: since ? { status, createdAt: { gte: since } } : { status } });
}

export async function countActiveAutomations() {
  return prisma.automationTrigger.count({ where: { status: 'confirmed' } });
}

export async function countByType(since?: Date) {
  const rows = await prisma.paymentTransaction.groupBy({
    by: ['type'],
    where: since ? { createdAt: { gte: since } } : {},
    _count: true,
  });
  const counts: Record<PaymentType, number> = { pix: 0, ted: 0, doc: 0, boleto: 0 };
  for (const row of rows) counts[row.type] = row._count;
  return counts;
}

export async function countByRiskLevel(since?: Date) {
  const rows = await prisma.paymentTransaction.groupBy({
    by: ['riskLevel'],
    where: since ? { createdAt: { gte: since } } : {},
    _count: true,
  });
  const counts: Record<RiskLevel, number> = { baixo: 0, medio: 0, alto: 0 };
  for (const row of rows) counts[row.riskLevel] = row._count;
  return counts;
}

export async function recentAlerts(limit: number) {
  return prisma.paymentTransaction.findMany({
    where: { status: { in: ['bloqueada', 'suspeita'] } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function findById(id: string) {
  return prisma.paymentTransaction.findUnique({ where: { id } });
}

export interface NewTransactionInput {
  externalRef: string;
  type: PaymentType;
  amount: number;
  riskLevel: RiskLevel;
  status: 'aprovada' | 'bloqueada' | 'suspeita';
  description?: string;
  accountAgeDays?: number;
  destination?: string;
  createdAt: Date;
}

export async function createTransaction(input: NewTransactionInput) {
  return prisma.paymentTransaction.create({ data: input });
}

export { LAST_24H };
