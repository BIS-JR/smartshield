import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const supplierIntelligenceRouter = Router();

supplierIntelligenceRouter.use(authGuard);

supplierIntelligenceRouter.get('/', asyncHandler(controller.listHandler));
supplierIntelligenceRouter.get('/:id', asyncHandler(controller.detailHandler));
supplierIntelligenceRouter.post('/:id/decision', asyncHandler(controller.decisionHandler));
supplierIntelligenceRouter.post('/:id/report', asyncHandler(controller.reportHandler));
