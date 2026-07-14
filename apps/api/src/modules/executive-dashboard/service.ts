import * as repo from './repository.js';

interface Row {
  severity: string;
  status: string;
  createdAt: Date;
}

export async function getSummary() {
  const { documentCases, corporateEntities, supplierAlerts } = await repo.getTotals();
  const blockedAmount = await repo.getBlockedPaymentAmount();

  const all = [...documentCases, ...corporateEntities, ...supplierAlerts];
  const totalIncidents = all.length;
  const fraudsDetected = all.filter((r) => r.severity === 'grave').length;
  const activeBlocks = all.filter((r) => r.status === 'rejeitado').length;
  const estimatedRoi = blockedAmount + activeBlocks * repo.AVG_FRAUD_VALUE_PREVENTED;

  return { totalIncidents, fraudsDetected, activeBlocks, estimatedRoi };
}

export async function getFraudByModule() {
  const { documentCases, corporateEntities, supplierAlerts } = await repo.getTotals();

  const countFraud = (rows: Row[]) => rows.filter((r) => r.severity === 'grave' || r.status === 'rejeitado').length;

  return {
    document_ai: countFraud(documentCases),
    corporate_fraud: countFraud(corporateEntities),
    supplier_intelligence: countFraud(supplierAlerts),
  };
}

export async function getSeverityDistribution() {
  const { documentCases, corporateEntities, supplierAlerts } = await repo.getTotals();
  const all = [...documentCases, ...corporateEntities, ...supplierAlerts];

  return {
    leve: all.filter((r) => r.severity === 'leve').length,
    moderado: all.filter((r) => r.severity === 'moderado').length,
    grave: all.filter((r) => r.severity === 'grave').length,
  };
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getWeeklyTrends() {
  const { documentCases, corporateEntities, supplierAlerts } = await repo.getTotals();

  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }

  function bucketByDay(rows: Row[]) {
    const counts = new Map(days.map((d) => [d, 0]));
    for (const row of rows) {
      const key = dayKey(row.createdAt);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return days.map((d) => counts.get(d) ?? 0);
  }

  return {
    days,
    documentAi: bucketByDay(documentCases),
    corporateFraud: bucketByDay(corporateEntities),
    supplierIntelligence: bucketByDay(supplierAlerts),
  };
}

export async function getRegionRisk() {
  return repo.getRegionRisk();
}
