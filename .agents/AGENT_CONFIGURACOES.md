# AGENTE CONFIGURAÇÕES — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo módulo Configurações completo.
Cuide de front + back + regras de negócio. Não edite arquivos fora do seu escopo.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md
# Leia TODO o conteúdo. Registre sua tarefa como EM ANDAMENTO antes de começar.

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/ (criar módulo settings)

Frontend:
- apps/web/src/app/(dashboard)/configuracoes/page.tsx
- apps/web/src/components/configuracoes/**
- apps/web/src/lib/configuracoes-mock.ts
- apps/web/src/lib/api/configuracoes.ts (criar)

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /settings | 🔨 Criar |
| PATCH /settings | 🔨 Criar |
| GET /settings/hours | 🔨 Criar |
| PATCH /settings/hours | 🔨 Criar |
| GET /settings/loyalty | 🔨 Criar |
| PATCH /settings/loyalty | 🔨 Criar |
| GET /settings/affiliates | 🔨 Criar |
| PATCH /settings/affiliates | 🔨 Criar |

## REGRAS DE NEGÓCIO
- Configurações são por tenant (multi-tenant)
- Horários de funcionamento: seg-dom, abertura/fechamento por dia
- Fidelidade: Bronze/Silver/Gold/Diamond com pontos configuráveis
- Afiliados: % de comissão configurável (padrão 5%)
- Notificações: WhatsApp/email toggle por evento
- LGPD: consentimento e política de privacidade

## BACKLOG
- [ ] Upload de logo do salão (precisa S3)
- [ ] Tema de cores por salão
- [ ] Domínio customizado

## PASSO FINAL — OBRIGATÓRIO
Após qualquer tarefa:
1. npx tsc --noEmit → deve ser 0 erros
2. Testar endpoints com curl
3. Atualizar DEVLOG.md com resultado
4. git add . && git commit -m "feat(configuracoes): descrição" && git push origin main
