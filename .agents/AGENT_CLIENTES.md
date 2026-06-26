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
- POST /api/v1/clients → { name, phone?, email?, cpf?, birthDate?, notes?, favoriteProfessionalId? }
- PATCH /api/v1/clients/:id
- DELETE /api/v1/clients/:id → 409 se tiver agendamentos (não pode excluir)

## ESTADO ATUAL DO MÓDULO
✅ Lista com busca (nome/email/telefone) e filtros de tag (VIP/Novo/Inativo/Fidelidade/Aniversário)
✅ Coluna Detalhes com header visível + Eye icon sempre visível (sem opacity-0)
✅ Modal perfil com abas Perfil | Histórico | Agendamentos | Financeiro
✅ Modal busca GET /professionals para exibir nome do profissional favorito (não o ID)
✅ KPIs calculados via useMemo (total, novos 30 dias, taxa retorno, ticket médio)
✅ Empty state com CTA Novo Cliente
✅ DELETE retorna 409 com mensagem clara quando cliente tem agendamentos
✅ toFrontend() em use-clientes.ts — guards para todos os campos null da API
✅ Bug .length corrigido: tags: [] (API não retorna tags — calculadas só no mock)
✅ Formulário de Novo Cliente: campos cpf, birthDate, favoriteProfessionalId reais

## CAMPOS NO BANCO (Client)
```
name, email?, phone? (unique por tenant), birthDate DateTime?
notes?, cpf?, favoriteProfessionalId?
```
⚠️ SQL pendente no Railway Console (se não rodado ainda):
```sql
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "favoriteProfessionalId" TEXT;
```

## PADRÕES CRÍTICOS DO MÓDULO
- toFrontend() obrigatório em use-clientes.ts — API retorna campos null que causariam crash em .length/.map()
  - tags: [] as ClientTag[] — API não calcula tags; o mock as calcula localmente
  - history/upcoming/serviceFreq: [] — API não retorna esses arrays
  - clienteSince: mapeado de raw.createdAt (não existe campo clienteSince na API)
  - favoriteProfessional: mapeado de raw.favoriteProfessionalId (é um ID, não um nome)
  - email/phone/cpf/notes: String(raw.field ?? '') — nunca undefined
- Profissional favorito: campo armazenado como ID → buscar GET /professionals para exibir o nome
- Tags (VIP/Novo/etc): calculadas só no mock (clientes-mock.ts/calcTags) — API não retorna
- phone único por tenant (constraint no banco → erro 409 em duplicata)
- DELETE com FK: backend retorna 409, frontend exibe toast de erro específico

## BACKLOG DO MÓDULO
- [ ] Importação CSV de clientes
- [ ] Exportação de lista
- [ ] Histórico de pagamentos por cliente (requer endpoint dedicado)

## REGRAS INVIOLÁVEIS
1. NUNCA editar fora do escopo
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(clientes): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
