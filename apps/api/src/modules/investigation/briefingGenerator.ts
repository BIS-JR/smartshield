import { prisma } from '../../db/prisma.js';
import type { SourceRecordType, Severity } from '@prisma/client';

interface SourceSummary {
  title: string;
  requesterOrHolder: string | null;
  reasonText: string | null;
  evidence: string[];
  severity: Severity;
  confidenceScore: number | null;
  extra: Record<string, string>;
}

async function loadSource(sourceRecordType: SourceRecordType, sourceRecordId: string): Promise<SourceSummary | null> {
  switch (sourceRecordType) {
    case 'document_case': {
      const doc = await prisma.documentCase.findUnique({ where: { id: sourceRecordId } });
      if (!doc) return null;
      return {
        title: doc.title,
        requesterOrHolder: doc.requesterName,
        reasonText: doc.fraudReason,
        evidence: doc.fraudReason ? doc.fraudReason.split(';').map((s) => s.trim()) : [],
        severity: doc.severity,
        confidenceScore: Number(doc.confidenceScore),
        extra: { Categoria: doc.category, CPF: doc.requesterCpf, 'E-mail': doc.requesterEmail },
      };
    }
    case 'corporate_entity': {
      const entity = await prisma.corporateEntity.findUnique({ where: { id: sourceRecordId } });
      if (!entity) return null;
      return {
        title: entity.title,
        requesterOrHolder: entity.uboName,
        reasonText: null,
        evidence: [
          `${entity.layersCount} camadas de ocultação identificadas`,
          entity.uboIdentified ? `Beneficiário final identificado: ${entity.uboName}` : 'Beneficiário final não identificado',
        ],
        severity: entity.severity,
        confidenceScore: Number(entity.confidenceScore),
        extra: { Categoria: entity.category, Documento: entity.docNumber ?? '—' },
      };
    }
    case 'supplier_alert': {
      const alert = await prisma.supplierAlert.findUnique({ where: { id: sourceRecordId } });
      if (!alert) return null;
      return {
        title: alert.description,
        requesterOrHolder: alert.supplierName,
        reasonText: alert.description,
        evidence: Array.isArray(alert.evidence) ? (alert.evidence as string[]) : [],
        severity: alert.severity,
        confidenceScore: Number(alert.confidenceScore),
        extra: { Categoria: alert.category, CNPJ: alert.supplierCnpj },
      };
    }
    case 'payment_transaction': {
      const tx = await prisma.paymentTransaction.findUnique({ where: { id: sourceRecordId } });
      if (!tx) return null;
      const severity: Severity = tx.riskLevel === 'alto' ? 'grave' : tx.riskLevel === 'medio' ? 'moderado' : 'leve';
      return {
        title: `Transação ${tx.type.toUpperCase()} de ${Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        requesterOrHolder: tx.holderName,
        reasonText: tx.threatDescription ?? tx.description,
        evidence: tx.threatDescription ? [tx.threatDescription] : tx.description ? [tx.description] : [],
        severity,
        confidenceScore: null,
        extra: { Tipo: tx.type, Origem: `${tx.originCity ?? '—'}/${tx.originState ?? '—'}` },
      };
    }
    default:
      return null;
  }
}

const RECOMMENDATION_BY_SEVERITY: Record<Severity, string> = {
  grave: 'Manter o bloqueio ativo e escalar para análise humana especializada antes de qualquer liberação.',
  moderado: 'Manter em análise até confirmação adicional; liberar somente após validação manual dos dados do envolvido.',
  leve: 'Risco baixo a moderado; pode ser liberado se não houver reincidência associada nos próximos registros.',
};

export async function generateBriefing(blockId: string) {
  const block = await prisma.block.findUniqueOrThrow({ where: { id: blockId }, include: { sourceModule: true } });
  const source = await loadSource(block.sourceRecordType, block.sourceRecordId);

  const whyBlocked = source
    ? `O registro "${source.title}" foi sinalizado pelo módulo ${block.sourceModule?.name ?? block.sourceRecordType} com severidade ${source.severity}${
        source.confidenceScore ? ` e confiança do modelo de ${Math.round(source.confidenceScore * 100)}%` : ''
      }. ${source.reasonText ?? 'Nenhum motivo textual adicional foi registrado.'}`
    : `Bloqueio ${block.code} registrado sem vínculo a um registro de origem localizável.`;

  const evidence = source?.evidence.length ? source.evidence : ['Nenhuma evidência adicional registrada para este bloqueio.'];

  const events = await prisma.blockEvent.findMany({ where: { blockId }, orderBy: { createdAt: 'asc' } });
  const history = [
    `${block.createdAt.toLocaleString('pt-BR')} — Bloqueio ${block.code} criado a partir do módulo ${block.sourceModule?.name ?? block.sourceRecordType}.`,
    ...events.map((e) => `${e.createdAt.toLocaleString('pt-BR')} — status alterado para ${e.toStatus}${e.reason ? ` (${e.reason})` : ''}.`),
  ];

  const connections = source
    ? Object.entries(source.extra).map(([label, value]) => `${label}: ${value}`)
    : ['Sem dados de conexão disponíveis.'];

  const decisionExplanation = `A severidade "${block.severity}" foi atribuída pelo motor de decisão do módulo de origem com base nas evidências acima. Bloqueios com severidade grave exigem confirmação manual antes de liberação; moderados podem ser liberados mediante justificativa; leves tendem a ser falsos positivos revisáveis.`;

  const recommendation = RECOMMENDATION_BY_SEVERITY[block.severity];

  const briefing = await prisma.investigationBriefing.upsert({
    where: { blockId },
    update: { whyBlocked, evidence, history, connections, decisionExplanation, recommendation, generatedAt: new Date() },
    create: { blockId, whyBlocked, evidence, history, connections, decisionExplanation, recommendation },
  });

  return briefing;
}

export function answerQuestion(question: string, briefing: { whyBlocked: string; evidence: unknown; history: unknown; connections: unknown; decisionExplanation: string; recommendation: string }): string {
  const q = question.toLowerCase();

  if (q.includes('evidên') || q.includes('eviden')) {
    const evidence = Array.isArray(briefing.evidence) ? briefing.evidence : [];
    return `Evidências registradas:\n${evidence.map((e) => `• ${e}`).join('\n')}`;
  }
  if (q.includes('históric') || q.includes('historic')) {
    const history = Array.isArray(briefing.history) ? briefing.history : [];
    return `Histórico do caso:\n${history.map((h) => `• ${h}`).join('\n')}`;
  }
  if (q.includes('conex') || q.includes('relacion')) {
    const connections = Array.isArray(briefing.connections) ? briefing.connections : [];
    return `Conexões identificadas:\n${connections.map((c) => `• ${c}`).join('\n')}`;
  }
  if (q.includes('por que') || q.includes('porque') || q.includes('motivo') || q.includes('razão') || q.includes('razao')) {
    return briefing.whyBlocked;
  }
  if (q.includes('recomend') || q.includes('deveria') || q.includes('liberar')) {
    return briefing.recommendation;
  }
  if (q.includes('decis') || q.includes('severidade')) {
    return briefing.decisionExplanation;
  }

  return 'Não tenho informações específicas para essa pergunta. Posso detalhar evidências, histórico, conexões, a explicação da decisão ou a recomendação para este bloqueio.';
}
