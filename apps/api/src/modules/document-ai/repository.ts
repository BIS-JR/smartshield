import { prisma } from '../../db/prisma.js';
import type { CaseStatus, DocumentCategory, Severity } from '@prisma/client';

export interface ListFilters {
  since?: Date;
  page: number;
  pageSize: number;
}

export async function listCases({ since, page, pageSize }: ListFilters) {
  const where = since ? { createdAt: { gte: since } } : {};

  const [items, total] = await Promise.all([
    prisma.documentCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.documentCase.count({ where }),
  ]);

  return { items, total };
}

export async function statusCounts(since?: Date) {
  const where = since ? { createdAt: { gte: since } } : {};
  const rows = await prisma.documentCase.groupBy({ by: ['status'], where, _count: true });

  const counts: Record<CaseStatus, number> = { aprovado: 0, rejeitado: 0, aguardando: 0 };
  for (const row of rows) counts[row.status] = row._count;
  return counts;
}

export async function findCaseById(id: string) {
  return prisma.documentCase.findUnique({ where: { id } });
}

export async function createCaseEvent(input: {
  documentCaseId: string;
  actorId?: string;
  fromStatus?: CaseStatus;
  toStatus: CaseStatus;
  action: 'bloquear' | 'liberar' | 'created' | 'auto_evaluated';
  reason?: string;
}) {
  return prisma.documentCaseEvent.create({ data: input });
}

export async function updateCaseStatus(id: string, status: CaseStatus, decidedById?: string) {
  return prisma.documentCase.update({
    where: { id },
    data: { status, decidedAt: new Date(), decidedById },
  });
}

export interface NewCaseInput {
  caseNumber: string;
  title: string;
  category: DocumentCategory;
  severity: Severity;
  status: CaseStatus;
  requesterName: string;
  requesterEmail: string;
  requesterCpf: string;
  documentUrl?: string;
  fraudReason?: string;
  confidenceScore: number;
  createdAt: Date;
}

export async function createCase(input: NewCaseInput) {
  return prisma.documentCase.create({ data: input });
}
