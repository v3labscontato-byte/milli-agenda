# AGENTE COMANDAS — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Comandas completo.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Backend: apps/api/src/modules/comandas/**
          apps/api/src/modules/pagamentos/**
Frontend:
- apps/web/src/app/(comandas)/comandas/page.tsx
- apps/web/src/components/comandas/**
- apps/web/src/hooks/use-comandas.ts
- apps/web/src/lib/api/comandas.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /commands | ✅ Existe |
| GET /commands/:id | ✅ Existe |
| POST /commands | ✅ Existe |
| POST /commands/:id/items | ✅ Existe |
| DELETE /commands/:id/items/:itemId | ✅ Existe |
| POST /commands/:id/discount | ✅ Existe |
| POST /commands/:id/close | ✅ Existe |
| PATCH /commands/:id/cancel | ✅ Existe |
| GET /payments | ✅ Existe |
| POST /payments | ✅ Existe |
| PATCH /payments/:id/refund | ✅ Existe |

## REGRAS DE NEGÓCIO
- Comanda aberta → adicionar itens → fechar → pagamento
- Desconto: percentual ou valor fixo
- Pagamento: pix, credito, debito, dinheiro, voucher
- Pagamento parcial permitido (múltiplos métodos)
- Estorno: PATCH /payments/:id/refund

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Testar com curl
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
