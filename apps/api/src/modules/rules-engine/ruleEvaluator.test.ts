import { describe, it, expect } from 'vitest';
import { evaluateCondition } from './ruleEvaluator.js';

describe('evaluateCondition', () => {
  it('evaluates a simple comparison against threshold', () => {
    expect(evaluateCondition('confidence_score > threshold', { confidence_score: 0.9 }, 0.85)).toBe(true);
    expect(evaluateCondition('confidence_score > threshold', { confidence_score: 0.5 }, 0.85)).toBe(false);
  });

  it('evaluates compound conditions with and/or', () => {
    const features = { amount: 15000, account_age_days: 3 };
    expect(evaluateCondition('amount > threshold and account_age_days < 7', features, 10000)).toBe(true);
    expect(evaluateCondition('amount > threshold and account_age_days < 7', { amount: 15000, account_age_days: 30 }, 10000)).toBe(
      false,
    );
  });

  it('returns false for malformed expressions instead of throwing', () => {
    expect(() => evaluateCondition('this is not valid syntax ((', { x: 1 }, 1)).not.toThrow();
    expect(evaluateCondition('this is not valid syntax ((', { x: 1 }, 1)).toBe(false);
  });

  it('returns false when a referenced feature is missing', () => {
    expect(evaluateCondition('missing_field > threshold', { amount: 100 }, 10)).toBe(false);
  });

  it('never executes arbitrary JavaScript (no eval)', () => {
    const features: Record<string, number> = {};
    // If this were `eval()`, this would attempt to run process-level code; expr-eval only
    // understands its own expression grammar, so this is safely rejected as invalid.
    expect(evaluateCondition('require("child_process")', features, 0)).toBe(false);
  });
});
