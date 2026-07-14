import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const paymentRiskRouter = Router();

paymentRiskRouter.use(authGuard);

paymentRiskRouter.get('/summary', asyncHandler(controller.summaryHandler));
paymentRiskRouter.get('/alerts', asyncHandler(controller.alertsHandler));
paymentRiskRouter.get('/transactions/:id', asyncHandler(controller.transactionDetailHandler));
