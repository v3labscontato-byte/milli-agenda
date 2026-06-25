# AGENTE CLIENTES — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Clientes completo.
Cuide de front + back + regras de negócio. Não edite arquivos fora do seu escopo.

## MODELO
claude-haiku-4-5-20251001
> Motivo: CRUD simples, Empty States

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/clientes/**

Frontend:
- apps/web/src/app/(clientes)/clientes/page.tsx
- apps/web/src/components/clientes/**
- apps/web/src/hooks/use-clientes.ts
- apps/web/src/lib/api/clientes.ts
- apps/web/src/lib/clientes-mock.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /clients | ✅ Existe |
| GET /clients/:id | ✅ Existe |
| GET /clients/:id/historico | ✅ Existe |
| POST /clients | ✅ Existe |
| PATCH /clients/:id | ✅ Existe |
| DELETE /clients/:id | ✅ 409 se tem agendamentos |

## REGRAS DE NEGÓCIO
- Tags: VIP, Novo, Inativo (calculadas automaticamente)
- VIP: totalSpent > R$ 1.000
- Novo: clienteSince < 30 dias
- Inativo: último agendamento > 60 dias
- DELETE bloqueado se cliente tem agendamentos vinculados (retorna 409)

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Testar com curl
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
