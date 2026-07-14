import crypto from 'node:crypto';

export type Severity = 'leve' | 'moderado' | 'grave';
export type CaseStatusResult = 'aprovado' | 'rejeitado' | 'aguardando';

export interface DecisionResult {
  severity: Severity;
  status: CaseStatusResult;
  confidenceScore: number;
  reasons: string[];
}

function seedToInt(seed: string): number {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return hash.readUInt32BE(0);
}

/** PRNG determinístico (mulberry32): mesma seed sempre produz a mesma sequência. */
function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Avaliador determinístico "de IA" para uma entidade (caso de documento,
 * entidade corporativa, alerta de fornecedor, etc). A mesma `entityKey`
 * sempre produz o mesmo resultado, evitando que a UI "pisque" decisões
 * diferentes a cada refresh. `riskBias` (0-1) empurra a distribuição para
 * mais ou menos grave conforme a categoria (ex: "RG Falso" pesa mais que
 * "Notas Fiscais").
 */
export function evaluateEntity(entityKey: string, riskBias: number, reasonsPool: string[]): DecisionResult {
  const random = mulberry32(seedToInt(entityKey));
  const roll = random();
  const weighted = Math.min(1, Math.max(0, roll * 0.65 + riskBias * 0.35));

  let severity: Severity;
  let status: CaseStatusResult;

  if (weighted > 0.72) {
    severity = 'grave';
    status = random() > 0.35 ? 'rejeitado' : 'aguardando';
  } else if (weighted > 0.42) {
    severity = 'moderado';
    status = random() > 0.5 ? 'aprovado' : 'aguardando';
  } else {
    severity = 'leve';
    status = random() > 0.25 ? 'aprovado' : 'aguardando';
  }

  const confidenceScore = Math.round((0.52 + weighted * 0.47) * 100) / 100;

  const reasonCount = severity === 'grave' ? 3 : severity === 'moderado' ? 2 : 1;
  const shuffled = [...reasonsPool].sort(() => random() - 0.5);
  const reasons = shuffled.slice(0, Math.min(reasonCount, shuffled.length));

  return { severity, status, confidenceScore, reasons };
}
