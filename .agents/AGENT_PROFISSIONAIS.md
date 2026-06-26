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
✅ Lista com cards, filtros e KPIs inline (useMemo sobre dados reais)
✅ Smart Form 4 steps (Dados, Cargo/Escala, Serviços, Comissão) — envia workDays/workStart/workEnd
✅ Modal com abas Perfil | Desempenho | Comissão (aba Agenda removida)
✅ TabPerfil: edição inline de Dados, Especialidade (select de roles), Comissão, CPF, Nascimento, Vínculo, Horário
✅ Tabela de horários por dia (Seg–Dom) com modo edição inline
✅ Toggle status: PATCH active com UI otimista (sem refetch, sem reset de aba)
✅ Excluir: DELETE real (hard delete) — botão Trash com confirmação modal
✅ onUpdate?: callback para refetch + atualizar `selected` após salvar no modal
✅ toFrontend() mapper completo em use-profissionais.ts
✅ RoleBadge / StatusBadge com fallback para valores desconhecidos
✅ getSpecialtyColors() nunca crasha com specialty null/undefined
✅ Impeccable audit 20/20 (CSS vars, a11y, responsive)

## CAMPOS NO BANCO (Professional)
```
name, email?, phone?, specialty?, avatarUrl?
commissionPct Decimal? | active Boolean | userId? @unique
workDays Int[] @default([]) | workStart String? @default("08:00") | workEnd String? @default("18:00")
cpf String? | birthDate String? | vinculo String?
enabledServices String[] @default([])  ← IDs dos serviços habilitados para este profissional
```
⚠️ SQL pendente no Railway Console (se não rodado ainda):
```sql
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workDays" INTEGER[] DEFAULT '{}';
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workStart" TEXT DEFAULT '08:00';
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workEnd" TEXT DEFAULT '18:00';
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "vinculo" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "enabledServices" TEXT[] DEFAULT '{}';
```

## PADRÕES CRÍTICOS DO MÓDULO
- commissionPct: Decimal no Prisma → vem como string da API → SEMPRE Number(p.commissionPct ?? 0)
- rating: pode ser null → SEMPRE Number(p.rating ?? 0).toFixed(1)
- revenueThisMonth: campo calculado (não no banco) → Number(p.revenueThisMonth ?? 0)
- ROLE_STYLES: apenas 7 roles hardcoded → sempre usar fallback ?? { bg: '#F1F5F9', text: '#475569' }
- specialty: pode ser null → getSpecialtyColors(p.specialty) nunca crasha
- toFrontend(): mapper obrigatório em use-profissionais.ts — backend retorna active:boolean, frontend espera status:'active'|'inactive'
- toggleStatus: UI otimista via setData (filter/map imediato) — NUNCA chama refetch (causaria reset de aba)
- onUpdate: chamado após PATCH de dados pessoais/horário/especialidade/comissão → faz refetch + atualiza selected
- GET /professionals: retorna TODOS (ativos e inativos) — filtro fica no frontend

## BACKLOG DO MÓDULO
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
