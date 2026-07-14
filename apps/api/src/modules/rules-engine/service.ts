import * as repo from './repository.js';
import { evaluateCondition, loadFeatureSample } from './ruleEvaluator.js';
import { HttpError } from '../../middleware/errorHandler.js';
import type { RuleInput } from './repository.js';

export async function listRules(moduleKey?: string) {
  return repo.listRules(moduleKey);
}

export async function createRule(input: RuleInput, actorId: string) {
  const rule = await repo.createRule(input, actorId);
  await repo.createRuleEvent({ ruleId: rule.id, actorId, action: 'created', afterState: input });
  return rule;
}

export async function updateRule(id: string, input: Partial<RuleInput>, actorId: string) {
  const before = await repo.findRuleById(id);
  if (!before) throw new HttpError(404, 'Regra não encontrada');

  const updated = await repo.updateRule(id, input);
  await repo.createRuleEvent({ ruleId: id, actorId, action: 'updated', beforeState: before, afterState: input });
  return updated;
}

export async function setActive(id: string, isActive: boolean, actorId: string) {
  const before = await repo.findRuleById(id);
  if (!before) throw new HttpError(404, 'Regra não encontrada');

  const updated = await repo.setActive(id, isActive);
  await repo.createRuleEvent({ ruleId: id, actorId, action: isActive ? 'activated' : 'deactivated' });
  return updated;
}

export async function deleteRule(id: string, actorId: string) {
  const before = await repo.findRuleById(id);
  if (!before) throw new HttpError(404, 'Regra não encontrada');

  await repo.createRuleEvent({ ruleId: id, actorId, action: 'deleted', beforeState: before });
  await repo.deleteRule(id);
}

export async function testRule(id: string) {
  const rule = await repo.findRuleById(id);
  if (!rule) throw new HttpError(404, 'Regra não encontrada');

  const sample = await loadFeatureSample(rule.module.key);
  const threshold = rule.threshold ? Number(rule.threshold) : null;

  const results = sample.map((record) => ({
    id: record.id,
    label: record.label,
    matched: evaluateCondition(rule.conditionExpression, record.features, threshold),
  }));

  const matches = results.filter((r) => r.matched);

  await repo.recordExecutions(
    id,
    results.map((r) => ({ targetRecordType: rule.module.key, targetRecordId: r.id, matched: r.matched })),
  );

  return {
    evaluated: results.length,
    matched: matches.length,
    sampleMatches: matches.slice(0, 10),
  };
}
