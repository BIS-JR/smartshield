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

## Estado atual

Fase 0 concluída: monorepo, banco com as 33 tabelas (transacionais + histórico) migrado e catálogo de módulos seedado, tokens visuais travados, esqueleto do frontend (Vite+React+Tailwind+PWA) e do backend (Express+Prisma) rodando e conversando com o banco.

Próximas fases (autenticação, telas dos módulos etc.) seguem a ordem definida no plano de implementação.
