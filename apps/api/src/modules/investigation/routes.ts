import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const investigationRouter = Router();

investigationRouter.use(authGuard);

investigationRouter.get('/blocks', asyncHandler(controller.listHandler));
investigationRouter.get('/blocks/:id', asyncHandler(controller.detailHandler));
investigationRouter.get('/blocks/:id/briefing', asyncHandler(controller.briefingHandler));
investigationRouter.get('/blocks/:id/messages', asyncHandler(controller.messagesHandler));
investigationRouter.post('/blocks/:id/ask', asyncHandler(controller.askHandler));
investigationRouter.post('/blocks/:id/unblock', asyncHandler(controller.unblockHandler));
