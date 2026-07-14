import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/routes.js';
import { catalogRouter } from './modules/catalog/routes.js';
import { dashboardRouter } from './modules/dashboard/routes.js';
import { documentAiRouter } from './modules/document-ai/routes.js';
import { supplierIntelligenceRouter } from './modules/supplier-intelligence/routes.js';
import { corporateFraudRouter } from './modules/corporate-fraud/routes.js';
import { paymentRiskRouter } from './modules/payment-risk/routes.js';
import { executiveDashboardRouter } from './modules/executive-dashboard/routes.js';
import { investigationRouter } from './modules/investigation/routes.js';
import { rulesEngineRouter } from './modules/rules-engine/routes.js';

const app = express();

app.use(cors({ origin: env.webOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  const moduleCount = await prisma.module.count();
  res.json({ status: 'ok', modules: moduleCount });
});

app.use('/api/auth', authRouter);
app.use('/api/modules', catalogRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/document-ai', documentAiRouter);
app.use('/api/supplier-intelligence', supplierIntelligenceRouter);
app.use('/api/corporate-fraud', corporateFraudRouter);
app.use('/api/payment-risk', paymentRiskRouter);
app.use('/api/executive-dashboard', executiveDashboardRouter);
app.use('/api/investigation', investigationRouter);
app.use('/api/rules-engine', rulesEngineRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API SmartShield rodando em http://localhost:${env.port}`);
});
