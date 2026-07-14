import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const documentAiRouter = Router();

documentAiRouter.use(authGuard);

documentAiRouter.get('/', asyncHandler(controller.listHandler));
documentAiRouter.get('/:id', asyncHandler(controller.detailHandler));
documentAiRouter.post('/:id/decision', asyncHandler(controller.decisionHandler));
