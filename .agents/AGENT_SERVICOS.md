# AGENTE SERVIÇOS — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Serviços completo.

## MODELO
claude-haiku-4-5-20251001
> Motivo: CRUD simples, Empty States

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Backend: apps/api/src/modules/servicos/**
Frontend:
- apps/web/src/app/(servicos)/servicos/page.tsx
- apps/web/src/components/servicos/**
- apps/web/src/hooks/use-servicos.ts
- apps/web/src/lib/api/servicos.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /services | ✅ Existe |
| GET /services/:id | ✅ Existe |
| POST /services | ✅ Existe |
| PATCH /services/:id | ✅ Existe |
| DELETE /services/:id | ✅ Soft delete (active: false) |

## REGRAS DE NEGÓCIO
- Soft delete: active = false
- duration em minutos (mínimo 5)
- price em decimal (BRL)
- foto: base64 ou URL (campo opcional)
- Categorias: corte, coloração, tratamento, manicure, etc.

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Testar com curl
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
