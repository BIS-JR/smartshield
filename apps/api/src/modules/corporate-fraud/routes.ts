import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const corporateFraudRouter = Router();

corporateFraudRouter.use(authGuard);

corporateFraudRouter.get('/', asyncHandler(controller.listHandler));
corporateFraudRouter.get('/:id', asyncHandler(controller.detailHandler));
corporateFraudRouter.get('/:id/graph', asyncHandler(controller.graphHandler));
corporateFraudRouter.post('/:id/decision', asyncHandler(controller.decisionHandler));
corporateFraudRouter.post('/:id/report', asyncHandler(controller.reportHandler));
corporateFraudRouter.post('/:id/freeze', asyncHandler(controller.freezeHandler));
