# DEVLOG — Milli Agenda
> **Arquivo compartilhado entre Claude 1 (backend) e Claude 2 (frontend)**
> 
> ## ⚠️ REGRA OBRIGATÓRIA PARA AMBOS OS CLAUDES:
> 1. **SEMPRE** executar `cat DEVLOG.md` antes de qualquer tarefa
> 2. **SEMPRE** atualizar este arquivo após concluir qualquer tarefa
> 3. **NUNCA** executar uma tarefa sem consultar este arquivo primeiro
> 4. Se encontrar conflito com instrução do usuário, este arquivo prevalece como contexto

---

## 📋 FORMATO DE REGISTRO

### [DATA] [CLAUDE 1 ou CLAUDE 2] — Título da tarefa
**Status:** ✅ Concluído | 🔄 Em andamento | ❌ Falhou  
**Arquivos alterados:** lista  
**O que foi feito:** descrição  
**Problemas encontrados:** se houver  
**Próximo passo sugerido:** se souber  

---

## 🏗️ ARQUITETURA DO PROJETO

**Monorepo:** Turborepo + npm workspaces  
**Frontend:** Next.js 14 + Tailwind + shadcn/ui → `apps/web/`  
**Backend:** NestJS + Prisma + Fastify → `apps/api/`  
**Database:** PostgreSQL (Railway)  
**Deploy:** Railway (único ambiente = produção)  
**Branch principal:** `main` → deploy automático no Railway  

**URLs de produção:**
- Frontend: https://milli-agenda-production.up.railway.app
- Backend: https://victorious-sparkle-production-adbc.up.railway.app

**Credenciais demo:**
- Tenant: bella-vista
- Email: admin@bellavista.com
- Senha: Admin@123

---

## 🗂️ DIVISÃO DE RESPONSABILIDADES

| Claude 1 — Backend | Claude 2 — Frontend |
|---|---|
| `apps/api/**` | `apps/web/**` |
| `packages/database/**` | `apps/web/src/**` |
| `packages/shared-types/**` | `apps/web/tailwind.config.ts` |
| `packages/business-rules/**` | `apps/web/next.config.mjs` |

**NUNCA editar simultaneamente:**
- `package.json` raiz
- `package-lock.json` raiz
- `turbo.json`
- `.gitignore` raiz

---

## 📡 ROTAS DO BACKEND (base: /api/v1)

| Endpoint | Método | Descrição |
|---|---|---|
| /auth/login | POST | Login com email + senha (sem tenantSlug — detectado automaticamente) |
| /auth/register | POST | Cadastro novo salão |
| /auth/refresh | POST | Refresh token |
| /appointments | GET/POST/PATCH/DELETE | Agendamentos |
| /clients | GET/POST/PATCH/DELETE | Clientes |
| /professionals | GET/POST/PATCH/DELETE | Profissionais |
| /services | GET/POST/PATCH/DELETE | Serviços |
| /commands | GET/POST/PATCH/DELETE | Comandas |
| /payments | GET/POST/PATCH | Pagamentos |
| /reports/kpis | GET | KPIs do dashboard (retorna objeto flat, não array) |
| /reports/revenue | GET | Receita |

**Formato de resposta padrão do backend:**
```json
{ "success": true, "data": [...] }
```
**O client.ts já faz unwrap automático — hooks recebem o array diretamente.**

**ATENÇÃO:** `/reports/kpis` retorna um objeto flat, não array:
```json
{ "totalAppointments": 0, "completedAppointments": 0, "todayRevenue": 0, "occupancyRate": 0, "totalClients": 0 }
```
O hook `use-relatorios.ts` transforma via `toKpiArray()`.

---

## ✅ HISTÓRICO DE TAREFAS CONCLUÍDAS

### [2026-06-24] CLAUDE 1 — Deploy backend Railway
**Status:** ✅ Concluído  
**O que foi feito:** NestJS deployado no Railway (victorious-sparkle), PostgreSQL configurado, seed rodado com tenant bella-vista  
**Arquivos alterados:** apps/api/nixpacks.toml, Dockerfile  

---

### [2026-06-24] CLAUDE 2 — Deploy frontend Railway
**Status:** ✅ Concluído  
**O que foi feito:** Next.js deployado no Railway (milli-agenda-production), Root Directory = apps/web, healthcheck = /booking  
**Arquivos alterados:** apps/web/railway.toml, apps/web/next.config.mjs, apps/web/package.json  

---

### [2026-06-24] CLAUDE 1 — Endpoints auth
**Status:** ✅ Concluído  
**O que foi feito:** POST /auth/login e POST /auth/register funcionando em produção. Register retorna accessToken + refreshToken + user + tenant  
**Problemas encontrados:** 500 por DTO incorreto (slug vs tenantSlug), corrigido com ValidationPipe global  

---

### [2026-06-24] CLAUDE 2 — Página /login e /cadastro
**Status:** ✅ Concluído  
**O que foi feito:** Login sem campo slug (detectado automaticamente), wizard /cadastro 3 etapas (Salão → Responsável → Plano)  
**Arquivos alterados:** apps/web/src/app/login/page.tsx, apps/web/src/app/cadastro/page.tsx  

---

### [2026-06-24] CLAUDE 1 — Padronizar rotas para inglês
**Status:** ✅ Concluído  
**O que foi feito:** Controllers profissionais → professionals, servicos → services  
**Arquivos alterados:** apps/api/src/modules/profissionais/profissionais.controller.ts, apps/api/src/modules/servicos/servicos.controller.ts  

---

### [2026-06-24] CLAUDE 2 — Corrigir token 401 e paths
**Status:** ✅ Concluído  
**O que foi feito:** Token JWT agora enviado em todas as requisições, auto-logout em 401, path /orders → /commands corrigido  
**Arquivos alterados:** apps/web/src/lib/api/client.ts, apps/web/src/lib/api/comandas.ts  

---

### [2026-06-24] CLAUDE 2 — Corrigir hooks .data unwrap
**Status:** ✅ Concluído  
**O que foi feito:** Hooks estavam fazendo res.data mas client.ts já fazia unwrap. Corrigido em todos os hooks  
**Arquivos alterados:** apps/web/src/hooks/use-agenda.ts, use-clientes.ts, use-comandas.ts, use-profissionais.ts, use-servicos.ts, use-relatorios.ts  

---

### [2026-06-25] CLAUDE 2 — Corrigir tela branca após login
**Status:** ✅ Concluído  
**O que foi feito:** Dashboard crashava com `t.map is not a function` porque `/reports/kpis` retorna objeto (não array). Adicionada `toKpiArray()` em `use-relatorios.ts` para transformar o objeto em `KpiData[]`. Testado em produção — todas as 8 telas passam sem erro  
**Arquivos alterados:** apps/web/src/hooks/use-relatorios.ts  
**Telas testadas:** Dashboard ✅ Agenda ✅ Clientes ✅ Profissionais ✅ Serviços ✅ Comandas ✅ Financeiro ✅ Configurações ✅  

---

### [2026-06-25] CLAUDE 1 — Smoke test + fix reports endpoints
**Status:** ✅ Concluído  
**O que foi feito:** Smoke test de todos os 9 GET endpoints. 6/9 passaram de imediato. 3 falhavam com 500 (`/reports/revenue`, `/reports/appointments`, `/reports/professionals`) porque `from`/`to` eram obrigatórios mas não eram validados — `new Date(undefined)` gerava `Invalid Date` no Prisma. Corrigido adicionando `defaultRange()` no service (default: início do mês corrente → agora) e marcando params como opcionais no controller.  
**Arquivos alterados:** `apps/api/src/modules/relatorios/relatorios.service.ts`, `apps/api/src/modules/relatorios/relatorios.controller.ts`  
**Resultado final:** 9/9 endpoints GET funcionando em produção ✅

---

### [2026-06-25] CLAUDE 1 — Smoke test POST/PATCH/DELETE endpoints
**Status:** ✅ Concluído  
**Endpoints testados:**
- POST /clients ✅ 201
- POST /professionals ✅ 201
- POST /services ✅ 201
- POST /appointments ✅ 201 — campo correto é `durationMin` (não `endAt`)
- PATCH /appointments/:id ✅ 200
- PATCH /appointments/:id/status ✅ 200 (SCHEDULED→CONFIRMED)
- POST /commands ✅ 201
- POST /commands/:id/items ✅ 201
- POST /commands/:id/close ✅ 200
- POST /payments ✅ 201
- DELETE /professionals/:id ✅ 200 (soft delete — active: false)
- DELETE /services/:id ✅ 200 (soft delete — active: false)
- DELETE /clients/:id ⚠️ Corrigido: retornava 500 por FK constraint. Agora retorna 409 com mensagem clara quando cliente tem agendamentos  
**Arquivos alterados:** `apps/api/src/modules/clientes/clientes.service.ts`  
**Observação:** `POST /appointments` requer `durationMin` (int, mínimo 5) — não `endAt`. O `endAt` é calculado pelo service.

---

### [2026-06-25] CLAUDE 2 — Modais e KPIs conectados à API real
**Status:** ✅ Concluído  
**O que foi feito:**
- P1: `novo-agendamento-modal.tsx` — removidos `MOCK_AGENDAMENTOS` e `MOCK_SERVICOS`; dropdowns agora usam `useServicos()` e `useProfissionais()` com IDs reais; submit chama `agendaApi.create()` com `serviceId`, `professionalId`, `date`, `startTime`
- P2: `nova-comanda-modal.tsx` — removido `MOCK_SERVICOS` e lista hardcoded de profissionais; dropdowns usam hooks reais; `NovaComandaData` agora inclui `serviceId` e `professionalId`
- P2b: `comandas/page.tsx` — `handleCreate` agora chama `comandasApi.create()` (fire-and-forget, UI otimista já garante exibição imediata)
- P3: KPI cards de `clientes`, `profissionais` e `servicos` — removido import de `kpiStats` dos arquivos mock; cálculo inline em `useMemo` diretamente sobre o array real da API
**Arquivos alterados:** `novo-agendamento-modal.tsx`, `nova-comanda-modal.tsx`, `comandas/page.tsx`, `clientes/page.tsx`, `profissionais/page.tsx`, `servicos/page.tsx`  
**tsc --noEmit:** 0 erros ✅

---

### [2026-06-25] ORCHESTRATOR — Criar estrutura de agentes
**Status:** ✅ Concluído  
**O que foi feito:** Criada pasta .agents/ com 10 arquivos de agentes especializados. Cada agente tem: identidade, escopo de arquivos, endpoints, regras de negócio e backlog.  
**Como usar:** `cat .agents/AGENT_<MODULO>.md` → colar no Claude Code como primeiro prompt  
**Arquivos criados:** `.agents/ORCHESTRATOR.md` + `AGENT_FINANCEIRO`, `AGENT_BOOKING`, `AGENT_CONFIGURACOES`, `AGENT_AGENDA`, `AGENT_CLIENTES`, `AGENT_PROFISSIONAIS`, `AGENT_SERVICOS`, `AGENT_COMANDAS`, `AGENT_INFRA`

---

### [2026-06-25] ORCHESTRATOR — Configurar subagentes reais
**Status:** ✅ Concluído  
**O que foi feito:** CLAUDE.md criado na raiz com instruções de subagentes. Claude Code agora lê automaticamente o contexto do projeto em toda sessão. Subagentes podem ser executados em paralelo via Task tool.  
**Como usar:** Enviar múltiplas tarefas de módulos diferentes → Claude Code executa em paralelo  
**Arquivos criados:** `CLAUDE.md`, `.agents/AGENT_AUTH.md`, `.agents/AGENT_DASHBOARD.md`  
**Claude Code version:** 2.1.187

---

## 🔄 TAREFAS EM ANDAMENTO

_Nenhuma no momento._

---

## 🚨 PROBLEMAS CONHECIDOS

1. **Topbar mostra "Agenda" em vez do título correto na página Configurações** — bug cosmético, baixa prioridade
2. **Formato de resposta do backend pode variar** — sempre verificar com `console.log(res)` antes de tipar (ex: /reports/kpis retorna objeto, outros retornam array)
3. **Financeiro e Configurações** ainda usam mock data — não há endpoints reais para essas seções ainda

---

## 📅 PRÓXIMAS TAREFAS (ROADMAP)

### SEMANA 2:
- [ ] Claude 1: Ambientes Railway + Pre-deploy migrations
- [ ] Claude 2: Error handling global + Toast notifications
- [ ] Claude 2: Paginação real nas tabelas
- [ ] Ambos: QA completo end-to-end

### SEMANA 3:
- [ ] Claude 1: Upload S3 + WhatsApp notifications
- [ ] Claude 2: Onboarding wizard completo
- [ ] Beta com primeiros clientes

### [2026-06-25] CLAUDE 2 (agent-auth) � Auth: forgot-password, reset-password, forca senha
**Status:** Concluido
**Arquivos alterados:** forgot-password/page.tsx, reset-password/page.tsx, login/page.tsx, cadastro/page.tsx, middleware.ts, lib/api/auth.ts, lib/password-strength.ts
**O que foi feito:** Paginas de recuperacao e redefinicao de senha com indicador de forca. Rotas publicas no middleware. forgotPassword e resetPassword em auth.ts. Plano pre-selecionado via ?plan= no cadastro.


---

### [2026-06-25] CLAUDE 2 (agent-agenda) — Agenda: API real, Empty States
**Status:** Concluido
**O que foi feito:** Pagina da agenda passa date+professionalId para useAgenda() (filtros disparam re-fetch via API na visao dia; visao semana busca o periodo completo). 4 estados implementados: loading (skeleton), erro, vazio e sucesso em visao dia ("Nenhum agendamento para hoje"), visao semana ("Nenhum agendamento nesta semana.") e tabela ("Nenhum atendimento encontrado para o periodo."). Fluxo + Novo Agendamento agora usa o NovoAgendamentoModal real (useServicos/useProfissionais + agendaApi.create com clientName, serviceId, professionalId, date, startTime, durationMin, notes), com erro de submit visivel e re-fetch da agenda apos criar. agenda.ts: query string ignora params undefined/vazios.
**Arquivos alterados:** apps/web/src/app/(dashboard)/agenda/page.tsx, components/agenda-table.tsx, components/agenda/novo-agendamento-modal.tsx, hooks/use-agenda.ts, lib/api/agenda.ts
**tsc --noEmit:** 0 erros nos arquivos da agenda (erro pre-existente em use-relatorios.ts fora do escopo)

### [2026-06-25] CLAUDE 2 (agent-comandas) — Comandas: API real, Empty States
**Status:** Concluido
**O que foi feito:** Mocks removidos. Empty States implementados. Fluxo completo: abrir -> adicionar item -> fechar -> pagamento. Hook useComandas agora expoe refetch; page wired para POST /commands e POST /payments com recarga apos cada acao.


### [2026-06-25] CLAUDE 2 (agent-clientes) — Clientes: API real, Empty States
**Status:** Concluido
**O que foi feito:** Mocks removidos. Empty State implementado. CRUD validado com tratamento de 409 para clientes com agendamentos.


### [2026-06-25] CLAUDE 2 (agent-servicos) — Servicos: API real, Empty States
**Status:** Concluido
**O que foi feito:** Mocks removidos do hook e do modal de criacao. use-servicos mapeia a Service do backend (durationMin/price/active) para o tipo Servico do frontend e expoe create/update/remove com refetch. Modal de Novo Servico faz POST real com estados de loading/erro. Empty State com botao na pagina. tsc sem erros nos arquivos de servicos.

### [2026-06-25] CLAUDE 2 (agent-configuracoes) - Configuracoes: API real, dados reais
**Status:** Concluido
**O que foi feito:** Criados use-configuracoes.ts e lib/api/configuracoes.ts (GET/PATCH /api/v1/settings). section-meu-salao usa dados reais do tenant (name, email, phone, document, logoUrl) com loading/error/saving states. section-plano mostra plano real (STARTER/PROFESSIONAL/ENTERPRISE/TRIAL) e dias restantes de trial. section-api e section-lgpd sem dados fake (Empty States + TODO). Flag realConfiguracoes em features.ts. tsc --noEmit limpo.

### [2026-06-25] CLAUDE 2 (agent-profissionais) - Profissionais: API real, Empty States
**Status:** Concluido
**O que foi feito:** Mocks removidos do fluxo de dados (hook usa API real via FEATURES.realProfissionais). use-profissionais expoe create/update/remove (soft delete via status inactive) e refetch. Modal de Novo Profissional faz POST real com loading/erro e refetch da lista. Empty State com icone UserCheck e CTA Novo Profissional. KPIs calculados inline com useMemo a partir dos dados reais. tsc limpo nos arquivos de profissionais.


### [2026-06-25] CLAUDE 2 (agent-financeiro) — Financeiro: API real, novos endpoints
**Status:** Concluido
**O que foi feito:** Mocks removidos no modulo financeiro (atras de FEATURES.realRelatorios). Conectado a /reports/commissions, /reports/cashflow, /reports/overdue. KPIs calculados em tempo real via /reports/kpis. Filtros de periodo (Hoje/Semana/Mes/Ultimos 30/Custom) disparam refetch de comissoes e fluxo de caixa. 4 estados (loading/empty/error/data) em comissoes, fluxo, inadimplencia e KPIs.
**Backlog registrado:** Metas -> tabela Goal (/reports/goals), Despesas -> tabela Expense (/reports/expenses)

### [2026-06-25] CLAUDE 2 (agent-dashboard) - Dashboard: API real, Empty States
**Status:** Concluido
**O que foi feito:** Removidos mocks do dashboard. Os 4 graficos (bookings/services/weekly/volume) foram conectados a API real (/reports/appointments, /reports/professionals, /reports/revenue, /reports/cashflow) via novos hooks em use-relatorios.ts (useBookingsByStatus, useProfessionalsReport, useRevenueReport, useCashflowReport). 4 estados (loading/empty/error/success) implementados em todos. Tenant novo ve zeros e graficos vazios. Hotfix aplicado apos colisao de merge nos arquivos compartilhados use-relatorios.ts/relatorios.ts. tsc --noEmit limpo.


### [2026-06-25] CLAUDE 2 (agent-dashboard) � Dashboard: charts API real, hotfix colisao merge
**Status:** ? Conclu�do
**Arquivos alterados:** bookings-chart.tsx, services-chart.tsx, weekly-chart.tsx, volume-chart.tsx, use-relatorios.ts, relatorios.ts
**O que foi feito:** 4 charts reescritos com hooks reais (useBookingsByStatus, useProfessionalsReport, useRevenueReport, useCashflowReport). Empty/Loading/Error states em todos. Hotfix aplicado ap�s colis�o de merge com agent-financeiro nos arquivos compartilhados.
**Li��o:** use-relatorios.ts e relatorios.ts s�o arquivos compartilhados � edi��es paralelas causam colis�o. Serializar na pr�xima rodada.


### [2026-06-25] ORCHESTRATOR � Corre��o p�s-epics + ajuste de modelos
**Status:** ?? Em andamento
**Tarefas:** mocks financeiro, mocks configura��es, modelo por agente


### [2026-06-25] fix-agentes — Modelos ajustados por agente
**Status:** ✅ Concluído
**Sonnet:** Auth, Financeiro, Infra, Booking (tarefas complexas)
**Haiku:** Dashboard, Agenda, Clientes, Profissionais, Serviços, Comandas, Configurações
**Economia estimada:** ~70% redução no custo de tokens por rodada

### [2026-06-25] fix-configuracoes � Corre��o mocks remanescentes
**Status:** ? Conclu�do
**O que foi feito:** WhatsApp/email/PIX fict�cios removidos. Plano real do banco. Trial calculado de trialEndsAt.
**Backlog:** Integra��o WhatsApp Business real, SMTP real, Billing/subscription real


### [2026-06-25] fix-financeiro � Corre��o mocks remanescentes
**Status:** ? Conclu�do
**O que foi feito:** Todos os valores hardcoded removidos do caminho real-API. buildRealKpis n�o espalha mais FINANCEIRO_KPIS (metas/trends zerados). ReceitaChart conectado a cashflow.entries no modo real, com empty/loading/error states; donut de m�todo mostra 'Sem pagamentos no per�odo' (API n�o fornece m�todo). Zeros reais para tenant sem dados.

