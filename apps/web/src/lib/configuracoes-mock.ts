// ─── Types ────────────────────────────────────────────────────────────────────

export interface SalonInfo {
  name: string
  phone: string
  email: string
  cnpj: string
  address: string
  neighborhood: string
  cep: string
  city: string
  state: string
  timezone: string
  currency: string
  instagram: string
  whatsapp: string
  logoUrl: string | null
}

export interface DaySchedule {
  day: string
  dayLabel: string
  open: boolean
  start: string
  end: string
}

export interface LunchBreak {
  active: boolean
  start: string
  end: string
}

export interface BusinessHours {
  days: DaySchedule[]
  lunchBreak: LunchBreak
  minAdvanceHours: number
  maxAdvanceDays: number
  slotGapMinutes: number
}

export type NotifChannel = 'email' | 'whatsapp' | 'system'
export type NotifEvent =
  | 'novo_agendamento'
  | 'cancelamento'
  | 'reagendamento'
  | 'confirmacao'
  | 'lembrete_24h'
  | 'lembrete_2h'
  | 'pagamento'
  | 'noshow'

export interface NotifPrefs {
  matrix: Record<NotifEvent, Record<NotifChannel, boolean>>
  whatsappConnected: boolean
  whatsappNumber: string
  emailSender: string
}

export interface PaymentConfig {
  pix: boolean
  pixKey: string
  cash: boolean
  debit: boolean
  credit: boolean
  creditMaxInstallments: number
  voucher: boolean
  transfer: boolean
  requireDeposit: boolean
  depositPercent: number
  freeCancelHours: number
  lateCancelFeePercent: number
}

export interface BookingSiteConfig {
  slug: string
  customDomain: string
  primaryColor: string
  description: string
  showPrices: boolean
  showProfessionals: boolean
  allowProfessionalChoice: boolean
}

export type PlanTier = 'starter' | 'growth' | 'business'

export interface PlanInfo {
  tier: PlanTier
  price: number
  nextBillingDate: string
  professionalsUsed: number
  professionalsLimit: number
}

export interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  lastDelivery: string
}

export interface LgpdLog {
  id: string
  date: string
  time: string
  action: string
  subject: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

export const MOCK_SALON_INFO: SalonInfo = {
  name: 'Salão Bella Vista',
  phone: '(11) 99999-9999',
  email: 'contato@bellavista.com',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Flores, 123',
  neighborhood: 'Jardins',
  cep: '01234-567',
  city: 'São Paulo',
  state: 'SP',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  instagram: '@bellavistasalao',
  whatsapp: '(11) 99999-9999',
  logoUrl: null,
}

export const MOCK_BUSINESS_HOURS: BusinessHours = {
  days: [
    { day: 'mon', dayLabel: 'Segunda',  open: true,  start: '08:00', end: '18:00' },
    { day: 'tue', dayLabel: 'Terça',    open: true,  start: '08:00', end: '18:00' },
    { day: 'wed', dayLabel: 'Quarta',   open: true,  start: '08:00', end: '18:00' },
    { day: 'thu', dayLabel: 'Quinta',   open: true,  start: '08:00', end: '18:00' },
    { day: 'fri', dayLabel: 'Sexta',    open: true,  start: '08:00', end: '20:00' },
    { day: 'sat', dayLabel: 'Sábado',   open: true,  start: '09:00', end: '17:00' },
    { day: 'sun', dayLabel: 'Domingo',  open: false, start: '09:00', end: '17:00' },
  ],
  lunchBreak: { active: true, start: '12:00', end: '13:00' },
  minAdvanceHours: 1,
  maxAdvanceDays: 60,
  slotGapMinutes: 0,
}

export const MOCK_NOTIF_PREFS: NotifPrefs = {
  matrix: {
    novo_agendamento: { email: true,  whatsapp: true,  system: true  },
    cancelamento:     { email: true,  whatsapp: true,  system: true  },
    reagendamento:    { email: true,  whatsapp: false, system: true  },
    confirmacao:      { email: true,  whatsapp: true,  system: false },
    lembrete_24h:     { email: true,  whatsapp: true,  system: false },
    lembrete_2h:      { email: false, whatsapp: true,  system: false },
    pagamento:        { email: true,  whatsapp: false, system: true  },
    noshow:           { email: false, whatsapp: false, system: true  },
  },
  whatsappConnected: true,
  whatsappNumber: '+55 (11) 99999-9999',
  emailSender: 'contato@bellavista.com',
}

export const MOCK_PAYMENT_CONFIG: PaymentConfig = {
  pix: true,
  pixKey: '12.345.678/0001-90',
  cash: true,
  debit: true,
  credit: true,
  creditMaxInstallments: 12,
  voucher: true,
  transfer: false,
  requireDeposit: true,
  depositPercent: 30,
  freeCancelHours: 24,
  lateCancelFeePercent: 50,
}

export const MOCK_BOOKING_SITE: BookingSiteConfig = {
  slug: 'bellavista',
  customDomain: 'agenda.bellavista.com',
  primaryColor: '#2563EB',
  description: 'Salão de beleza completo no coração de São Paulo. Agende seu horário online!',
  showPrices: true,
  showProfessionals: true,
  allowProfessionalChoice: false,
}

export const MOCK_PLAN_INFO: PlanInfo = {
  tier: 'growth',
  price: 149,
  nextBillingDate: '24/07/2026',
  professionalsUsed: 4,
  professionalsLimit: 6,
}

export const MOCK_INVOICES: Invoice[] = [
  { id: '1', date: '24/06/2026', amount: 149, status: 'paid'    },
  { id: '2', date: '24/05/2026', amount: 149, status: 'paid'    },
  { id: '3', date: '24/04/2026', amount: 149, status: 'paid'    },
]

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Produção',
    key: 'sk_live_••••••••••••••••••••••••••••••3f2a',
    createdAt: '01/01/2026',
    lastUsed: 'Hoje',
  },
]

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: '1',
    url: 'https://meusite.com/webhook/milli',
    events: ['appointment.*', 'payment.*'],
    active: true,
    lastDelivery: '2 minutos atrás',
  },
]

export const MOCK_LGPD_LOGS: LgpdLog[] = [
  { id: '1', date: '24/06', time: '10:32', action: 'Acessou dados de',    subject: 'Maria Silva'   },
  { id: '2', date: '24/06', time: '09:15', action: 'Exportou dados de',   subject: 'Carlos Santos' },
  { id: '3', date: '23/06', time: '14:20', action: 'Acessou dados de',    subject: 'Ana Costa'     },
  { id: '4', date: '23/06', time: '11:05', action: 'Anonimizou dados de', subject: 'Pedro Lima'    },
  { id: '5', date: '22/06', time: '16:45', action: 'Exportou dados de',   subject: 'Lucia Mendes'  },
]

export const NOTIF_EVENT_LABELS: Record<NotifEvent, string> = {
  novo_agendamento: 'Novo agendamento',
  cancelamento:     'Cancelamento',
  reagendamento:    'Reagendamento',
  confirmacao:      'Confirmação',
  lembrete_24h:     'Lembrete 24h',
  lembrete_2h:      'Lembrete 2h',
  pagamento:        'Pagamento recebido',
  noshow:           'No-show',
}

export const NOTIF_EVENTS: NotifEvent[] = [
  'novo_agendamento', 'cancelamento', 'reagendamento', 'confirmacao',
  'lembrete_24h', 'lembrete_2h', 'pagamento', 'noshow',
]

export const STATES_BR: string[] = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export const TIMEZONES: string[] = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Recife',
  'America/Fortaleza',
  'America/Noronha',
  'America/Rio_Branco',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Porto_Velho',
]

export const HOUR_OPTIONS: string[] = Array.from({ length: 35 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})
