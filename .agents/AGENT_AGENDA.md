# AGENT_AGENDA — Módulo de Agenda

## Visão Geral
Módulo de agendamento multi-profissional com vista semana e dia.

## Componentes principais
- `apps/web/src/app/(dashboard)/agenda/page.tsx` — página principal
- `apps/web/src/components/agenda/weekly-overview.tsx` — vista semana
- `apps/web/src/components/agenda/day-timeline.tsx` — vista dia
- `apps/web/src/components/agenda/appointment-modal.tsx` — modal de agendamento
- `apps/web/src/components/agenda/novo-agendamento-modal.tsx` — criar agendamento
- `apps/web/src/components/agenda-table.tsx` — tabela Agenda de Hoje
- `apps/web/src/hooks/use-agenda.ts` — hook de dados
- `apps/web/src/lib/api/agenda.ts` — API client

## Funcionalidades implementadas

### Vista Semana
- Grade profissional × dia com disponibilidade (X agend. / Y livres)
- Dias passados em cinza
- "Folga" quando profissional não trabalha naquele dia (baseado em workDays)
- Tooltip hover com agenda do dia (horários livres em verde)
- Posicionamento inteligente do tooltip (não sai da tela)
- Clicar na célula → abre vista dia daquele profissional/dia
- Filtro de profissionais por pill (Todos / nome)

### Vista Dia
- Timeline com colunas por profissional (avatar + nome + cargo)
- Horários 08:00-20:00 em slots de 30min
- Cards coloridos por status:
  - Azul (#2563EB) = SCHEDULED
  - Verde (#16A34A) = CONFIRMED
  - Roxo (#7C3AED) = COMPLETED
  - Vermelho (#DC2626) = CANCELLED (visível, riscado, não bloqueia slot)
  - Cinza hachurado = BLOCKED (bloqueio de agenda)
- Ícone $ + badge (🟢 Pago / 🟡 Pgto pendente) em cada card
- Atendimentos simultâneos: cards lado a lado no mesmo slot
- Coluna de folga: fundo hachurado cinza com texto "Folga"
- Linha vermelha "agora" no horário atual (apenas hoje)
- Legenda no rodapé
- Shift+click em slot vazio → bloqueio de agenda com motivo
- Click em slot vazio → novo agendamento
- Click em card → AppointmentModal

### AppointmentModal
Status SCHEDULED: Reagendar | Confirmar | Cancelar
Status CONFIRMED: Reagendar | Finalizar | Cancelar
Status COMPLETED: Ver comanda (com botão Reabrir)

- Reagendar: pré-preenchido com dados atuais, horários disponíveis por escala
- Confirmar: PATCH status=CONFIRMED
- Cancelar: PATCH status=CANCELLED (mantém na lista)
- Finalizar: abre PaymentModal → cria comanda → registra pagamento → fecha comanda → PATCH COMPLETED

### Tabela "Agenda de Hoje"
Colunas: Data | Hora | Cliente | Serviço | Profissional | Pagamento | Valor | Atendimento | Agenda | Comanda
- Filtro por profissional (derivado dos agendamentos reais)
- Título dinâmico: "Agenda 28/06"
- Pagamento: Pago (verde) / Pendente (amarelo)
- Atendimento: Realizado / Confirmado / Pendente / Cancelado
- Botão Agenda → AppointmentModal
- Botão Comanda → PaymentModal (mesmo fluxo do Finalizar)
- Botão Reabrir dentro do PaymentModal (só para COMPLETED)

### Criar Agendamento
- Profissionais reais do sistema
- Serviços filtrados pelos habilitados para o profissional (enabledServices)
- Horários baseados na escala (workDays/workStart/workEnd)
- Slots livres excluindo agendamentos existentes e cancelados
- Duração e valor do serviço exibidos

## Padrões de dados

### CalendarAppointment
```ts
interface CalendarAppointment {
  id: string
  date: string        // 'YYYY-MM-DD'
  startTime: string   // 'HH:MM'
  endTime: string
  durationMinutes: number
  client: string
  service: string
  serviceId?: string
  professionalId: string
  clientId?: string
  commandId?: string
  amount: number
  status: AppointmentStatus
}
```

### transformApiResponse (use-agenda.ts)
- `startAt` → `date` (slice 0-10) + `startTime` (UTC hours)
- `service.price` → `amount`
- `client.name` → `client`
- `service.name` → `service`

## Rotas do backend
- GET /appointments?from=&to=&professionalId=
- POST /appointments { clientName, clientPhone, serviceId, professionalId, date, startTime, durationMin }
- PATCH /appointments/:id { status, professionalId, serviceId, date, startTime, cancelReason }
- POST /commands { clientId }
- POST /payments { commandId, method, amount }
- POST /commands/:id/close
- GET /professionals
- GET /services

## Regras importantes
- CANCELLED não bloqueia slot para novos agendamentos
- workDays: [0=Dom, 1=Seg, ..., 6=Sáb]
- Atendimentos simultâneos: permitidos (futuro: toggle por profissional em Configurações)
- NEXT_PUBLIC_USE_REAL_API=true no frontend Railway
- Nunca usar FEATURES.real* guards neste módulo

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## REGRAS INVIOLÁVEIS
1. NUNCA editar schema.prisma ou arquivos de outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md após concluir
4. Push apenas para homolog — nunca direto para main

## BACKLOG
- [ ] Vista mês
- [ ] WebSocket para atualização em tempo real
- [ ] Arrastar e soltar para remarcar
