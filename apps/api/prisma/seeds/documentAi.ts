import type { PrismaClient, DocumentCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { evaluateEntity } from '../../src/lib/decisionEngine.js';

interface CaseTemplate {
  category: DocumentCategory;
  title: string;
  riskBias: number;
  reasons: string[];
}

const TEMPLATES: CaseTemplate[] = [
  {
    category: 'rg_falso',
    title: 'RG adulterado detectado em cadastro PF',
    riskBias: 0.8,
    reasons: ['Fonte tipográfica divergente do padrão oficial', 'Hologramas de segurança ausentes', 'Foto sem sinais de expedição física'],
  },
  {
    category: 'cnh',
    title: 'CNH com foto substituída',
    riskBias: 0.65,
    reasons: ['Foto com bordas de recorte digital', 'Assinatura do órgão emissor não confere', 'QR code inválido'],
  },
  {
    category: 'procuracoes',
    title: 'Procuração com assinatura suspeita',
    riskBias: 0.5,
    reasons: ['Assinatura não confere com base cartorial', 'Reconhecimento de firma ausente', 'Outorgante não localizado'],
  },
  {
    category: 'contratos',
    title: 'Contrato societário com cláusulas alteradas',
    riskBias: 0.4,
    reasons: ['Divergência de metadados de edição', 'Cláusula de distribuição de lucros fora do padrão', 'Data de assinatura inconsistente'],
  },
  {
    category: 'notas_fiscais',
    title: 'Nota fiscal com CNPJ inexistente',
    riskBias: 0.5,
    reasons: ['CNPJ não localizado na Receita Federal', 'Série fiscal fora da sequência', 'Emitente com inscrição baixada'],
  },
  {
    category: 'balancos',
    title: 'Balanço patrimonial com inconsistência contábil',
    riskBias: 0.45,
    reasons: ['Ativo total não bate com demonstrativo anterior', 'Auditoria externa ausente', 'Variação patrimonial atípica'],
  },
  {
    category: 'adulteracoes',
    title: 'Documento com sinais de edição digital',
    riskBias: 0.85,
    reasons: ['Metadados de edição em software de imagem', 'Camadas de compressão inconsistentes', 'Fonte de texto sobreposta'],
  },
  {
    category: 'documentos_ia',
    title: 'Documento com suspeita de geração por IA',
    riskBias: 0.7,
    reasons: ['Padrão de textura incompatível com escaneamento', 'Artefatos típicos de geração sintética', 'Ausência de ruído de captura físico'],
  },
];

export async function seedDocumentAi(prisma: PrismaClient) {
  const existing = await prisma.documentCase.count();
  if (existing > 0) {
    console.log('document_cases já populado, pulando seed.');
    return;
  }

  const CASE_COUNT = 18;

  for (let i = 0; i < CASE_COUNT; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const caseNumber = `DOC-2026-${String(1000 + i)}`;
    const decision = evaluateEntity(caseNumber, template.riskBias, template.reasons);
    const hoursAgo = faker.number.int({ min: 1, max: 58 });
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const documentCase = await prisma.documentCase.create({
      data: {
        caseNumber,
        title: template.title,
        category: template.category,
        severity: decision.severity,
        status: decision.status,
        requesterName: faker.person.fullName(),
        requesterEmail: faker.internet.email().toLowerCase(),
        requesterCpf: faker.string.numeric(11),
        documentUrl: `https://documentos.smartshield.local/${caseNumber}.pdf`,
        fraudReason: decision.reasons.join('; '),
        confidenceScore: decision.confidenceScore,
        createdAt,
        decidedAt: decision.status === 'aguardando' ? null : createdAt,
      },
    });

    await prisma.documentCaseEvent.create({
      data: {
        documentCaseId: documentCase.id,
        toStatus: documentCase.status,
        action: 'auto_evaluated',
        reason: 'Avaliação automática pelo motor de decisão simulado.',
        createdAt,
      },
    });
  }

  console.log(`Seed concluído: ${CASE_COUNT} casos do Document AI Engine.`);
}
