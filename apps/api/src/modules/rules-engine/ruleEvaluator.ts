import { Parser } from 'expr-eval';
import { prisma } from '../../db/prisma.js';

const parser = new Parser();

export function evaluateCondition(expression: string, features: Record<string, number>, threshold: number | null): boolean {
  try {
    const expr = parser.parse(expression);
    return Boolean(expr.evaluate({ ...features, threshold: threshold ?? 0 }));
  } catch {
    return false;
  }
}

const SEVERITY_RANK: Record<string, number> = { leve: 1, moderado: 2, grave: 3 };
const RISK_RANK: Record<string, number> = { baixo: 1, medio: 2, alto: 3 };

interface FeatureRecord {
  id: string;
  label: string;
  features: Record<string, number>;
}

export async function loadFeatureSample(moduleKey: string, limit = 100): Promise<FeatureRecord[]> {
  switch (moduleKey) {
    case 'document_ai': {
      const rows = await prisma.documentCase.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
      return rows.map((r) => ({
        id: r.id,
        label: r.title,
        features: { confidence_score: Number(r.confidenceScore), severity_rank: SEVERITY_RANK[r.severity] },
      }));
    }
    case 'corporate_fraud': {
      const rows = await prisma.corporateEntity.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
      return rows.map((r) => ({
        id: r.id,
        label: r.title,
        features: {
          confidence_score: Number(r.confidenceScore),
          layers_count: r.layersCount,
          ubo_identified: r.uboIdentified ? 1 : 0,
        },
      }));
    }
    case 'payment_risk': {
      const rows = await prisma.paymentTransaction.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
      return rows.map((r) => ({
        id: r.id,
        label: `${r.type.toUpperCase()} ${r.externalRef}`,
        features: {
          amount: Number(r.amount),
          account_age_days: r.accountAgeDays ?? 0,
          risk_rank: RISK_RANK[r.riskLevel],
        },
      }));
    }
    case 'supplier_intelligence': {
      const rows = await prisma.supplierAlert.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
      return rows.map((r) => ({
        id: r.id,
        label: r.supplierName,
        features: { confidence_score: Number(r.confidenceScore), severity_rank: SEVERITY_RANK[r.severity] },
      }));
    }
    default:
      return [];
  }
}
