import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Em produção o build roda a partir de apps/api/dist/app.js, então o
// frontend compilado fica em ../../web/dist relativo a este arquivo.
const webDistDir = path.join(__dirname, '..', '..', 'web', 'dist');

export function createApp() {
  const app = express();

  const allowedOrigins = [env.webOrigin, ...env.allowedOrigins];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Requisições sem "origin" (ex: curl, apps mobile) sempre passam.
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // callback(null, false) só nega os cabeçalhos de CORS (o navegador
        // bloqueia a leitura da resposta do lado dele); não é um erro do
        // servidor, então não deve virar 500 nem poluir os logs.
        callback(null, false);
      },
      credentials: true,
    }),
  );
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

  // Serve o frontend compilado no mesmo domínio da API (deploy "tudo
  // junto"), quando o build do web existir. Em desenvolvimento local o
  // frontend roda separado via Vite, então esse diretório não existe e o
  // bloco inteiro é ignorado.
  if (fs.existsSync(webDistDir)) {
    app.use(express.static(webDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(webDistDir, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
