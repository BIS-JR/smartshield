import * as repo from './repository.js';
import { generateBriefing, answerQuestion } from './briefingGenerator.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listBlocks() {
  return repo.listBlocks();
}

export async function getBlock(id: string) {
  const block = await repo.findBlockById(id);
  if (!block) throw new HttpError(404, 'Bloqueio não encontrado');
  return block;
}

export async function getOrCreateBriefing(blockId: string) {
  await getBlock(blockId);

  const existing = await repo.findBriefing(blockId);
  if (existing) return existing;

  const briefing = await generateBriefing(blockId);

  await repo.createMessage({
    blockId,
    sender: 'assistant',
    content: briefing.whyBlocked,
    messageType: 'briefing',
  });

  return briefing;
}

export async function getMessages(blockId: string) {
  return repo.listMessages(blockId);
}

export async function askQuestion(blockId: string, question: string) {
  await getBlock(blockId);
  const briefing = await getOrCreateBriefing(blockId);

  await repo.createMessage({ blockId, sender: 'user', content: question, messageType: 'question' });

  const answer = answerQuestion(question, briefing);
  const message = await repo.createMessage({ blockId, sender: 'assistant', content: answer, messageType: 'answer' });

  return message;
}

export async function unblock(blockId: string, actorId: string, reason?: string) {
  const block = await getBlock(blockId);

  const updated = await repo.updateBlockStatus(blockId, 'liberado', actorId);
  await repo.createBlockEvent({ blockId, actorId, fromStatus: block.status, toStatus: 'liberado', reason });
  await repo.createUnblockRequest({ blockId, requestedById: actorId, reason });

  return updated;
}
