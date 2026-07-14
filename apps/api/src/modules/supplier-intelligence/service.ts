import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';

const RANGE_TO_HOURS: Record<string, number> = { '1h': 1, '12h': 12, '24h': 24, '60h': 60 };

function sinceFromRange(range?: string): Date | undefined {
  if (!range) return undefined;
  const hours = RANGE_TO_HOURS[range];
  if (!hours) return undefined;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function listAlerts(range: string | undefined, page: number, pageSize: number) {
  const since = sinceFromRange(range);
  const [{ items, total }, counts] = await Promise.all([
    repo.listAlerts({ since, page, pageSize }),
    repo.statusCounts(since),
  ]);

  return { items, total, page, pageSize, counts };
}

export async function getAlertDetail(id: string) {
  const alert = await repo.findAlertById(id);
  if (!alert) throw new HttpError(404, 'Alerta não encontrado');
  return alert;
}

export async function decideAlert(id: string, action: 'bloquear' | 'liberar', actorId: string, reason?: string) {
  const alert = await repo.findAlertById(id);
  if (!alert) throw new HttpError(404, 'Alerta não encontrado');

  const toStatus = action === 'bloquear' ? 'rejeitado' : 'aprovado';

  const updated = await repo.updateAlertStatus(id, toStatus, actorId);
  await repo.createAlertEvent({
    supplierAlertId: id,
    actorId,
    fromStatus: alert.status,
    toStatus,
    action,
    reason,
  });

  return updated;
}

export async function sendReport(id: string, recipientEmail: string, requestedById: string) {
  const alert = await repo.findAlertById(id);
  if (!alert) throw new HttpError(404, 'Alerta não encontrado');

  const { sendMail } = await import('../auth/mailer.js');
  await sendMail(
    recipientEmail,
    `Relatório de fornecedor — ${alert.supplierName}`,
    `Relatório do alerta ${alert.alertNumber} referente ao fornecedor ${alert.supplierName} (CNPJ ${alert.supplierCnpj}).\n\n${alert.description}`,
  );

  return repo.createReportRequest({ supplierAlertId: id, requestedById, recipientEmail });
}
