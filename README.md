# SmartShield Fraud Intelligence Platform

Plataforma antifraude descrita em `TELAS.PDF` (aparência) e `FUNCAO.PDF` (funcionalidade). Plano completo em `.claude/plans` (ou peça para o assistente recuperar). Web app React responsivo, instalável como PWA, backend Express + Prisma + PostgreSQL.

## Estrutura

```
apps/web    → React + Vite + Tailwind (frontend, PWA)
apps/api    → Express + Prisma (backend + banco)
packages/shared → tipos/schemas compartilhados (futuro)
```

## Pré-requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm` se não tiver)
- PostgreSQL rodando localmente, banco `smartshield`, role `smartshield`/senha `smartshield` (ou ajuste `apps/api/.env`)

## Rodando localmente

```bash
pnpm install

# banco (primeira vez ou após alterar o schema)
pnpm prisma:migrate
pnpm prisma:seed

# desenvolvimento (dois terminais)
pnpm dev:api   # http://localhost:4000
pnpm dev:web   # http://localhost:5173
```

`apps/api/.env` é copiado de `.env.example` com credenciais de exemplo. Login via Google e envio de e-mail (OTP) só funcionam de verdade depois de preencher `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` e `SMTP_*` com credenciais reais; até lá, o fluxo funciona com esses valores fictícios para desenvolvimento.

## Testes

```bash
pnpm --filter api test   # Vitest + Supertest (unitários + integração contra o app real)
pnpm --filter web test   # Vitest + Testing Library
```

## Estado atual

Todas as 11 fases do plano de implementação concluídas:

- **Fase 0** — monorepo, banco com as 33+ tabelas (transacionais + histórico), catálogo de módulos, tokens visuais, PWA
- **Fase 1** — autenticação completa (login, cadastro+OTP, esqueci/redefinir senha, Google OAuth, 2FA), Landing Page
- **Fase 2** — AppShell (header, drawer, SwipeNav), Painel Geral
- **Fase 3-6** — Document AI Engine, Supplier Intelligence, Corporate Fraud Graph (grafo de rede D3 interativo), Payment Risk Engine
- **Fase 7** — Executive Dashboard (KPIs e tendências agregados dos módulos reais)
- **Fase 8** — Investigation Assistant (bloqueios derivados de registros reais, briefing automático, chat)
- **Fase 9** — Rules Engine (CRUD completo, condições avaliadas de verdade via `expr-eval`)
- **Fase 10** — tela de Segurança/2FA, code-splitting por rota, ícones do PWA, testes automatizados

Todos os dados de demonstração são gerados por um motor de decisão determinístico (mesma entidade sempre produz o mesmo resultado), não são números fixos — ver `apps/api/src/lib/decisionEngine.ts`.

### Limitações conhecidas

- Login via Google e envio de e-mail (OTP) usam credenciais de exemplo até você preencher `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` e `SMTP_*` em `apps/api/.env` com valores reais.
- As regras do Rules Engine são avaliadas sob demanda (botão "testar regra" contra dados existentes); ainda não há um pipeline de avaliação automática toda vez que um caso novo é criado, já que os módulos não têm uma tela de "criar novo caso" (todos os dados de demonstração vêm do seed).
- Rede de Parceiros ONCLICK (CRM/funil, app separado descrito no FUNCAO.PDF) ficou fora de escopo desta entrega, por decisão combinada no planejamento.
