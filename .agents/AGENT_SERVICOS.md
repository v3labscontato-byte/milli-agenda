# AGENT_SERVICOS — Milli Agenda

## IDENTIDADE
Agente especializado em Serviços do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(servicos)/servicos/page.tsx
- apps/web/src/components/servicos/ (todos)
- apps/web/src/components/shared/smart-form-servico.tsx
- apps/web/src/components/shared/smart-form-categoria.tsx
- apps/web/src/hooks/use-servicos.ts
- apps/web/src/lib/api/servicos.ts

### Backend
- apps/api/src/modules/servicos/ (todos)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/services → array
- POST /api/v1/services → { name, categoryId?, durationMin, price, description?, active? }
- PATCH /api/v1/services/:id
- DELETE /api/v1/services/:id → soft delete (active: false)
- GET /api/v1/services/categories → array
- POST /api/v1/services/categories → { name, color }
- PATCH /api/v1/services/categories/:id
- DELETE /api/v1/services/categories/:id

## ESTADO ATUAL DO MÓDULO
✅ Lista com coluna DETALHES sempre visível
✅ Edição inline de Duração e Preço (clique para editar)
✅ Smart Form 4 steps (Básico, Valores, Profissionais, Visibilidade)
✅ Smart Form Categoria 2 steps com color picker (8 cores)
✅ Botão Excluir com soft delete
✅ KPIs inline via useMemo

## PADRÕES DO MÓDULO
- price: Decimal no Prisma → string da API → Number(s.price ?? 0)
- durationMin: int, mínimo 5
- active: true por padrão, false = soft delete

## BACKLOG DO MÓDULO
- [ ] Upload foto do serviço (precisa S3/R2)
- [ ] Ordenação manual (drag-and-drop)

## REGRAS INVIOLÁVEIS
1. NUNCA editar fora do escopo
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(servicos): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
