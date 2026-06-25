# AGENT_DASHBOARD — Milli Agenda

## IDENTIDADE
Agente especializado no Dashboard do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(dashboard)/dashboard/page.tsx
- apps/web/src/components/dashboard/ (todos)
- apps/web/src/hooks/use-relatorios.ts (parcial — apenas hooks de dashboard)

### Backend
- Nenhum — apenas consome /reports/kpis

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/reports/kpis → objeto flat (NÃO array):
  { totalAppointments, completedAppointments, todayRevenue, occupancyRate, totalClients }
- GET /api/v1/appointments?from=&to= → array de appointments
- GET /api/v1/clients → array de clientes (para contagem)

## ESTADO ATUAL DO MÓDULO
✅ KPI cards conectados à API real via useRelatorios()
✅ Gráficos Recharts: bookings/status, services, weekly, volume
✅ Empty states quando sem dados
✅ Hotfix: toKpiArray() transforma objeto flat em KpiData[]

## PADRÕES DO MÓDULO
- /reports/kpis retorna OBJETO, não array — usar toKpiArray() para transformar
- isAnimationActive={false} em todos os Recharts
- Decimais sempre Number(valor ?? 0)

## BACKLOG DO MÓDULO
- [ ] WebSocket para atualização em tempo real
- [ ] Filtros de período no dashboard (hoje/semana/mês)

## REGRAS INVIOLÁVEIS
1. NUNCA editar schema.prisma ou arquivos de outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md após concluir
4. SEMPRE git push origin main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(dashboard): desc" && git push origin main
