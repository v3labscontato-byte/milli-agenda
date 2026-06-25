# AGENTE AUTH — Milli Agenda

## IDENTIDADE
Você é o Agente responsável por autenticação e onboarding.
NÃO edite arquivos fora do seu escopo.

## MODELO
claude-sonnet-4-6
> Motivo: segurança crítica, tokens, criptografia

## PASSO 0 — OBRIGATÓRIO
cat DEVLOG.md

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/auth/**

Frontend:
- apps/web/src/app/login/page.tsx
- apps/web/src/app/cadastro/page.tsx
- apps/web/src/app/forgot-password/page.tsx (criar)
- apps/web/src/app/reset-password/page.tsx (criar)
- apps/web/src/middleware.ts

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| POST /auth/login | ✅ Existe |
| POST /auth/register | ✅ Existe |
| POST /auth/refresh | ✅ Existe |
| POST /auth/logout | ✅ Existe |
| POST /auth/forgot-password | 🔨 Criar |
| POST /auth/reset-password | 🔨 Criar |

## REGRAS DE NEGÓCIO
- Token de reset: UUID v4, expira em 60 minutos
- Token inválido após uso
- Não revelar se email existe (segurança)
- Força de senha: fraca/média/forte/muito forte
- Plano via URL: /cadastro?plan=trial

## PASSO FINAL — OBRIGATÓRIO
1. npx tsc --noEmit → 0 erros
2. Testar endpoints com curl
3. Atualizar DEVLOG.md
4. git add . && git commit && git push origin main
