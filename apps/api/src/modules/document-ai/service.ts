import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';

const RANGE_TO_HOURS: Record<string, number> = { '1h': 1, '12h': 12, '24h': 24, '60h': 60 };

function sinceFromRange(range?: string): Date | undefined {
  if (!range) return undefined;
  const hours = RANGE_TO_HOURS[range];
  if (!hours) return undefined;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function listCases(range: string | undefined, page: number, pageSize: number) {
  const since = sinceFromRange(range);
  const [{ items, total }, counts] = await Promise.all([
    repo.listCases({ since, page, pageSize }),
    repo.statusCounts(since),
  ]);

  return { items, total, page, pageSize, counts };
}

export async function getCaseDetail(id: string) {
  const documentCase = await repo.findCaseById(id);
  if (!documentCase) throw new HttpError(404, 'Caso não encontrado');
  return documentCase;
}

export async function decideCase(
  id: string,
  action: 'bloquear' | 'liberar',
  actorId: string,
  reason?: string,
) {
  const documentCase = await repo.findCaseById(id);
  if (!documentCase) throw new HttpError(404, 'Caso não encontrado');

  const toStatus = action === 'bloquear' ? 'rejeitado' : 'aprovado';

  const updated = await repo.updateCaseStatus(id, toStatus, actorId);
  await repo.createCaseEvent({
    documentCaseId: id,
    actorId,
    fromStatus: documentCase.status,
    toStatus,
    action,
    reason,
  });

  return updated;
}
