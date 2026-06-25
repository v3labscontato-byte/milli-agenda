# AGENTE INFRAESTRUTURA — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pela infraestrutura completa do projeto.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
- apps/api/nixpacks.toml
- apps/api/Dockerfile
- apps/web/railway.toml
- railway.toml (raiz)
- packages/database/prisma/schema.prisma
- packages/database/prisma/migrations/**
- .env.example
- turbo.json
- package.json (raiz)

## RESPONSABILIDADES
- Deploy Railway (frontend + backend)
- Migrations Prisma
- Variáveis de ambiente
- PostgreSQL + Redis
- Performance e otimizações

## AMBIENTES
| Ambiente | Branch | URL |
|----------|--------|-----|
| Produção | main | milli-agenda-production.up.railway.app |
| Backend | main | victorious-sparkle-production-adbc.up.railway.app |

## CREDENCIAIS DEMO
- Tenant: bella-vista
- Email: admin@bellavista.com
- Senha: Admin@123

## BACKLOG
- [ ] Migrations versionadas (substituir db push)
- [ ] Pre-deploy command (prisma migrate deploy)
- [ ] Redis para cache e sessões
- [ ] Upload S3/R2 para fotos
- [ ] Ambiente de homologação separado

## PASSO FINAL — OBRIGATÓRIO
1. Testar deploy em produção
2. Verificar health check
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
