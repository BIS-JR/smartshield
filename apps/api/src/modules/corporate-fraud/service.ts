import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';
import type { ReportType } from '@prisma/client';

const RANGE_TO_HOURS: Record<string, number> = { '1h': 1, '12h': 12, '24h': 24, '60h': 60 };

function sinceFromRange(range?: string): Date | undefined {
  if (!range) return undefined;
  const hours = RANGE_TO_HOURS[range];
  if (!hours) return undefined;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function listEntities(range: string | undefined, page: number, pageSize: number) {
  const since = sinceFromRange(range);
  const [{ items, total }, counts] = await Promise.all([
    repo.listEntities({ since, page, pageSize }),
    repo.statusCounts(since),
  ]);

  return { items, total, page, pageSize, counts };
}

export async function getEntityDetail(id: string) {
  const entity = await repo.findEntityById(id);
  if (!entity) throw new HttpError(404, 'Entidade não encontrada');
  return entity;
}

export async function getGraph(id: string) {
  const entity = await repo.findEntityById(id);
  if (!entity) throw new HttpError(404, 'Entidade não encontrada');
  return repo.findGraph(id);
}

export async function decideEntity(id: string, action: 'bloquear' | 'liberar', actorId: string, reason?: string) {
  const entity = await repo.findEntityById(id);
  if (!entity) throw new HttpError(404, 'Entidade não encontrada');

  const toStatus = action === 'bloquear' ? 'rejeitado' : 'aprovado';

  const updated = await repo.updateEntityStatus(id, toStatus, actorId);
  await repo.createEntityEvent({
    corporateEntityId: id,
    actorId,
    fromStatus: entity.status,
    toStatus,
    action,
    reason,
  });

  return updated;
}

export async function sendReport(id: string, reportType: ReportType, recipientEmail: string, requestedById: string) {
  const entity = await repo.findEntityById(id);
  if (!entity) throw new HttpError(404, 'Entidade não encontrada');

  const REPORT_LABEL: Record<ReportType, string> = {
    rede_relacionamentos: 'Rede de Relacionamentos',
    nos_suspeitos: 'Nós Suspeitos',
    casca_cebola: 'Casca de Cebola',
  };

  const { sendMail } = await import('../auth/mailer.js');
  await sendMail(
    recipientEmail,
    `Relatório de ${REPORT_LABEL[reportType]} — ${entity.title}`,
    `Relatório do tipo "${REPORT_LABEL[reportType]}" referente à entidade ${entity.entityNumber} (${entity.title}).`,
  );

  return repo.createReportRequest({ corporateEntityId: id, requestedById, reportType, recipientEmail });
}

export async function freezeTransactions(id: string, actorId: string) {
  const entity = await repo.findEntityById(id);
  if (!entity) throw new HttpError(404, 'Entidade não encontrada');

  return repo.createAutomationTrigger({
    corporateEntityId: id,
    triggeredById: actorId,
    status: 'confirmed',
    metadata: { entityNumber: entity.entityNumber, title: entity.title },
  });
}
