# AGENTE DASHBOARD — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo Dashboard admin.
NÃO edite arquivos fora do seu escopo.

## MODELO
claude-haiku-4-5-20251001
> Motivo: conectar API existente, remover mocks

## PASSO 0 — OBRIGATÓRIO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Frontend:
- apps/web/src/app/dashboard/page.tsx
- apps/web/src/components/kpi-strip.tsx
- apps/web/src/components/charts/**
- apps/web/src/components/appointments-now.tsx
- apps/web/src/components/upcoming.tsx

## REGRAS DE NEGÓCIO
- NENHUM dado hardcoded
- Empty State para cada componente vazio
- 4 estados obrigatórios: Loading | Empty | Error | Success
- KPIs calculados exclusivamente do backend
- Receita Bruta = soma payments PAID
- Ticket Médio = Receita / atendimentos pagos
- Tenant recém-criado deve mostrar zeros reais

## ENDPOINTS CONSUMIDOS
- GET /reports/kpis
- GET /reports/revenue
- GET /reports/appointments
- GET /reports/professionals

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Validar com tenant recém-criado (deve mostrar zeros)
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
