import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const executiveDashboardRouter = Router();

executiveDashboardRouter.use(authGuard);

executiveDashboardRouter.get('/summary', asyncHandler(controller.summaryHandler));
executiveDashboardRouter.get('/fraud-by-module', asyncHandler(controller.fraudByModuleHandler));
executiveDashboardRouter.get('/severity-distribution', asyncHandler(controller.severityDistributionHandler));
executiveDashboardRouter.get('/trends', asyncHandler(controller.trendsHandler));
executiveDashboardRouter.get('/region-risk', asyncHandler(controller.regionRiskHandler));
