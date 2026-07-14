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
pnpm build:shared   # compila packages/shared (necessário mesmo em dev, api/web importam o JS compilado)

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

## Deploy (Render, tudo num único serviço)

O repositório já inclui um `render.yaml` (Render Blueprint) que provisiona o web service e o banco Postgres automaticamente:

1. Crie uma conta em [render.com](https://render.com) e conecte sua conta do GitHub.
2. No dashboard, clique em **New > Blueprint** e selecione o repositório `BIS-JR/smartshield`.
3. O Render lê o `render.yaml`, cria o banco `smartshield-db` e o serviço web `smartshield`, gerando sozinho os segredos JWT.
4. Depois do primeiro deploy, copie a URL atribuída (ex: `https://smartshield.onrender.com`) e preencha a variável `WEB_ORIGIN` com esse valor no painel do serviço (Environment).
5. Pronto. A cada `git push` para `main`, o Render reconstrói e reimplanta automaticamente. O banco é migrado (`prisma migrate deploy`) e semeado com os dados de demonstração a cada start (idempotente, não duplica dados).

Backend e frontend ficam no mesmo domínio (o Express serve os arquivos estáticos do build do Vite), então não há CORS nem cookie cross-site para se preocupar. Login via Google e envio de e-mail continuam simulados até você preencher `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`SMTP_*` no painel do Render.

No plano gratuito o serviço "dorme" após um período de inatividade e demora alguns segundos para acordar na primeira visita seguinte; para ficar sempre ativo, mude o plano do web service para o pago (a partir de ~US$ 7/mês). Confira os termos atuais do plano gratuito de banco de dados no próprio Render antes de depender dele a longo prazo, já que esse tipo de política muda com frequência.

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
