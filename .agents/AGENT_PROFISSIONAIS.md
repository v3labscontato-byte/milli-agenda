# AGENT_PROFISSIONAIS — Milli Agenda

## IDENTIDADE
Agente especializado em Profissionais do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(profissionais)/profissionais/page.tsx
- apps/web/src/components/profissionais/ (todos)
- apps/web/src/components/shared/smart-form-profissional.tsx
- apps/web/src/hooks/use-profissionais.ts
- apps/web/src/lib/api/profissionais.ts

### Backend
- apps/api/src/modules/profissionais/ (todos)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/professionals → array
- POST /api/v1/professionals → { name, email?, phone?, specialty?, commissionPct?, userId? }
- PATCH /api/v1/professionals/:id
- DELETE /api/v1/professionals/:id → soft delete (active: false)
- GET /api/v1/professionals/roles → roles do tenant
- POST /api/v1/professionals/roles
- PATCH /api/v1/professionals/roles/:id
- DELETE /api/v1/professionals/roles/:id

## ESTADO ATUAL DO MÓDULO
✅ Lista com cards e filtros
✅ Smart Form 4 steps (Dados, Cargo/Escala, Serviços, Comissão)
✅ RoleBadge com fallback para role desconhecida (string | null | undefined)
✅ StatusBadge com fallback para status desconhecido
✅ specialty null tratado em SPECIALTY_COLORS via getSpecialtyColors()
✅ Number() em todos os cálculos de KPI (revenueThisMonth, rating, commissionPct)

## PADRÕES CRÍTICOS DO MÓDULO
- commissionPct: Decimal no Prisma → vem como string da API → SEMPRE Number(p.commissionPct ?? 0)
- rating: pode ser null → SEMPRE Number(p.rating ?? 0).toFixed(1)
- revenueThisMonth: pode ser undefined (campo calculado, não no banco) → Number(p.revenueThisMonth ?? 0)
- ROLE_STYLES: apenas 7 roles hardcoded → sempre usar fallback ?? { bg: '#F1F5F9', text: '#475569' }
- specialty: pode ser null do banco → getSpecialtyColors(p.specialty) nunca crasha

## BACKLOG DO MÓDULO
- [ ] Escala de trabalho (horários por dia da semana)
- [ ] Foto do profissional (upload S3/R2)
- [ ] Relatório individual de comissões

## REGRAS INVIOLÁVEIS
1. NUNCA editar fora do escopo
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(profissionais): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
