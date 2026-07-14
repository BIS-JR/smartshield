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

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API SmartShield rodando em http://localhost:${env.port}`);
});
