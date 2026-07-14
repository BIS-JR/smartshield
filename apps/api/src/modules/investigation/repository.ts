import { prisma } from '../../db/prisma.js';
import type { BlockStatus } from '@prisma/client';

export async function listBlocks() {
  return prisma.block.findMany({
    include: { sourceModule: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findBlockById(id: string) {
  return prisma.block.findUnique({ where: { id }, include: { sourceModule: true } });
}

export async function findBriefing(blockId: string) {
  return prisma.investigationBriefing.findUnique({ where: { blockId } });
}

export async function listMessages(blockId: string) {
  return prisma.investigationMessage.findMany({ where: { blockId }, orderBy: { createdAt: 'asc' } });
}

export async function createMessage(input: { blockId: string; sender: 'user' | 'assistant'; content: string; messageType: 'briefing' | 'question' | 'answer' | 'system' }) {
  return prisma.investigationMessage.create({ data: input });
}

export async function updateBlockStatus(id: string, status: BlockStatus, liberadoById?: string) {
  return prisma.block.update({
    where: { id },
    data: status === 'liberado' ? { status, liberadoAt: new Date(), liberadoById } : { status },
  });
}

export async function createBlockEvent(input: { blockId: string; actorId?: string; fromStatus?: BlockStatus; toStatus: BlockStatus; reason?: string }) {
  return prisma.blockEvent.create({ data: input });
}

export async function createUnblockRequest(input: { blockId: string; requestedById?: string; reason?: string }) {
  return prisma.unblockRequest.create({
    data: { ...input, status: 'approved', resolvedAt: new Date() },
  });
}
