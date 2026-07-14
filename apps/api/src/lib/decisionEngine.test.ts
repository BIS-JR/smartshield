import { describe, it, expect } from 'vitest';
import { evaluateEntity } from './decisionEngine.js';

describe('evaluateEntity', () => {
  it('is deterministic for the same entity key', () => {
    const reasons = ['motivo A', 'motivo B', 'motivo C'];
    const first = evaluateEntity('CASE-0001', 0.6, reasons);
    const second = evaluateEntity('CASE-0001', 0.6, reasons);

    expect(second).toEqual(first);
  });

  it('produces different results for different entity keys', () => {
    const reasons = ['motivo A', 'motivo B'];
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => JSON.stringify(evaluateEntity(`CASE-${i}`, 0.5, reasons))),
    );

    expect(results.size).toBeGreaterThan(1);
  });

  it('skews toward grave severity as riskBias approaches 1', () => {
    const reasons = ['motivo'];
    const graveCount = Array.from({ length: 50 }, (_, i) => evaluateEntity(`HIGH-${i}`, 0.95, reasons)).filter(
      (r) => r.severity === 'grave',
    ).length;
    const leveCount = Array.from({ length: 50 }, (_, i) => evaluateEntity(`LOW-${i}`, 0.05, reasons)).filter(
      (r) => r.severity === 'leve',
    ).length;

    expect(graveCount).toBeGreaterThan(0);
    expect(leveCount).toBeGreaterThan(0);
  });

  it('always returns a confidenceScore between 0 and 1', () => {
    for (let i = 0; i < 20; i++) {
      const result = evaluateEntity(`SCORE-${i}`, Math.random(), ['x']);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    }
  });
});
