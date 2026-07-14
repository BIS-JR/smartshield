import type { PrismaClient, CorporateCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { evaluateEntity } from '../../src/lib/decisionEngine.js';
import { generateOwnershipGraph } from '../../src/lib/graphGenerator.js';

interface EntityTemplate {
  category: CorporateCategory;
  title: string;
  riskBias: number;
  reasons: string[];
}

const TEMPLATES: EntityTemplate[] = [
  {
    category: 'cpf',
    title: 'CPF associado a 15 contas bancárias distintas',
    riskBias: 0.55,
    reasons: ['CPF vinculado a múltiplas contas laranja', 'Movimentação incompatível com renda declarada'],
  },
  {
    category: 'cnpj',
    title: 'CNPJ reativado após baixa por fraude',
    riskBias: 0.8,
    reasons: ['Baixa anterior por indício de fraude', 'Mesmo quadro societário da empresa baixada', 'Endereço fiscal fictício'],
  },
  {
    category: 'pix',
    title: 'Transações PIX em anel entre 6 contas laranja',
    riskBias: 0.85,
    reasons: ['Padrão circular de transferências', 'Contas criadas na mesma semana', 'Valores fracionados abaixo do limite de alerta'],
  },
  {
    category: 'ip',
    title: 'IP compartilhado em 40 cadastros distintos',
    riskBias: 0.5,
    reasons: ['Mesmo IP usado em cadastros não relacionados', 'Geolocalização incompatível com endereço declarado'],
  },
  {
    category: 'dispositivo',
    title: 'Dispositivo móvel usado em múltiplas identidades',
    riskBias: 0.65,
    reasons: ['Mesmo device ID em 8 contas diferentes', 'Troca de identidade sem novo dispositivo'],
  },
  {
    category: 'empresas',
    title: 'Rede de empresas de fachada com sócios cruzados',
    riskBias: 0.75,
    reasons: ['Quadro societário circular entre 5 empresas', 'Nenhuma das empresas possui operação real', 'Capital social incompatível'],
  },
  {
    category: 'socios',
    title: 'Sócio oculto identificado via procuração',
    riskBias: 0.6,
    reasons: ['UBO não declarado no contrato social', 'Procuração com poderes amplos não registrada'],
  },
  {
    category: 'contas_bancarias',
    title: 'Conta bancária recém-aberta com alto volume PIX',
    riskBias: 0.7,
    reasons: ['Conta com 5 dias de existência', 'Volume transacionado 40x acima do perfil declarado'],
  },
  {
    category: 'fornecedores',
    title: 'Fornecedor comum a rede de empresas suspeitas',
    riskBias: 0.5,
    reasons: ['Mesmo fornecedor em 6 empresas do grupo investigado'],
  },
  {
    category: 'telefone',
    title: 'Número de telefone reutilizado em identidades distintas',
    riskBias: 0.45,
    reasons: ['Mesmo número em 4 cadastros com CPFs diferentes'],
  },
  {
    category: 'outros',
    title: 'Padrão atípico de relacionamento societário',
    riskBias: 0.4,
    reasons: ['Estrutura societária sem racionalidade econômica aparente'],
  },
];

export async function seedCorporateFraud(prisma: PrismaClient) {
  const existing = await prisma.corporateEntity.count();
  if (existing > 0) {
    console.log('corporate_entities já populado, pulando seed.');
    return;
  }

  const ENTITY_COUNT = 15;

  for (let i = 0; i < ENTITY_COUNT; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const entityNumber = `CORP-2026-${String(3000 + i)}`;
    const decision = evaluateEntity(entityNumber, template.riskBias, template.reasons);
    const hoursAgo = faker.number.int({ min: 1, max: 58 });
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const layersCount = decision.severity === 'grave' ? 4 : decision.severity === 'moderado' ? 3 : 2;
    const uboIdentified = decision.severity !== 'leve';

    const entity = await prisma.corporateEntity.create({
      data: {
        entityNumber,
        title: template.title,
        docNumber: faker.string.numeric(14),
        category: template.category,
        severity: decision.severity,
        status: decision.status,
        layersCount,
        uboIdentified,
        uboName: uboIdentified ? faker.person.fullName() : null,
        confidenceScore: decision.confidenceScore,
        createdAt,
        decidedAt: decision.status === 'aguardando' ? null : createdAt,
      },
    });

    await prisma.corporateEntityEvent.create({
      data: {
        corporateEntityId: entity.id,
        toStatus: entity.status,
        action: 'auto_evaluated',
        reason: 'Avaliação automática pelo motor de decisão simulado.',
        createdAt,
      },
    });

    const { nodes, edges } = generateOwnershipGraph(entityNumber, template.title, layersCount);
    const createdNodes = await Promise.all(
      nodes.map((n) =>
        prisma.graphNode.create({
          data: { corporateEntityId: entity.id, nodeType: n.nodeType, label: n.label },
        }),
      ),
    );
    const keyToId = new Map(nodes.map((n, idx) => [n.key, createdNodes[idx].id]));

    await prisma.graphEdge.createMany({
      data: edges.map((e) => ({
        corporateEntityId: entity.id,
        sourceNodeId: keyToId.get(e.sourceKey)!,
        targetNodeId: keyToId.get(e.targetKey)!,
        relationType: e.relationType,
        weight: e.weight,
      })),
    });
  }

  console.log(`Seed concluído: ${ENTITY_COUNT} entidades do Corporate Fraud Graph (com grafos de rede).`);
}
