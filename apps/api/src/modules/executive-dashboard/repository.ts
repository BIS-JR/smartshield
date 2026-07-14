import { prisma } from '../../db/prisma.js';

const AVG_FRAUD_VALUE_PREVENTED = 45000;

export async function getTotals() {
  const [documentCases, corporateEntities, supplierAlerts] = await Promise.all([
    prisma.documentCase.findMany({ select: { severity: true, status: true, createdAt: true } }),
    prisma.corporateEntity.findMany({ select: { severity: true, status: true, createdAt: true } }),
    prisma.supplierAlert.findMany({ select: { severity: true, status: true, createdAt: true } }),
  ]);

  return { documentCases, corporateEntities, supplierAlerts };
}

export async function getBlockedPaymentAmount() {
  const result = await prisma.paymentTransaction.aggregate({
    where: { status: 'bloqueada' },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

const TRACKED_REGIONS = ['SP', 'RJ', 'MG', 'PR', 'RS', 'BA'];

export async function getRegionRisk() {
  const rows = await prisma.paymentTransaction.groupBy({
    by: ['originState'],
    where: { originState: { in: TRACKED_REGIONS } },
    _count: true,
  });

  const highRiskRows = await prisma.paymentTransaction.groupBy({
    by: ['originState'],
    where: { originState: { in: TRACKED_REGIONS }, riskLevel: 'alto' },
    _count: true,
  });

  const highRiskMap = new Map(highRiskRows.map((r) => [r.originState, r._count]));
  const totalsMap = new Map(rows.map((r) => [r.originState, r._count]));

  return TRACKED_REGIONS.map((region) => {
    const total = totalsMap.get(region) ?? 0;
    const highRisk = highRiskMap.get(region) ?? 0;
    return {
      region,
      incidentCount: total,
      riskPercentage: total > 0 ? Math.round((highRisk / total) * 100) : 0,
    };
  }).sort((a, b) => b.riskPercentage - a.riskPercentage);
}

export { AVG_FRAUD_VALUE_PREVENTED };
