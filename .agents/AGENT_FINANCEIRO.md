# AGENT_FINANCEIRO — Milli Agenda

## IDENTIDADE
Agente especializado no módulo Financeiro do Milli Agenda.
Modelo recomendado: claude-sonnet-4-6

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(financeiro)/financeiro/page.tsx
- apps/web/src/components/financeiro/ (todos)
- apps/web/src/components/shared/smart-form-meta.tsx
- apps/web/src/hooks/use-relatorios.ts

### Backend
- apps/api/src/modules/relatorios/ (todos)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/reports/kpis → objeto flat (não array)
- GET /api/v1/reports/revenue?from=&to=
- GET /api/v1/reports/appointments?from=&to=
- GET /api/v1/reports/professionals?from=&to=
- GET /api/v1/reports/commissions?from=&to=
- GET /api/v1/reports/cashflow?from=&to=
- GET /api/v1/reports/overdue
- GET /api/v1/reports/goals
- POST /api/v1/reports/goals → { tipo, periodo, valor, dataInicio, dataFim }
- DELETE /api/v1/reports/goals/:id

## ESTADO ATUAL DO MÓDULO
✅ KPIs reais (faturamento, agendamentos, ocupação)
✅ Gráficos de receita conectados ao cashflow
✅ Comissões por profissional
✅ Inadimplência (overdue)
✅ Metas: smart-form-meta conectado ao POST /reports/goals
✅ Guarda FEATURES.realRelatorios removida — seção renderiza normalmente

## MÓDULOS COM GUARD (mostram Empty State em produção)
- Despesas (sem backend ainda)
- Procedimentos detalhados (sem backend ainda)
- Plano de Contas (sem backend ainda)
- Pagamentos histórico detalhado (sem backend ainda)

## PADRÕES CRÍTICOS DO MÓDULO
- /reports/kpis retorna OBJETO FLAT, não array — usar toKpiArray()
- Goal model: { tipo, periodo, valor, dataInicio, dataFim, tenantId }
- Todos os Decimais do Prisma → Number(valor ?? 0)
- Divisão: count > 0 ? total / count : 0

## BACKLOG DO MÓDULO
- [ ] Backend para Despesas (modelo Expense)
- [ ] Gráfico de metas vs realizado
- [ ] Exportação de relatórios (PDF/Excel)

## REGRAS INVIOLÁVEIS
1. NUNCA editar schema.prisma (só AGENT_INFRA pode)
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(financeiro): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
