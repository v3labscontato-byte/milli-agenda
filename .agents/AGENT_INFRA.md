# AGENT_INFRA — Milli Agenda

## IDENTIDADE
Agente especializado em Infraestrutura e Schema do Milli Agenda.
Modelo recomendado: claude-sonnet-4-6

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Schema & Migrations
- packages/database/prisma/schema.prisma ← ÚNICO AGENTE QUE PODE EDITAR
- packages/database/prisma/migrations/ (criar novas migrations)
- packages/database/prisma/seed.ts

### Backend Core
- apps/api/src/app.module.ts
- apps/api/src/modules/template-engine/ (todos)
- apps/api/nixpacks.toml

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/templates → lista de nichos disponíveis
- GET /api/v1/templates/:slug → detalhes do nicho
- POST /api/v1/templates/:slug/import → importar template para o tenant

## ESTADO ATUAL DO MÓDULO
✅ Schema com 16+ models (Tenant, User, Professional, Service, Client, Appointment, Command, Payment, Schedule, etc.)
✅ Model Goal adicionado (migration 20260625030000_add_goals)
✅ 4 nichos seedados: salao-de-beleza, barbearia, clinica-estetica, outros
✅ Template Engine: GET /templates, GET /templates/:slug, POST /templates/:slug/import
✅ Railway auto-deploy de main

## PADRÕES CRÍTICOS
- Migrations: criar em packages/database/prisma/migrations/YYYYMMDDHHMMSS_nome/migration.sql
- Railway roda `npx prisma migrate deploy` no startup — NÃO usar migrate dev em produção
- binaryTargets: ["native", "linux-musl-openssl-3.0.x"] no schema (Railway usa Linux)
- Decimal fields: sempre @db.Decimal(10,2) ou @db.Decimal(12,2)
- Tenant isolation: todos os models têm tenantId + @index([tenantId])
- onDelete: Cascade em todas as relações com Tenant

## MODELS EXISTENTES
Tenant, User, Role, Permission, RolePermission, UserRoleAssignment,
Professional, Service, Client, Appointment, Command, CommandItem,
Payment, Schedule, Notification, ApiKey, AuditLog, PasswordResetToken,
NichoTemplate, NichoTemplateRole, NichoTemplateCategory, NichoTemplateService,
ProfessionalRole, ServiceCategory, Goal

## BACKLOG DO MÓDULO
- [ ] Model Expense (despesas)
- [ ] Upload S3/R2 (avatarUrl, logoUrl reais)
- [ ] WebSocket gateway
- [ ] Rate limiting global

## REGRAS INVIOLÁVEIS
1. NUNCA fazer migrate reset ou drop em produção
2. SEMPRE criar migration manual (SQL puro) para mudanças de schema
3. SEMPRE npx tsc --noEmit → 0 erros
4. SEMPRE >> DEVLOG.md
5. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros (ou npx tsc -p apps/api/tsconfig.json --noEmit)
git add [arquivos] DEVLOG.md && git commit -m "tipo(infra): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
