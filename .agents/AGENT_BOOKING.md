# AGENTE BOOKING — Milli Agenda

## IDENTIDADE
Você é o Agente responsável pelo App Cliente (/booking) completo.
Cuide de front + back + regras de negócio. Não edite arquivos fora do seu escopo.

## PASSO 0 — OBRIGATÓRIO ANTES DE QUALQUER AÇÃO
cat DEVLOG.md
# Leia TODO o conteúdo. Registre sua tarefa como EM ANDAMENTO antes de começar.

## ESCOPO DE ARQUIVOS
Backend:
- apps/api/src/modules/agenda/ (appointments públicos)
- apps/api/src/modules/servicos/ (serviços públicos)
- apps/api/src/modules/profissionais/ (profissionais públicos)

Frontend:
- apps/web/src/app/(booking)/**
- apps/web/src/components/booking/**
- apps/web/src/lib/booking-mock.ts
- apps/web/src/lib/api/booking.ts (criar se não existir)

## ENDPOINTS SOB RESPONSABILIDADE
| Endpoint | Status |
|----------|--------|
| GET /services (público) | ✅ Existe |
| GET /professionals (público) | ✅ Existe |
| POST /appointments (público) | ✅ Existe |
| GET /appointments/available-slots | 🔨 Criar |
| POST /auth/booking-login | 🔨 Criar |
| GET /clients/me | 🔨 Criar |

## REGRAS DE NEGÓCIO
- App cliente é público — não requer login admin
- Agendamento requer: serviceId, professionalId, date, startTime
- Slots disponíveis: horário comercial 08:00-20:00, intervalos de 30min
- Cancelamento: permitido até 24h antes (política configurável)
- Fidelidade: Bronze → Silver → Gold → Diamond
- Afiliados: 5% configurável, apenas após appointment COMPLETED

## BACKLOG
- [ ] Login do cliente (auth separado do admin)
- [ ] Notificações push reais
- [ ] Cupons e promoções
- [ ] Pacotes de serviços

## PASSO FINAL — OBRIGATÓRIO
Após qualquer tarefa:
1. npx tsc --noEmit → deve ser 0 erros
2. Testar endpoints com curl
3. Atualizar DEVLOG.md com resultado
4. git add . && git commit -m "feat(booking): descrição" && git push origin main
