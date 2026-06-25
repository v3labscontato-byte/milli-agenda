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

## ESTRUTURA DE SUBAGENTES
Este projeto usa subagentes especializados por módulo.
Cada subagente tem escopo fechado e não interfere nos outros.

### Como spawnar subagentes em paralelo:
Quando receber múltiplas tarefas de módulos diferentes,
use a ferramenta Task para executá-las em paralelo:

Task 1: cat .agents/AGENT_FINANCEIRO.md → executar tarefa financeiro
Task 2: cat .agents/AGENT_AGENDA.md → executar tarefa agenda
Task 3: cat .agents/AGENT_CLIENTES.md → executar tarefa clientes

Cada Task é independente e não conflita com as outras
pois cada agente tem escopo de arquivos exclusivo.

## SUBAGENTES DISPONÍVEIS
| Agente | Arquivo | Escopo Principal |
|--------|---------|-----------------|
| Auth | .agents/AGENT_AUTH.md | apps/api/src/modules/auth, apps/web/src/app/login |
| Financeiro | .agents/AGENT_FINANCEIRO.md | apps/web/src/components/financeiro, /reports |
| Booking | .agents/AGENT_BOOKING.md | apps/web/src/app/(booking) |
| Configurações | .agents/AGENT_CONFIGURACOES.md | apps/web/src/components/configuracoes |
| Agenda | .agents/AGENT_AGENDA.md | apps/web/src/components/agenda |
| Clientes | .agents/AGENT_CLIENTES.md | apps/web/src/components/clientes |
| Profissionais | .agents/AGENT_PROFISSIONAIS.md | apps/web/src/components/profissionais |
| Serviços | .agents/AGENT_SERVICOS.md | apps/web/src/components/servicos |
| Comandas | .agents/AGENT_COMANDAS.md | apps/web/src/components/comandas |
| Dashboard | .agents/AGENT_DASHBOARD.md | apps/web/src/app/dashboard |
| Infra | .agents/AGENT_INFRA.md | apps/api/nixpacks.toml, railway.toml |

## ARQUIVOS COMPARTILHADOS — NUNCA EDITAR EM PARALELO
- package.json (raiz)
- package-lock.json (raiz)
- turbo.json
- DEVLOG.md (usar append >> nunca sobrescrever)
- packages/database/prisma/schema.prisma

## URLS DE PRODUÇÃO
- Frontend: https://milli-agenda-production.up.railway.app
- Backend: https://victorious-sparkle-production-adbc.up.railway.app

## CREDENCIAIS DEMO
- Tenant: bella-vista / admin@bellavista.com / Admin@123
