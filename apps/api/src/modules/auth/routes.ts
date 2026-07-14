import { Router } from 'express';
import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorVerifySchema,
} from '@smartshield/shared';
import { zodValidate } from '../../middleware/zodValidate.js';
import { authRateLimit } from '../../middleware/rateLimit.js';
import { authGuard } from '../../middleware/authGuard.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as controller from './controller.js';

export const authRouter = Router();

authRouter.use(authRateLimit);

authRouter.post('/register', zodValidate(registerSchema), asyncHandler(controller.registerHandler));
authRouter.post('/verify-signup-otp', zodValidate(verifyOtpSchema), asyncHandler(controller.verifySignupOtpHandler));
authRouter.post('/login', zodValidate(loginSchema), asyncHandler(controller.loginHandler));
authRouter.post('/2fa/login', zodValidate(twoFactorVerifySchema), asyncHandler(controller.twoFactorLoginHandler));
authRouter.post('/google', zodValidate(googleLoginSchema), asyncHandler(controller.googleLoginHandler));
authRouter.post('/forgot-password', zodValidate(forgotPasswordSchema), asyncHandler(controller.forgotPasswordHandler));
authRouter.post('/reset-password', zodValidate(resetPasswordSchema), asyncHandler(controller.resetPasswordHandler));
authRouter.post('/refresh', asyncHandler(controller.refreshHandler));
authRouter.post('/logout', asyncHandler(controller.logoutHandler));

authRouter.get('/me', authGuard, asyncHandler(controller.meHandler));
authRouter.post('/2fa/setup', authGuard, asyncHandler(controller.setupTwoFactorHandler));
authRouter.post('/2fa/confirm', authGuard, asyncHandler(controller.confirmTwoFactorHandler));
authRouter.post('/2fa/disable', authGuard, asyncHandler(controller.disableTwoFactorHandler));
