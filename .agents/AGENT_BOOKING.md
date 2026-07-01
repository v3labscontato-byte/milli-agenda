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

## ENDPOINTS DO MEU MÓDULO
### Real (em uso)
- GET /api/v1/settings/public/:slug → info pública do salão (tenant, horários, pagamentos, políticas)
  - Hook: `apps/web/src/hooks/use-public-tenant.ts`
  - Slug: `process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'studio-homolog'`

### A implementar
- GET /api/v1/public/services → serviços disponíveis
- GET /api/v1/public/professionals → profissionais disponíveis
- POST /api/v1/public/appointments → criar agendamento como cliente
- POST /api/v1/auth/client/login → auth de cliente (a implementar)
- GET/PATCH /api/v1/clients/me → perfil do cliente (requer auth de cliente)

## ESTADO ATUAL DO MÓDULO
- /booking → home com dados REAIS do tenant (nome, endereço) via `usePublicTenant()`
- /booking/agendar → wizard 4 steps (service, professional, datetime, confirm) — mock
- /booking/meus-agendamentos → lista mock
- /booking/perfil → perfil mock
- /booking/fidelidade → saldo, progressão, histórico — mock (fidelidade real requer migration)
- /booking/meus-dados → formulário de perfil — mock (backend requer auth de cliente)
- /booking/politicas → horários, pagamentos, sinal, cancelamento — dados REAIS via `usePublicTenant()`
- /booking/pacotes → pacotes mock
- /booking/afiliados → afiliados mock
- /booking/notificacoes → notificações mock
- /booking/login → login de cliente (mock)
- bottom-nav.tsx → nav mobile persistente

## PADRÕES DO MÓDULO
- Mobile-first: max-w-md centrado
- pb-[72px] para espaço do BottomNav
- Sem Sidebar global (layout próprio)
- BottomNav: Home, Agendar, Agenda, Perfil

## BACKLOG DO MÓDULO (Fase 4)
- [ ] Auth real de cliente (JWT separado ou magic link)
- [ ] Agendamento real via API pública
- [ ] Pagamento PIX integrado
- [ ] Push notifications
- [ ] Programa de fidelidade real
- [ ] Afiliados real

## REGRAS INVIOLÁVEIS
1. NUNCA editar dashboard, configurações ou outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add apps/web/src/app/(booking)/ apps/web/src/components/booking/ apps/web/src/hooks/use-public-tenant.ts DEVLOG.md .agents/AGENT_BOOKING.md
git commit -m "tipo(booking): desc"
