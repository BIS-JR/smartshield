import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const rulesEngineRouter = Router();

rulesEngineRouter.use(authGuard);

rulesEngineRouter.get('/', asyncHandler(controller.listHandler));
rulesEngineRouter.post('/', asyncHandler(controller.createHandler));
rulesEngineRouter.patch('/:id', asyncHandler(controller.updateHandler));
rulesEngineRouter.patch('/:id/active', asyncHandler(controller.setActiveHandler));
rulesEngineRouter.delete('/:id', asyncHandler(controller.deleteHandler));
rulesEngineRouter.post('/:id/test', asyncHandler(controller.testHandler));
