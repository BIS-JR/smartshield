import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getSummary() {
  const since = repo.LAST_24H();

  const [transactionsToday, blocked, suspicious, activeAutomations, byType, riskDistribution] = await Promise.all([
    repo.countTransactionsSince(since),
    repo.countByStatusSince('bloqueada', since),
    repo.countByStatusSince('suspeita', since),
    repo.countActiveAutomations(),
    repo.countByType(since),
    repo.countByRiskLevel(since),
  ]);

  return { transactionsToday, blocked, suspicious, activeAutomations, byType, riskDistribution };
}

export async function getRecentAlerts(limit: number) {
  return repo.recentAlerts(limit);
}

export async function getTransactionDetail(id: string) {
  const transaction = await repo.findById(id);
  if (!transaction) throw new HttpError(404, 'Transação não encontrada');
  return transaction;
}
