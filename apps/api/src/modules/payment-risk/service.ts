import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getSummary() {
  // Dados de demonstração têm data de criação fixa (definida no seed), então
  // uma janela "últimas 24h" relativa ao horário atual ficaria zerada assim
  // que passasse tempo real suficiente desde o seed. Os KPIs mostram o total
  // histórico das transações simuladas, não um recorte por tempo real.
  const [transactionsToday, blocked, suspicious, activeAutomations, byType, riskDistribution] = await Promise.all([
    repo.countTransactionsSince(),
    repo.countByStatusSince('bloqueada'),
    repo.countByStatusSince('suspeita'),
    repo.countActiveAutomations(),
    repo.countByType(),
    repo.countByRiskLevel(),
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
