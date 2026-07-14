import { PrismaClient } from '@prisma/client';
import { seedDocumentAi } from './seeds/documentAi.js';
import { seedSupplierIntelligence } from './seeds/supplierIntelligence.js';
import { seedCorporateFraud } from './seeds/corporateFraud.js';
import { seedPaymentRisk } from './seeds/paymentRisk.js';

const prisma = new PrismaClient();

const modules = [
  {
    key: 'document_ai',
    name: 'Document AI Engine',
    description: 'Análise inteligente de documentos com IA para detectar falsificações, adulterações e documentos gerados artificialmente.',
    icon: 'file-search',
    color: '#3987e5',
    sortOrder: 1,
  },
  {
    key: 'corporate_fraud',
    name: 'Corporate Fraud Graph',
    description: 'Visualização de redes de relacionamentos entre empresas, sócios e contas para identificar padrões de fraude corporativa.',
    icon: 'git-branch',
    color: '#9085e9',
    sortOrder: 2,
  },
  {
    key: 'payment_risk',
    name: 'Payment Risk Engine',
    description: 'Monitoramento de transações PIX/TED para detectar padrões suspeitos de lavagem de dinheiro e contas laranja.',
    icon: 'credit-card',
    color: '#199e70',
    sortOrder: 3,
  },
  {
    key: 'supplier_intelligence',
    name: 'Supplier Intelligence',
    description: 'Análise de fornecedores, notas fiscais e histórico fiscal para identificar fraudes na cadeia de suprimentos.',
    icon: 'truck',
    color: '#d95926',
    sortOrder: 4,
  },
  {
    key: 'investigation',
    name: 'Investigation Assistant',
    description: 'Assistente inteligente para investigar bloqueios com análise detalhada de evidências e histórico.',
    icon: 'message-square',
    color: '#1fb5c9',
    sortOrder: 5,
  },
  {
    key: 'executive_dashboard',
    name: 'Executive Dashboard',
    description: 'Visão consolidada de KPIs e tendências de fraude para tomada de decisão executiva.',
    icon: 'bar-chart-3',
    color: '#d55181',
    sortOrder: 6,
  },
  {
    key: 'rules_engine',
    name: 'Rules Engine',
    description: 'Editor de regras de detecção de fraude com ativação, edição e exclusão em tempo real.',
    icon: 'settings',
    color: '#a86b1f',
    sortOrder: 7,
  },
];

async function main() {
  for (const module of modules) {
    await prisma.module.upsert({
      where: { key: module.key },
      update: module,
      create: module,
    });
  }

  console.log(`Seed concluído: ${modules.length} módulos.`);

  await seedDocumentAi(prisma);
  await seedSupplierIntelligence(prisma);
  await seedCorporateFraud(prisma);
  await seedPaymentRisk(prisma);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
