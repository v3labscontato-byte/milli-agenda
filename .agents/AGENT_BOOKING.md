# AGENT_BOOKING — Milli Agenda

## IDENTIDADE
Agente especializado no App de Booking (cliente final) do Milli Agenda.
Modelo recomendado: claude-sonnet-4-6

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(booking)/ (todos)
- apps/web/src/components/booking/ (todos)

## ENDPOINTS DO MÓDULO
### Real (em uso)
- GET /api/v1/settings/public/:slug → info pública do salão (tenant, horários, pagamentos, políticas)
  - Hook: `apps/web/src/hooks/use-public-tenant.ts`
  - Slug: `process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'studio-homolog'`
- GET /api/v1/public/:slug/services → serviços disponíveis (sem JWT)
- GET /api/v1/public/:slug/professionals?serviceId= → profissionais por serviço (sem JWT)
- GET /api/v1/public/:slug/professionals/:id/slots?date=&durationMin= → slots disponíveis (sem JWT)
- POST /api/v1/public/:slug/appointments → criar agendamento (sem JWT, find-or-create client por phone)

### Endpoints Onda 4 (implementados)
- GET /api/v1/public/:slug/appointments?phone= → busca cliente + seus agendamentos por telefone (sem JWT)
- GET /api/v1/public/:slug/appointments/:id → detalhe de agendamento (sem JWT, valida tenantId)
- PATCH /api/v1/public/:slug/appointments/:id/cancel → cancela com validação posse por phone + política minHours

### A implementar (Fase 5)
- POST /api/v1/auth/client/login → auth de cliente (JWT separado ou magic link)
- GET/PATCH /api/v1/clients/me → perfil do cliente (requer auth de cliente)

### Cliente público (`apps/web/src/lib/api/public-booking.ts`)
- `TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'studio-homolog'`
- `fetchPublicServices(slug, categoryId?)`
- `fetchPublicProfessionals(slug, serviceId?)`
- `fetchPublicSlots(slug, proId, date, durationMin)` → retorna `{ startAt: string }[]`
- `createPublicAppointment(slug, { name, phone, email?, serviceId, professionalId, date, time, notes? })`
- `fetchPublicClientAppointments(slug, phone)` → `{ client: PublicClientInfo|null, appointments: PublicAppointmentItem[] }`
- `fetchPublicAppointmentById(slug, id)` → `PublicAppointmentItem`
- `cancelPublicAppointment(slug, id, phone)` → `{ id, status }`
- `slotToTimeStr(iso)` → usa `getUTCHours()/getUTCMinutes()` (backend armazena UTC)

### Backend — módulo público
- `apps/api/src/modules/public/` (controller, service, module, dto)
- Importa `ProfissionaisModule` (exporta `ProfissionaisService` para slots)
- Slots: delega a `ProfissionaisService.disponibilidade()`
- Fallback de slots: se sem `Schedule` records → usa `workDays`/`workStart`/`workEnd` do profissional (commit `69cb1ae`)

## ESTADO ATUAL DO MÓDULO
- /booking → home com dados REAIS do tenant (nome, endereço) via `usePublicTenant()`
- /booking/agendar → wizard 4 steps — **TOTALMENTE REAL** (serviços, profissionais, slots, criação de appointment)
  - Step 1: `fetchPublicServices` → serviços reais com categorias dinâmicas
  - Step 2: `fetchPublicProfessionals(serviceId)` → filtrado por serviço
  - Step 3: `fetchPublicSlots(proId, date, durationMin)` → slots reais; calendar desabilita dias fora de `workDays`
  - Step 4: `createPublicAppointment` → cria appointment + find-or-create client por phone
- /booking/meus-agendamentos → identificação por telefone + lista REAL de agendamentos; abas Próximos/Histórico; modal de cancelamento com política
  - Hook: `apps/web/src/hooks/use-booking-client.ts` (useState + sessionStorage)
  - Componente: `apps/web/src/components/booking/phone-identify.tsx`
- /booking/perfil → sem cliente → "Identificar-me"; com cliente → avatar iniciais, nome/tel reais, menu, "Sair"
- /booking/fidelidade → saldo, progressão, histórico — mock (fidelidade real requer migration)
- /booking/meus-dados → formulário de perfil — mock (backend requer auth de cliente)
- /booking/politicas → horários, pagamentos, sinal, cancelamento — dados REAIS via `usePublicTenant()`
- /booking/pacotes → pacotes mock
- /booking/afiliados → afiliados mock
- /booking/notificacoes → notificações mock
- /booking/login → login de cliente (mock)
- bottom-nav.tsx → nav mobile persistente

## VALIDAÇÃO PLAYWRIGHT — APROVADA ✅

### Onda 3 (2026-07-01) — Booking ponta a ponta
Fluxo: selecionar Escova → Arthur → 03/07 10:00 → dados → confirmar
- Step 1 (serviços reais): 11 serviços, 4 categorias ✅
- Step 2 (profissionais filtrados): 1 Arthur para Escova ✅
- Step 3 (slots reais): 19 slots em sexta, domingos disabled ✅
- Step 4 (confirmação): resumo correto ✅
- Step 5 (sucesso): "Agendamento confirmado!" ✅
- Banco: appointment `2026-07-03T10:00 | Escova | Arthur | Cliente Playwright Teste` ✅

### Onda 4 (2026-07-01) — Meus Agendamentos real
- PhoneIdentify sem cliente: form + mask + Google OAuth disabled ✅
- Busca telefone existente → lista real: "Próximos (1) · Escova · Arthur · R$ 70,00" ✅
- Modal cancelamento com política: "Cancelamento gratuito — Com mais de 48h" ✅
- Confirmar cancelamento: Próximos(0) vazio + Histórico(1) badge "Cancelado" ✅
- Telefone inexistente: "Nenhum agendamento encontrado para este telefone." ✅
- Perfil sem cliente: "Minha conta · Identificar-me" ✅
- Perfil com cliente real: avatar "VC", "Vilson Carneiro", menu, "Sair" ✅
- Botão sair da identificação: volta ao PhoneIdentify, limpa sessionStorage ✅

## PADRÕES DO MÓDULO
- Mobile-first: max-w-md centrado
- pb-[72px] para espaço do BottomNav
- Sem Sidebar global (layout próprio)
- BottomNav: Home, Agendar, Agenda, Perfil

## BACKLOG DO MÓDULO (Fase 5)
- [ ] Auth real de cliente (JWT separado ou magic link) — stub `findOrCreateClientByEmail` já existe no service
- [ ] Pagamento PIX integrado
- [ ] Push notifications
- [ ] Programa de fidelidade real
- [ ] Afiliados real
- [ ] Reagendamento (editar agendamento existente)

## PADRÃO CRÍTICO — useBookingClient
Hook usa useState (componente-local). NUNCA instanciar dentro de componentes filhos que precisam atualizar o pai.
Padrão correto: pai detém o hook → passa `onFound` callback → filho chama `onFound(clientInfo)` → pai chama `setClient()`.
PhoneIdentify NÃO usa `useBookingClient` diretamente por este motivo.

## REGRAS INVIOLÁVEIS
1. NUNCA editar dashboard, configurações ou outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add apps/web/src/app/(booking)/ apps/web/src/components/booking/ apps/web/src/hooks/use-public-tenant.ts DEVLOG.md .agents/AGENT_BOOKING.md
git commit -m "tipo(booking): desc"
