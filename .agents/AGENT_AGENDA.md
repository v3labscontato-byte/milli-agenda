# AGENTE AGENDA — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Agenda completo.
Cuide de front + back + regras de negócio. Não edite arquivos fora do seu escopo.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md
# Leia TODO o conteúdo. Registre sua tarefa como EM ANDAMENTO antes de começar.

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/agenda/**

Frontend:
- apps/web/src/app/(dashboard)/agenda/page.tsx
- apps/web/src/components/agenda/**
- apps/web/src/hooks/use-agenda.ts
- apps/web/src/lib/api/agenda.ts
- apps/web/src/lib/agenda-mock.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /appointments | ✅ Existe |
| GET /appointments/:id | ✅ Existe |
| POST /appointments | ✅ Existe |
| PATCH /appointments/:id | ✅ Existe |
| PATCH /appointments/:id/status | ✅ Existe |
| DELETE /appointments/:id | ✅ Existe |
| GET /professionals/:id/disponibilidade | ✅ Existe |

## REGRAS DE NEGÓCIO
- Status: SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED
- POST /appointments usa durationMin (int, mínimo 5), NÃO endAt
- endAt é calculado pelo service: startAt + durationMin
- Visão semana: domingo a sábado
- Visão dia: horário comercial 08:00-20:00
- Filtro por profissional disponível

## BACKLOG
- [ ] WebSocket para agenda em tempo real
- [ ] Slots disponíveis por profissional
- [ ] Reagendamento com validação de conflito

## PASSO FINAL — OBRIGATÓRIO
Após qualquer tarefa:
1. npx tsc --noEmit → deve ser 0 erros
2. Testar endpoints com curl
3. Atualizar DEVLOG.md com resultado
4. git add . && git commit -m "feat(agenda): descrição" && git push origin main
