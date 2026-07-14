import { prisma } from '../../db/prisma.js';
import type { CaseStatus, SupplierCategory, Severity } from '@prisma/client';

export interface ListFilters {
  since?: Date;
  page: number;
  pageSize: number;
}

export async function listAlerts({ since, page, pageSize }: ListFilters) {
  const where = since ? { createdAt: { gte: since } } : {};

  const [items, total] = await Promise.all([
    prisma.supplierAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplierAlert.count({ where }),
  ]);

  return { items, total };
}

export async function statusCounts(since?: Date) {
  const where = since ? { createdAt: { gte: since } } : {};
  const rows = await prisma.supplierAlert.groupBy({ by: ['status'], where, _count: true });

  const counts: Record<CaseStatus, number> = { aprovado: 0, rejeitado: 0, aguardando: 0 };
  for (const row of rows) counts[row.status] = row._count;
  return counts;
}

export async function findAlertById(id: string) {
  return prisma.supplierAlert.findUnique({ where: { id } });
}

export async function createAlertEvent(input: {
  supplierAlertId: string;
  actorId?: string;
  fromStatus?: CaseStatus;
  toStatus: CaseStatus;
  action: 'bloquear' | 'liberar' | 'created' | 'auto_evaluated';
  reason?: string;
}) {
  return prisma.supplierAlertEvent.create({ data: input });
}

export async function updateAlertStatus(id: string, status: CaseStatus, decidedById?: string) {
  return prisma.supplierAlert.update({
    where: { id },
    data: { status, decidedAt: new Date(), decidedById },
  });
}

export async function createReportRequest(input: { supplierAlertId: string; requestedById?: string; recipientEmail: string }) {
  return prisma.supplierReportRequest.create({
    data: { ...input, status: 'sent', sentAt: new Date() },
  });
}

export interface NewAlertInput {
  alertNumber: string;
  supplierName: string;
  supplierCnpj: string;
  category: SupplierCategory;
  severity: Severity;
  status: CaseStatus;
  description: string;
  evidence: string[];
  confidenceScore: number;
  createdAt: Date;
}

export async function createAlert(input: NewAlertInput) {
  return prisma.supplierAlert.create({ data: input });
}
