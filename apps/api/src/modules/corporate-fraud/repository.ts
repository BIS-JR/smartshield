import { prisma } from '../../db/prisma.js';
import type { CaseStatus, CorporateCategory, Severity, ReportType, AutomationStatus } from '@prisma/client';

export interface ListFilters {
  since?: Date;
  page: number;
  pageSize: number;
}

export async function listEntities({ since, page, pageSize }: ListFilters) {
  const where = since ? { createdAt: { gte: since } } : {};

  const [items, total] = await Promise.all([
    prisma.corporateEntity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.corporateEntity.count({ where }),
  ]);

  return { items, total };
}

export async function statusCounts(since?: Date) {
  const where = since ? { createdAt: { gte: since } } : {};
  const rows = await prisma.corporateEntity.groupBy({ by: ['status'], where, _count: true });

  const counts: Record<CaseStatus, number> = { aprovado: 0, rejeitado: 0, aguardando: 0 };
  for (const row of rows) counts[row.status] = row._count;
  return counts;
}

export async function findEntityById(id: string) {
  return prisma.corporateEntity.findUnique({ where: { id } });
}

export async function findGraph(corporateEntityId: string) {
  const [nodes, edges] = await Promise.all([
    prisma.graphNode.findMany({ where: { corporateEntityId } }),
    prisma.graphEdge.findMany({ where: { corporateEntityId } }),
  ]);
  return { nodes, edges };
}

export async function createEntityEvent(input: {
  corporateEntityId: string;
  actorId?: string;
  fromStatus?: CaseStatus;
  toStatus: CaseStatus;
  action: 'bloquear' | 'liberar' | 'created' | 'auto_evaluated';
  reason?: string;
}) {
  return prisma.corporateEntityEvent.create({ data: input });
}

export async function updateEntityStatus(id: string, status: CaseStatus, decidedById?: string) {
  return prisma.corporateEntity.update({
    where: { id },
    data: { status, decidedAt: new Date(), decidedById },
  });
}

export async function createReportRequest(input: {
  corporateEntityId: string;
  requestedById?: string;
  reportType: ReportType;
  recipientEmail: string;
}) {
  return prisma.graphReportRequest.create({
    data: { ...input, status: 'sent', sentAt: new Date() },
  });
}

export async function createAutomationTrigger(input: {
  corporateEntityId: string;
  triggeredById?: string;
  status: AutomationStatus;
  metadata?: object;
}) {
  return prisma.automationTrigger.create({
    data: { ...input, triggerType: 'congelar_pix_ted' },
  });
}

export interface NewEntityInput {
  entityNumber: string;
  title: string;
  docNumber?: string;
  category: CorporateCategory;
  severity: Severity;
  status: CaseStatus;
  layersCount: number;
  uboIdentified: boolean;
  uboName?: string;
  confidenceScore: number;
  createdAt: Date;
}

export async function createEntity(input: NewEntityInput) {
  return prisma.corporateEntity.create({ data: input });
}

export async function createGraphNodes(
  corporateEntityId: string,
  nodes: { key: string; nodeType: string; label: string }[],
) {
  const created = await prisma.$transaction(
    nodes.map((n) =>
      prisma.graphNode.create({
        data: { corporateEntityId, nodeType: n.nodeType as any, label: n.label },
      }),
    ),
  );
  const keyToId = new Map(nodes.map((n, i) => [n.key, created[i].id]));
  return keyToId;
}

export async function createGraphEdges(
  corporateEntityId: string,
  edges: { sourceId: string; targetId: string; relationType: string; weight: number }[],
) {
  await prisma.graphEdge.createMany({
    data: edges.map((e) => ({
      corporateEntityId,
      sourceNodeId: e.sourceId,
      targetNodeId: e.targetId,
      relationType: e.relationType,
      weight: e.weight,
    })),
  });
}
