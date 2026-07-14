import type { PrismaClient, PaymentType, RiskLevel, PaymentStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

faker.seed(7734);

const TYPE_WEIGHTS: { type: PaymentType; weight: number }[] = [
  { type: 'pix', weight: 0.55 },
  { type: 'ted', weight: 0.25 },
  { type: 'boleto', weight: 0.15 },
  { type: 'doc', weight: 0.05 },
];

function pickWeighted<T extends { weight: number }>(options: T[]): T {
  const roll = faker.number.float({ min: 0, max: 1 });
  let acc = 0;
  for (const option of options) {
    acc += option.weight;
    if (roll <= acc) return option;
  }
  return options[options.length - 1];
}

const BR_CITIES: { city: string; state: string }[] = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Recife', state: 'PE' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Manaus', state: 'AM' },
];

const ALERT_REASONS = [
  {
    short: 'Conta recém-criada (3 dias)',
    threat: (name: string) =>
      `A conta de ${name} foi aberta há apenas 3 dias e já apresenta volume de movimentação muito acima do padrão esperado para uma conta nova, característica comum em contas "laranja" usadas para dispersão rápida de recursos de origem ilícita.`,
  },
  {
    short: 'Conta em sub-rede suspeita',
    threat: (name: string) =>
      `A conta de ${name} está conectada, por meio de transferências recentes, a uma sub-rede de contas já sinalizadas em investigações anteriores, sugerindo participação em esquema coordenado de movimentação de fundos.`,
  },
  {
    short: 'Fracionamento de valor detectado',
    threat: (name: string) =>
      `Foram identificadas múltiplas transferências de ${name} em valores fracionados, realizadas em curto intervalo de tempo, padrão típico de tentativa de evitar limites de alerta automático (smurfing).`,
  },
  {
    short: 'Destinatário em lista de observação',
    threat: (name: string) =>
      `O destinatário da transação de ${name} consta em lista interna de observação por reincidência em alertas de risco em transações anteriores.`,
  },
  {
    short: 'Padrão de horário atípico',
    threat: (name: string) =>
      `A transação de ${name} ocorreu fora do padrão histórico de horário desta conta (madrugada), combinado com valor superior à média das últimas movimentações, elevando o escore de risco.`,
  },
  {
    short: 'Volume acima do perfil declarado',
    threat: (name: string) =>
      `O valor movimentado por ${name} está muito acima da faixa de renda e do perfil transacional declarado no cadastro, sem justificativa aparente (ausência de nota fiscal ou contrato vinculado).`,
  },
];

export async function seedPaymentRisk(prisma: PrismaClient) {
  const existing = await prisma.paymentTransaction.count();
  if (existing > 0) {
    console.log('payment_transactions já populado, pulando seed.');
    return;
  }

  const TOTAL = 320;
  const rows: {
    externalRef: string;
    type: PaymentType;
    amount: number;
    riskLevel: RiskLevel;
    status: PaymentStatus;
    description: string | null;
    threatDescription: string | null;
    accountAgeDays: number;
    destination: string;
    holderName: string;
    holderDocument: string;
    holderEmail: string;
    originCity: string;
    originState: string;
    originIp: string;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const type = pickWeighted(TYPE_WEIGHTS).type;
    const riskRoll = faker.number.float({ min: 0, max: 1 });
    const riskLevel: RiskLevel = riskRoll < 0.78 ? 'baixo' : riskRoll < 0.93 ? 'medio' : 'alto';
    const holderName = faker.person.fullName();

    let status: PaymentStatus = 'aprovada';
    let description: string | null = null;
    let threatDescription: string | null = null;
    if (riskLevel === 'alto' && faker.number.float({ min: 0, max: 1 }) < 0.45) {
      status = 'bloqueada';
      const reason = faker.helpers.arrayElement(ALERT_REASONS);
      description = reason.short;
      threatDescription = reason.threat(holderName);
    } else if (riskLevel !== 'baixo' && faker.number.float({ min: 0, max: 1 }) < 0.2) {
      status = 'suspeita';
      const reason = faker.helpers.arrayElement(ALERT_REASONS);
      description = reason.short;
      threatDescription = reason.threat(holderName);
    }

    const hoursAgo = faker.number.float({ min: 0, max: 24 });
    const amount =
      type === 'boleto'
        ? faker.number.float({ min: 80, max: 3000, fractionDigits: 2 })
        : faker.number.float({ min: 50, max: 150000, fractionDigits: 2 });

    const location = faker.helpers.arrayElement(BR_CITIES);

    rows.push({
      externalRef: `TX-${faker.string.alphanumeric(10).toUpperCase()}`,
      type,
      amount,
      riskLevel,
      status,
      description,
      threatDescription,
      accountAgeDays: faker.number.int({ min: 1, max: 1800 }),
      destination: faker.finance.accountNumber(8),
      holderName,
      holderDocument: faker.string.numeric(11),
      holderEmail: faker.internet.email({ firstName: holderName.split(' ')[0] }).toLowerCase(),
      originCity: location.city,
      originState: location.state,
      originIp: faker.internet.ipv4(),
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    });
  }

  await prisma.paymentTransaction.createMany({ data: rows });

  console.log(`Seed concluído: ${TOTAL} transações do Payment Risk Engine.`);
}
