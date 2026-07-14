import type { PrismaClient, Severity, RuleAction } from '@prisma/client';

interface RuleSeed {
  name: string;
  moduleKey: string;
  description: string;
  conditionExpression: string;
  threshold: number;
  outputSeverity: Severity;
  action: RuleAction;
}

const RULES: RuleSeed[] = [
  {
    name: 'Documento com score de adulteração alto',
    moduleKey: 'document_ai',
    description: 'Bloqueia automaticamente documentos com confiança de fraude acima do limiar definido.',
    conditionExpression: 'confidence_score > threshold',
    threshold: 0.85,
    outputSeverity: 'grave',
    action: 'bloquear',
  },
  {
    name: 'PIX de alto valor para conta nova',
    moduleKey: 'payment_risk',
    description: 'Bloqueia transações PIX/TED acima do valor limite destinadas a contas criadas há menos de 7 dias.',
    conditionExpression: 'amount > threshold and account_age_days < 7',
    threshold: 10000,
    outputSeverity: 'grave',
    action: 'bloquear',
  },
  {
    name: 'Rede com múltiplas camadas de ocultação',
    moduleKey: 'corporate_fraud',
    description: 'Sinaliza para revisão entidades corporativas com número de camadas de ocultação acima do limiar.',
    conditionExpression: 'layers_count >= threshold',
    threshold: 3,
    outputSeverity: 'grave',
    action: 'revisar',
  },
  {
    name: 'Transação de valor elevado',
    moduleKey: 'payment_risk',
    description: 'Alerta transações acima do valor limite, independente da idade da conta.',
    conditionExpression: 'amount > threshold',
    threshold: 50000,
    outputSeverity: 'moderado',
    action: 'alertar',
  },
  {
    name: 'Fornecedor com confiança de risco baixa',
    moduleKey: 'supplier_intelligence',
    description: 'Revisa contratação de fornecedores com confiança do modelo de risco acima do limiar.',
    conditionExpression: 'confidence_score > threshold',
    threshold: 0.6,
    outputSeverity: 'moderado',
    action: 'revisar',
  },
  {
    name: 'Entidade corporativa sem UBO identificado',
    moduleKey: 'corporate_fraud',
    description: 'Sinaliza entidades onde o beneficiário final não foi identificado.',
    conditionExpression: 'ubo_identified < threshold',
    threshold: 1,
    outputSeverity: 'moderado',
    action: 'revisar',
  },
];

export async function seedRulesEngine(prisma: PrismaClient) {
  const existing = await prisma.rule.count();
  if (existing > 0) {
    console.log('rules já populado, pulando seed.');
    return;
  }

  const modules = await prisma.module.findMany();
  const moduleIdByKey = new Map(modules.map((m) => [m.key, m.id]));

  for (const rule of RULES) {
    const moduleId = moduleIdByKey.get(rule.moduleKey);
    if (!moduleId) continue;

    await prisma.rule.create({
      data: {
        name: rule.name,
        description: rule.description,
        conditionExpression: rule.conditionExpression,
        threshold: rule.threshold,
        outputSeverity: rule.outputSeverity,
        action: rule.action,
        moduleId,
      },
    });
  }

  console.log(`Seed concluído: ${RULES.length} regras do Rules Engine.`);
}
