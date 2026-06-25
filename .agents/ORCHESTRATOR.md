# ORCHESTRATOR — Milli Agenda
> Coordenado por: Vilson (usuário) + Claude (chat principal)
> Este chat é o ponto central de decisão arquitetural do projeto.

## RESPONSABILIDADE
- Definir prioridades e próximos passos
- Criar e delegar prompts para os agentes
- Resolver conflitos entre agentes
- Manter visão geral do produto

## COMO USAR OS AGENTES
1. Identificar o módulo a ser trabalhado
2. Abrir Claude Code
3. Colar o conteúdo do arquivo .agents/AGENT_<MODULO>.md
4. O agente executa front + back + testes + DEVLOG sozinho

## AGENTES DISPONÍVEIS
| Agente | Arquivo | Status |
|--------|---------|--------|
| Financeiro | AGENT_FINANCEIRO.md | ✅ Ativo |
| Booking | AGENT_BOOKING.md | ✅ Ativo |
| Configurações | AGENT_CONFIGURACOES.md | ✅ Ativo |
| Agenda | AGENT_AGENDA.md | ✅ Ativo |
| Clientes | AGENT_CLIENTES.md | ✅ Ativo |
| Profissionais | AGENT_PROFISSIONAIS.md | ✅ Ativo |
| Serviços | AGENT_SERVICOS.md | ✅ Ativo |
| Comandas | AGENT_COMANDAS.md | ✅ Ativo |
| Infraestrutura | AGENT_INFRA.md | ✅ Ativo |

## MODELOS POR AGENTE
| Agente | Modelo | Motivo |
|--------|--------|--------|
| Auth | claude-sonnet-4-6 | Segurança crítica |
| Financeiro | claude-sonnet-4-6 | Cálculos complexos |
| Infra | claude-sonnet-4-6 | Deploy crítico |
| Booking | claude-sonnet-4-6 | Fluxo público complexo |
| Dashboard | claude-haiku-4-5-20251001 | Conectar API |
| Agenda | claude-haiku-4-5-20251001 | Validação simples |
| Clientes | claude-haiku-4-5-20251001 | CRUD simples |
| Profissionais | claude-haiku-4-5-20251001 | CRUD simples |
| Serviços | claude-haiku-4-5-20251001 | CRUD simples |
| Comandas | claude-haiku-4-5-20251001 | CRUD simples |
| Configurações | claude-haiku-4-5-20251001 | Conectar API |

> Economia estimada: ~70% redução no custo de tokens por rodada de epics
