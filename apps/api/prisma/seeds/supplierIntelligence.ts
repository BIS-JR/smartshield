import type { PrismaClient, SupplierCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { evaluateEntity } from '../../src/lib/decisionEngine.js';

interface AlertTemplate {
  category: SupplierCategory;
  title: string;
  riskBias: number;
  reasons: string[];
}

const TEMPLATES: AlertTemplate[] = [
  {
    category: 'processos_judiciais',
    title: 'Fornecedor com múltiplos processos trabalhistas',
    riskBias: 0.6,
    reasons: ['12 processos trabalhistas ativos', 'Reincidência em ações de mesma natureza', 'Sócio réu em ação civil pública'],
  },
  {
    category: 'protestos_cartorio',
    title: 'Protesto em cartório impede nova contratação',
    riskBias: 0.65,
    reasons: ['Título protestado há mais de 90 dias', 'Valor protestado acima do limite de risco', 'Sem regularização registrada'],
  },
  {
    category: 'nfe_fantasmas',
    title: 'Notas fiscais fantasmas identificadas',
    riskBias: 0.85,
    reasons: ['NF-e emitida sem circulação de mercadoria', 'CFOP incompatível com a operação declarada', 'Destinatário nega recebimento'],
  },
  {
    category: 'historico_fiscal',
    title: 'Histórico fiscal com pendências recorrentes',
    riskBias: 0.4,
    reasons: ['Débitos tributários em aberto', 'Certidão negativa vencida', 'Parcelamento fiscal em atraso'],
  },
  {
    category: 'fornecedores_suspeitos',
    title: 'Fornecedor com sócios em lista restritiva',
    riskBias: 0.75,
    reasons: ['Sócio presente em lista de sanções', 'Endereço fiscal compartilhado com empresa inapta', 'Capital social incompatível com o volume de vendas'],
  },
  {
    category: 'triangulacao_nfe',
    title: 'Indício de triangulação em notas fiscais',
    riskBias: 0.7,
    reasons: ['Mercadoria com trânsito circular entre CNPJs ligados', 'Margem de revenda incompatível com o mercado', 'Mesmo transportador em toda a cadeia'],
  },
];

export async function seedSupplierIntelligence(prisma: PrismaClient) {
  const existing = await prisma.supplierAlert.count();
  if (existing > 0) {
    console.log('supplier_alerts já populado, pulando seed.');
    return;
  }

  const ALERT_COUNT = 16;

  for (let i = 0; i < ALERT_COUNT; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const alertNumber = `SUP-2026-${String(2000 + i)}`;
    const decision = evaluateEntity(alertNumber, template.riskBias, template.reasons);
    const hoursAgo = faker.number.int({ min: 1, max: 58 });
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const alert = await prisma.supplierAlert.create({
      data: {
        alertNumber,
        supplierName: faker.company.name(),
        supplierCnpj: faker.string.numeric(14),
        category: template.category,
        severity: decision.severity,
        status: decision.status,
        description: template.title,
        evidence: decision.reasons,
        confidenceScore: decision.confidenceScore,
        createdAt,
        decidedAt: decision.status === 'aguardando' ? null : createdAt,
      },
    });

    await prisma.supplierAlertEvent.create({
      data: {
        supplierAlertId: alert.id,
        toStatus: alert.status,
        action: 'auto_evaluated',
        reason: 'Avaliação automática pelo motor de decisão simulado.',
        createdAt,
      },
    });
  }

  console.log(`Seed concluído: ${ALERT_COUNT} alertas do Supplier Intelligence.`);
}
