# CLAUDE.md — Milli Agenda
> Arquivo lido automaticamente pelo Claude Code em toda sessão.

## IDENTIDADE DO PROJETO
SaaS multi-tenant de gestão de salões de beleza.
Monorepo Turborepo com Next.js 14 (frontend) + NestJS (backend).

## REGRAS OBRIGATÓRIAS
1. SEMPRE ler DEVLOG.md antes de qualquer tarefa
2. SEMPRE atualizar DEVLOG.md após concluir qualquer tarefa
3. SEMPRE rodar npx tsc --noEmit antes de commitar
4. SEMPRE fazer push para main (único ambiente = produção)
5. NUNCA editar arquivos fora do escopo do agente ativo
6. NUNCA adicionar Co-Authored-By em commits

## PRODUTO
SaaS multi-tenant de gestão de salões de beleza.
Stack: Next.js 14 + NestJS 10 + Fastify + Prisma + PostgreSQL + Railway

## URLs DE PRODUÇÃO
- Frontend: https://milli-agenda-production.up.railway.app
- Backend: https://victorious-sparkle-production-adbc.up.railway.app
- API Base: /api/v1

## REPOSITÓRIO
- GitHub: v3labscontato-byte/milli-agenda
- Branch produção: main → auto-deploy Railway

## CREDENCIAIS DEMO
- Tenant: bella-vista / admin@bellavista.com / Admin@123

## ESTRUTURA DE SUBAGENTES
Cada subagente tem escopo fechado. Lê apenas seu .agents/AGENT_*.md + DEVLOG tail.

| Agente | Arquivo | Modelo | Módulo |
|--------|---------|--------|--------|
| Auth | .agents/AGENT_AUTH.md | sonnet | Login, cadastro, onboarding, JWT |
| Dashboard | .agents/AGENT_DASHBOARD.md | haiku | KPIs, gráficos, visão geral |
| Agenda | .agents/AGENT_AGENDA.md | haiku | Calendário semanal/dia, agendamentos |
| Clientes | .agents/AGENT_CLIENTES.md | haiku | CRUD clientes, histórico |
| Profissionais | .agents/AGENT_PROFISSIONAIS.md | haiku | CRUD profissionais, roles, comissão |
| Serviços | .agents/AGENT_SERVICOS.md | haiku | CRUD serviços, categorias |
| Comandas | .agents/AGENT_COMANDAS.md | haiku | Comandas, pagamentos, itens |
| Financeiro | .agents/AGENT_FINANCEIRO.md | sonnet | KPIs, relatórios, metas, cashflow |
| Configurações | .agents/AGENT_CONFIGURACOES.md | haiku | Settings, plano, notificações |
| Infra | .agents/AGENT_INFRA.md | sonnet | Schema, migrations, deploy, seed |
| Booking | .agents/AGENT_BOOKING.md | sonnet | Site público de agendamento |

## COMO SPAWNAR SUBAGENTES EM PARALELO
Quando receber múltiplas tarefas de módulos diferentes, use Agent tool com run_in_background: true.
Cada agente inicia lendo: cat .agents/AGENT_<MODULO>.md + cat DEVLOG.md | tail -100

## SMART FORMS (apps/web/src/components/shared/)
- smart-form-servico.tsx — 4 steps
- smart-form-profissional.tsx — 4 steps
- smart-form-categoria.tsx — 2 steps
- smart-form-meta.tsx — 2 steps
- smart-form-salao.tsx — 3 steps
- smart-form-app-cliente.tsx — 4 steps

## ARQUIVOS COMPARTILHADOS (nunca editar em paralelo)
- packages/database/prisma/schema.prisma → apenas AGENT_INFRA
- apps/web/src/lib/features.ts → apenas orquestrador
- apps/web/src/middleware.ts → apenas AGENT_AUTH
- DEVLOG.md → todos (append >> apenas, nunca sobrescrever)

## VARIÁVEIS DE AMBIENTE
Frontend (Railway): NEXT_PUBLIC_API_URL, NEXT_PUBLIC_USE_REAL_API=true
Backend (Railway): DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV=production, PORT

## API CLIENT PATTERN
- apps/web/src/lib/api/client.ts: api.get<T>(), api.post<T>(), api.delete<T>()
- Paths devem incluir /api/v1/
- Auto-unwrap do envelope { success, data }
- Auto-logout em 401
- Decimais do Prisma vêm como string → sempre Number(valor ?? 0)

## RESPONSE FORMAT
Backend retorna: { "success": true, "data": ... }
Exceção: /reports/kpis retorna objeto flat (não array)

## BUILD & TEST
npx tsc --noEmit   # Type check (sempre antes de commitar)
npm run build      # Production build
npm run lint       # ESLint
