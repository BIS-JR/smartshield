import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { prisma } from './db/prisma.js';

const app = createApp();

describe('GET /api/health', () => {
  it('reports ok status and the seeded module count', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.modules).toBe(7);
  });
});

describe('authGuard', () => {
  it('rejects requests to protected routes without a token', async () => {
    const res = await request(app).get('/api/document-ai');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/document-ai').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects login with a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ninguem@smartshield.local', password: 'qualquer123' });
    expect(res.status).toBe(401);
  });

  it('rejects login with an invalid email format before hitting the database', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nao-e-email', password: 'x' });
    expect(res.status).toBe(400);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
