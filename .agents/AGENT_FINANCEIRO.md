# AGENTE FINANCEIRO — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Financeiro completo.
Cuide de front + back + regras de negócio. Não edite arquivos fora do seu escopo.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md
# Leia TODO o conteúdo. Registre sua tarefa como EM ANDAMENTO antes de começar.

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/relatorios/relatorios.service.ts
- apps/api/src/modules/relatorios/relatorios.controller.ts

Frontend:
- apps/web/src/app/(financeiro)/financeiro/page.tsx
- apps/web/src/components/financeiro/**
- apps/web/src/hooks/use-relatorios.ts
- apps/web/src/lib/api/relatorios.ts
- apps/web/src/lib/financeiro-mock.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /reports/kpis | ✅ Existe |
| GET /reports/revenue | ✅ Existe |
| GET /reports/appointments | ✅ Existe |
| GET /reports/professionals | ✅ Existe |
| GET /reports/commissions | 🔨 Criar |
| GET /reports/cashflow | 🔨 Criar |
| GET /reports/overdue | 🔨 Criar |

## REGRAS DE NEGÓCIO
- Comissão padrão: 20% da receita por profissional
- Fluxo de caixa: entradas = payments PAID, saídas = 0 (sem módulo despesas ainda)
- Inadimplência: appointments CONFIRMED/SCHEDULED com startAt < now()
- Período padrão: início do mês corrente → hoje
- Formato moeda: BRL (R$ 1.234,56)

## BACKLOG (sem backend ainda)
- [ ] Metas de faturamento → precisa tabela Goal no banco
- [ ] Plano de contas/despesas → precisa tabela Expense no banco
- [ ] DRE completo → depende de Expense + Goal

## PASSO FINAL — OBRIGATÓRIO
Após qualquer tarefa:
1. npx tsc --noEmit → deve ser 0 erros
2. Testar endpoints com curl
3. Atualizar DEVLOG.md com resultado
4. git add . && git commit -m "feat(financeiro): descrição" && git push origin main
