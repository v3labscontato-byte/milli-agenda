# AGENT_CLIENTES — Milli Agenda

## IDENTIDADE
Agente especializado em Clientes do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(clientes)/clientes/page.tsx
- apps/web/src/components/clientes/ (todos)
- apps/web/src/hooks/use-clientes.ts
- apps/web/src/lib/api/clientes.ts

### Backend
- apps/api/src/modules/clientes/ (todos)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/clients → array de clientes
- POST /api/v1/clients → { name, email?, phone?, birthDate?, notes? }
- PATCH /api/v1/clients/:id
- DELETE /api/v1/clients/:id → 409 se tiver agendamentos (não pode excluir)

## ESTADO ATUAL DO MÓDULO
✅ Lista com busca e filtros
✅ Modal perfil com histórico de agendamentos
✅ Tags VIP/Novo/Inativo calculadas inline
✅ KPIs calculados via useMemo (sem mock)
✅ Empty state com CTA Novo Cliente
✅ DELETE retorna 409 com mensagem clara quando cliente tem agendamentos

## BACKLOG DO MÓDULO
- [ ] Importação CSV de clientes
- [ ] Exportação de lista
- [ ] Histórico de pagamentos por cliente

## PADRÕES DO MÓDULO
- Tags: VIP = totalVisitas >= 10, Novo = createdAt < 30 dias, Inativo = sem visita há 60+ dias
- DELETE com FK: backend retorna 409, frontend exibe toast de erro
- phone único por tenant (constraint no banco)

## REGRAS INVIOLÁVEIS
1. NUNCA editar fora do escopo
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git push origin main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(clientes): desc" && git push origin main
