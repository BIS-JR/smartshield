import { prisma } from '../../db/prisma.js';
import type { RuleAction, Severity } from '@prisma/client';

export async function listRules(moduleKey?: string) {
  return prisma.rule.findMany({
    where: moduleKey && moduleKey !== 'all' ? { module: { key: moduleKey } } : undefined,
    include: { module: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findRuleById(id: string) {
  return prisma.rule.findUnique({ where: { id }, include: { module: true } });
}

export interface RuleInput {
  name: string;
  moduleKey: string;
  description?: string;
  conditionExpression: string;
  threshold?: number;
  outputSeverity: Severity;
  action: RuleAction;
}

export async function createRule(input: RuleInput, createdById: string) {
  const module = await prisma.module.findUniqueOrThrow({ where: { key: input.moduleKey } });
  return prisma.rule.create({
    data: {
      name: input.name,
      description: input.description,
      conditionExpression: input.conditionExpression,
      threshold: input.threshold,
      outputSeverity: input.outputSeverity,
      action: input.action,
      moduleId: module.id,
      createdById,
    },
    include: { module: true },
  });
}

export async function updateRule(id: string, input: Partial<RuleInput>) {
  const data: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    conditionExpression: input.conditionExpression,
    threshold: input.threshold,
    outputSeverity: input.outputSeverity,
    action: input.action,
  };
  if (input.moduleKey) {
    const module = await prisma.module.findUniqueOrThrow({ where: { key: input.moduleKey } });
    data.moduleId = module.id;
  }
  return prisma.rule.update({ where: { id }, data, include: { module: true } });
}

export async function setActive(id: string, isActive: boolean) {
  return prisma.rule.update({ where: { id }, data: { isActive }, include: { module: true } });
}

export async function deleteRule(id: string) {
  await prisma.ruleExecution.deleteMany({ where: { ruleId: id } });
  await prisma.ruleEvent.deleteMany({ where: { ruleId: id } });
  await prisma.rule.delete({ where: { id } });
}

export async function createRuleEvent(input: {
  ruleId: string;
  actorId?: string;
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
  beforeState?: object;
  afterState?: object;
}) {
  return prisma.ruleEvent.create({ data: input });
}

export async function recordExecutions(
  ruleId: string,
  results: { targetRecordType: string; targetRecordId: string; matched: boolean }[],
) {
  await prisma.ruleExecution.createMany({
    data: results.map((r) => ({ ruleId, targetRecordType: r.targetRecordType, targetRecordId: r.targetRecordId, matched: r.matched })),
  });
}
