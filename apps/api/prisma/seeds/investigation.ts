import type { PrismaClient, BlockStatus, SourceRecordType, Severity } from '@prisma/client';

interface BlockSeedSource {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  sourceRecordType: SourceRecordType;
  sourceRecordId: string;
  moduleKey: string;
  createdAt: Date;
}

export async function seedInvestigation(prisma: PrismaClient) {
  const existing = await prisma.block.count();
  if (existing > 0) {
    console.log('blocks já populado, pulando seed.');
    return;
  }

  const [documentCases, corporateEntities, supplierAlerts, paymentTransactions] = await Promise.all([
    prisma.documentCase.findMany({ where: { status: 'rejeitado' }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.corporateEntity.findMany({ where: { status: 'rejeitado' }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.supplierAlert.findMany({ where: { status: 'rejeitado' }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.paymentTransaction.findMany({ where: { status: 'bloqueada' }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);

  const modules = await prisma.module.findMany();
  const moduleIdByKey = new Map(modules.map((m) => [m.key, m.id]));

  const sources: BlockSeedSource[] = [
    ...documentCases.map((d, i) => ({
      id: d.id,
      code: `BLK-2026-${String(700 + i)}`,
      title: d.title,
      severity: d.severity,
      sourceRecordType: 'document_case' as SourceRecordType,
      sourceRecordId: d.id,
      moduleKey: 'document_ai',
      createdAt: d.createdAt,
    })),
    ...corporateEntities.map((c, i) => ({
      id: c.id,
      code: `BLK-2026-${String(710 + i)}`,
      title: c.title,
      severity: c.severity,
      sourceRecordType: 'corporate_entity' as SourceRecordType,
      sourceRecordId: c.id,
      moduleKey: 'corporate_fraud',
      createdAt: c.createdAt,
    })),
    ...supplierAlerts.map((s, i) => ({
      id: s.id,
      code: `BLK-2026-${String(720 + i)}`,
      title: s.description,
      severity: s.severity,
      sourceRecordType: 'supplier_alert' as SourceRecordType,
      sourceRecordId: s.id,
      moduleKey: 'supplier_intelligence',
      createdAt: s.createdAt,
    })),
    ...paymentTransactions.map((p, i) => ({
      id: p.id,
      code: `BLK-2026-${String(730 + i)}`,
      title: `Transação ${p.type.toUpperCase()} bloqueada — ${p.holderName ?? 'correntista'}`,
      severity: (p.riskLevel === 'alto' ? 'grave' : p.riskLevel === 'medio' ? 'moderado' : 'leve') as Severity,
      sourceRecordType: 'payment_transaction' as SourceRecordType,
      sourceRecordId: p.id,
      moduleKey: 'payment_risk',
      createdAt: p.createdAt,
    })),
  ];

  const STATUS_CYCLE: BlockStatus[] = ['ativo', 'ativo', 'em_analise', 'liberado'];

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];

    const block = await prisma.block.create({
      data: {
        code: source.code,
        title: source.title,
        description: `Bloqueio automático gerado pelo módulo ${source.moduleKey}.`,
        severity: source.severity,
        status,
        sourceModuleId: moduleIdByKey.get(source.moduleKey),
        sourceRecordType: source.sourceRecordType,
        sourceRecordId: source.sourceRecordId,
        liberadoAt: status === 'liberado' ? new Date() : null,
        createdAt: source.createdAt,
      },
    });

    await prisma.blockEvent.create({
      data: { blockId: block.id, toStatus: 'ativo', reason: 'Bloqueio criado automaticamente.', createdAt: source.createdAt },
    });

    if (status !== 'ativo') {
      await prisma.blockEvent.create({
        data: {
          blockId: block.id,
          fromStatus: 'ativo',
          toStatus: status,
          reason: status === 'liberado' ? 'Liberado após revisão.' : 'Movido para análise manual.',
        },
      });
    }
  }

  console.log(`Seed concluído: ${sources.length} bloqueios do Investigation Assistant.`);
}
