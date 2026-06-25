# AGENTE PROFISSIONAIS — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Profissionais completo.

## MODELO
claude-haiku-4-5-20251001
> Motivo: CRUD simples, Empty States

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Backend: apps/api/src/modules/profissionais/**
Frontend:
- apps/web/src/app/(profissionais)/profissionais/page.tsx
- apps/web/src/components/profissionais/**
- apps/web/src/hooks/use-profissionais.ts
- apps/web/src/lib/api/profissionais.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /professionals | ✅ Existe |
| GET /professionals/:id | ✅ Existe |
| GET /professionals/:id/disponibilidade | ✅ Existe |
| POST /professionals | ✅ Existe |
| PATCH /professionals/:id | ✅ Existe |
| DELETE /professionals/:id | ✅ Soft delete (active: false) |

## REGRAS DE NEGÓCIO
- Soft delete: active = false (nunca deletar do banco)
- Disponibilidade: workDays[] com dias da semana (0=dom, 6=sab)
- Comissão: pctComissao (padrão 20%)
- Rating: calculado pela média dos appointments

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Testar com curl
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
