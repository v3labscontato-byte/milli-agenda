# AGENT_AUTH — Milli Agenda

## IDENTIDADE
Agente especializado em autenticação e onboarding do Milli Agenda.
Modelo recomendado: claude-sonnet-4-6

## PRIMEIRA AÇÃO OBRIGATÓRIA
Leia o DEVLOG antes de qualquer tarefa:
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/login/page.tsx
- apps/web/src/app/cadastro/page.tsx
- apps/web/src/app/onboarding/page.tsx
- apps/web/src/middleware.ts
- apps/web/src/lib/api/auth.ts
- apps/web/src/lib/password-strength.ts

### Backend
- apps/api/src/modules/auth/ (todos os arquivos)

## ENDPOINTS DO MEU MÓDULO
Base: process.env.NEXT_PUBLIC_API_URL + /api/v1

- POST /auth/login → { accessToken, refreshToken, user, tenant }
- POST /auth/register → { accessToken, refreshToken, user, tenant }
- POST /auth/refresh → { accessToken, refreshToken }
- GET /auth/onboarding → { completed, nichoSlug, step }
- POST /auth/onboarding/nicho → { success }
- POST /auth/onboarding/complete → { success }

## ESTADO ATUAL DO MÓDULO
✅ Login sem campo slug (detectado automaticamente por email)
✅ Cadastro wizard 3 etapas (Salão → Responsável → Plano)
✅ Onboarding 5 steps pós-cadastro (Revisão, Segmento, Serviços, Horários, Concluído)
✅ Middleware redireciona /login→/dashboard ou /dashboard→/login conforme token
✅ forgot-password e reset-password com força de senha
✅ Plano pré-selecionado via ?plan= no cadastro

## BACKLOG DO MÓDULO
- [ ] Email real para forgot-password (precisa SMTP/SendGrid)
- [ ] Refresh token automático antes de expirar (interceptor no client.ts)
- [ ] Rate limiting no backend para /auth/login

## PADRÕES DO MÓDULO
- JWT armazenado em localStorage com chave 'milli_token' e 'milli_refresh'
- Tenant detectado automaticamente pelo email no login (sem campo slug)
- Middleware.ts usa matcher para proteger rotas /dashboard, /agenda, etc.
- onboardingCompleted: boolean no Tenant model controla redirect pós-login

## REGRAS INVIOLÁVEIS
1. NUNCA editar arquivos fora do meu escopo
2. SEMPRE npx tsc --noEmit → 0 erros antes de commitar
3. SEMPRE atualizar DEVLOG.md com >> após concluir
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main após commitar

## PASSO FINAL OBRIGATÓRIO
Após concluir qualquer tarefa:
1. npx tsc --noEmit → deve ser 0 erros
2. Append ao DEVLOG com >> (nunca sobrescrever)
3. git add [arquivos editados] DEVLOG.md
4. git commit -m "tipo(auth): descrição"
5. git checkout homolog && git merge main && git push origin homolog && git checkout main
