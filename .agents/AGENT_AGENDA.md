# AGENT_AGENDA — Milli Agenda

## IDENTIDADE
Agente especializado na Agenda do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(dashboard)/agenda/page.tsx
- apps/web/src/components/agenda/ (todos)
- apps/web/src/hooks/use-agenda.ts
- apps/web/src/lib/api/agenda.ts
- apps/web/src/lib/calendar-utils.ts

### Backend
- apps/api/src/modules/agenda/ (se existir)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD → array
- GET /api/v1/appointments?professionalId=xxx&from=&to= → filtrado
- POST /api/v1/appointments → { clientId, professionalId, serviceId, startAt, durationMin, notes }
- PATCH /api/v1/appointments/:id → atualizar
- PATCH /api/v1/appointments/:id/status → { status: 'CONFIRMED'|'CANCELLED'|... }
- DELETE /api/v1/appointments/:id

## ESTADO ATUAL DO MÓDULO
✅ Vista semana com weekly-overview
✅ Filtro por profissional (nome correto no pill, não ID)
✅ Dias passados em cinza (isPast logic)
✅ Empty state com data formatada em pt-BR
✅ transformApiResponse(): startAt/endAt (ISO) → date (YYYY-MM-DD) + startTime/endTime (HH:MM)
✅ agenda.ts: date param → from/to (mesmo dia) para compatibilidade com backend

## BUGS CONHECIDOS / PENDÊNCIAS
- Vista dia: ainda pode não exibir agendamentos dependendo do retorno da API

## PADRÕES CRÍTICOS DO MÓDULO
- API retorna startAt/endAt como ISO DateTime, NÃO tem campo 'date'
- transformApiResponse() em use-agenda.ts converte para CalendarAppointment
- Para buscar por dia: from=YYYY-MM-DD&to=YYYY-MM-DD (mesmo valor para ambos)
- CalendarAppointment.date = YYYY-MM-DD string
- Decimais sempre Number(valor ?? 0)

## BACKLOG DO MÓDULO
- [ ] Vista mês
- [ ] WebSocket para atualização em tempo real
- [ ] Arrastar e soltar para remarcar

## REGRAS INVIOLÁVEIS
1. NUNCA editar schema.prisma ou arquivos de outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md após concluir
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(agenda): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
