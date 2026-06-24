// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'voucher'
export type TransactionStatus = 'PAID' | 'PENDING'
export type ComissaoStatus = 'PENDING' | 'PAID'
export type PeriodFilter = 'today' | 'week' | 'month' | 'last30' | 'custom'

export interface Transaction {
  id: string
  date: Date
  time: string
  clientName: string
  service: string
  professional: string
  method: PaymentMethod
  value: number
  status: TransactionStatus
}

export interface Comissao {
  id: string
  profissionalName: string
  initials: string
  avatarBg: string
  atendimentos: number
  receita: number
  pctComissao: number
  comissaoValue: number
  status: ComissaoStatus
  paidAt?: string
}

export interface Inadimplencia {
  id: string
  dateLabel: string
  clientName: string
  service: string
  value: number
  daysOverdue: number
}

export interface FluxoCaixaEntry {
  date: Date
  dateLabel: string
  entradas: number
  saidas: number
  saldoDia: number
  saldoAcum: number
}

export interface WeeklyRevenue {
  semana: string
  servicos: number
  produtos: number
  outros: number
}

export interface MetodoDistrib {
  id: string
  label: string
  emoji: string
  value: number
  color: string
}

export interface FinanceiroKpis {
  receitaMes: number
  receitaMesTrend: string
  receitaMesTrendUp: boolean
  receitaHoje: number
  receitaHojeTrend: string
  receitaHojeTrendUp: boolean
  aReceber: number
  pendingCount: number
  taxaRecebimento: number
  taxaMeta: number
  taxaTrendUp: boolean
  ticketMedio: number
  ticketTrend: string
  ticketTrendUp: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayAt(offsetDays: number, hh: number, mm = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  d.setHours(hh, mm, 0, 0)
  return d
}

let _txId = 0
function mk(
  offset: number,
  time: string,
  client: string,
  service: string,
  prof: string,
  method: PaymentMethod,
  value: number,
  status: TransactionStatus,
): Transaction {
  const [hh, mm] = time.split(':').map(Number)
  return {
    id: `tx-${++_txId}`,
    date: dayAt(offset, hh, mm),
    time,
    clientName: client,
    service,
    professional: prof,
    method,
    value,
    status,
  }
}

// ─── Transactions (30 items for the month) ───────────────────────────────────
// Today PAID sum = R$642; PENDING sum = R$197

export const MOCK_TRANSACTIONS: Transaction[] = [
  // ── Today (offset 0) — PAID ──────────────────────────────────────────────
  mk(0, '09:00', 'Maria Silva',       'Escova',             'Lena Santos', 'pix',      80,  'PAID'),
  mk(0, '10:15', 'Carlos Santos',     'Barba',              'João Silva',  'dinheiro', 40,  'PAID'),
  mk(0, '10:30', 'Paula Mendes',      'Coloração',          'Lena Santos', 'credito',  200, 'PAID'),
  mk(0, '11:00', 'Juliana Ferreira',  'Hidratação Capilar', 'Lisa Kim',    'pix',      100, 'PAID'),
  mk(0, '11:30', 'Roberto Lima',      'Corte + Barba',      'João Silva',  'debito',   80,  'PAID'),
  mk(0, '13:00', 'Beatriz Oliveira',  'Escova',             'Lisa Kim',    'pix',      142, 'PAID'),

  // ── Pending — 6 items, sum = R$197 ───────────────────────────────────────
  mk(0, '14:00', 'Ana Lima',          'Manicure',           'Ana Costa',   'pix',      40,  'PENDING'),
  mk(0, '15:00', 'Rodrigo Alves',     'Corte Masculino',    'João Silva',  'debito',   45,  'PENDING'),
  mk(1, '16:30', 'Fernanda Souza',    'Pedicure',           'Ana Costa',   'pix',      30,  'PENDING'),
  mk(1, '09:00', 'Lucas Pereira',     'Corte Masculino',    'João Silva',  'credito',  40,  'PENDING'),
  mk(2, '14:00', 'Beatriz Santos',    'Escova',             'Lisa Kim',    'credito',  20,  'PENDING'),
  mk(2, '11:00', 'Marcos Oliveira',   'Barba',              'João Silva',  'dinheiro', 22,  'PENDING'),

  // ── Jun 22-23 (offsets 1-2) ── PAID ──────────────────────────────────────
  mk(2, '09:30', 'Camila Torres',     'Coloração',          'Lena Santos', 'pix',      280, 'PAID'),
  mk(2, '14:00', 'Diego Souza',       'Corte + Barba',      'João Silva',  'dinheiro', 85,  'PAID'),
  mk(1, '10:00', 'Patricia Lima',     'Escova Progressiva', 'Lisa Kim',    'credito',  320, 'PAID'),
  mk(1, '15:00', 'Eduardo Costa',     'Corte Masculino',    'João Silva',  'pix',      65,  'PAID'),

  // ── Jun 15-21 (offsets 3-9) — PAID ───────────────────────────────────────
  mk(3, '10:00', 'Sofia Ramos',       'Coloração + Hidrat.','Lena Santos', 'credito',  380, 'PAID'),
  mk(4, '09:00', 'Bruna Alves',       'Escova Progressiva', 'Lisa Kim',    'pix',      300, 'PAID'),
  mk(5, '11:30', 'Isabel Nunes',      'Coloração',          'Lena Santos', 'credito',  250, 'PAID'),
  mk(5, '14:00', 'Aline Barbosa',     'Design Sobrancelha', 'Ana Costa',   'pix',      30,  'PAID'),
  mk(6, '09:30', 'Renata Costa',      'Hidratação Capilar', 'Lena Santos', 'debito',   180, 'PAID'),
  mk(7, '10:00', 'Victor Moraes',     'Corte + Barba',      'João Silva',  'pix',      80,  'PAID'),

  // ── Jun 8-14 (offsets 10-16) — PAID ──────────────────────────────────────
  mk(10, '09:00', 'Tatiane Rocha',    'Coloração Completa', 'Lena Santos', 'credito',  420, 'PAID'),
  mk(11, '10:30', 'Miguel Ferreira',  'Corte Masculino',    'João Silva',  'pix',      65,  'PAID'),
  mk(12, '09:00', 'Gabriela Santos',  'Escova Progressiva', 'Lisa Kim',    'pix',      320, 'PAID'),
  mk(13, '11:30', 'Mariana Lima',     'Hidratação Capilar', 'Lena Santos', 'debito',   180, 'PAID'),
  mk(14, '10:00', 'Amanda Costa',     'Coloração',          'Lena Santos', 'credito',  250, 'PAID'),

  // ── Jun 1-7 (offsets 17-23) — PAID ───────────────────────────────────────
  mk(17, '09:00', 'Claudia Oliveira', 'Coloração + Hidrat.','Lena Santos', 'credito',  380, 'PAID'),
  mk(18, '10:00', 'Rafael Souza',     'Barba',              'João Silva',  'dinheiro', 35,  'PAID'),
  mk(19, '09:30', 'Fernanda Lima',    'Escova Progressiva', 'Lisa Kim',    'pix',      280, 'PAID'),
  mk(20, '14:00', 'José Santos',      'Corte Masculino',    'João Silva',  'voucher',  65,  'PAID'),
]

// ─── Comissões ────────────────────────────────────────────────────────────────

export const MOCK_COMISSOES: Comissao[] = [
  { id: 'co-1', profissionalName: 'Lena Santos', initials: 'LS', avatarBg: '#7C3AED', atendimentos: 48, receita: 4320, pctComissao: 40, comissaoValue: 1728, status: 'PENDING' },
  { id: 'co-2', profissionalName: 'João Silva',  initials: 'JS', avatarBg: '#2563EB', atendimentos: 35, receita: 2100, pctComissao: 35, comissaoValue: 735,  status: 'PENDING' },
  { id: 'co-3', profissionalName: 'Lisa Kim',    initials: 'LK', avatarBg: '#DB2777', atendimentos: 28, receita: 3360, pctComissao: 40, comissaoValue: 1344, status: 'PENDING' },
  { id: 'co-4', profissionalName: 'Ana Costa',   initials: 'AC', avatarBg: '#16A34A', atendimentos: 22, receita: 880,  pctComissao: 35, comissaoValue: 308,  status: 'PAID', paidAt: '20/06' },
]

// ─── Inadimplência (3 items) ─────────────────────────────────────────────────

export const MOCK_INADIMPLENCIA: Inadimplencia[] = [
  { id: 'id-1', dateLabel: '15/06', clientName: 'Pedro Alves',  service: 'Coloração', value: 200, daysOverdue: 9  },
  { id: 'id-2', dateLabel: '10/06', clientName: 'Julia Ramos',  service: 'Escova',    value: 80,  daysOverdue: 14 },
  { id: 'id-3', dateLabel: '01/06', clientName: 'Marcos Lima',  service: 'Barba',     value: 40,  daysOverdue: 23 },
]

// ─── Fluxo de Caixa (Jun 1–24) ───────────────────────────────────────────────

const DAILY_CASHFLOW: Array<[number, number]> = [
  [680, 0],    // Jun 1
  [420, 200],  // Jun 2
  [480, 0],    // Jun 3
  [565, 0],    // Jun 4
  [620, 1500], // Jun 5 (aluguel)
  [450, 0],    // Jun 6
  [0,   0],    // Jun 7 Sun
  [520, 300],  // Jun 8 (insumos)
  [380, 0],    // Jun 9
  [620, 0],    // Jun 10
  [290, 0],    // Jun 11
  [700, 0],    // Jun 12
  [580, 0],    // Jun 13
  [0,   0],    // Jun 14 Sun
  [370, 450],  // Jun 15 (insumos)
  [620, 0],    // Jun 16
  [450, 0],    // Jun 17
  [710, 200],  // Jun 18
  [580, 0],    // Jun 19
  [480, 0],    // Jun 20
  [0,   0],    // Jun 21 Sun
  [450, 1500], // Jun 22 (aluguel)
  [520, 0],    // Jun 23
  [642, 0],    // Jun 24 (today)
]

export const MOCK_FLUXO: FluxoCaixaEntry[] = (() => {
  let acc = 0
  return DAILY_CASHFLOW.map(([entradas, saidas], i) => {
    const offset = DAILY_CASHFLOW.length - 1 - i // Jun 1 = offset 23
    const date = dayAt(offset, 0)
    const saldoDia = entradas - saidas
    acc += saldoDia
    return {
      date,
      dateLabel: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      entradas,
      saidas,
      saldoDia,
      saldoAcum: acc,
    }
  })
})()

// ─── Chart data ───────────────────────────────────────────────────────────────

export const RECEITA_SEMANAL: WeeklyRevenue[] = [
  { semana: 'S1', servicos: 1100, produtos: 180, outros: 70 },
  { semana: 'S2', servicos: 1420, produtos: 220, outros: 90 },
  { semana: 'S3', servicos: 1580, produtos: 195, outros: 110 },
  { semana: 'S4', servicos: 980,  produtos: 140, outros: 75 },
]

export const METODO_DISTRIBUICAO: MetodoDistrib[] = [
  { id: 'pix',      label: 'PIX',        emoji: '🔵', value: 3708, color: '#16A34A' },
  { id: 'credito',  label: 'Crédito',    emoji: '💳', value: 2060, color: '#7C3AED' },
  { id: 'debito',   label: 'Débito',     emoji: '💳', value: 1236, color: '#2563EB' },
  { id: 'dinheiro', label: 'Dinheiro',   emoji: '💵', value: 824,  color: '#D97706' },
  { id: 'outros',   label: 'Outros',     emoji: '🎫', value: 412,  color: '#94A3B8' },
]

// ─── KPIs (hardcoded for month overview) ─────────────────────────────────────

export const FINANCEIRO_KPIS: FinanceiroKpis = {
  receitaMes: 8240,
  receitaMesTrend: '+12% vs mês ant.',
  receitaMesTrendUp: true,
  receitaHoje: 642,
  receitaHojeTrend: '+R$ 120 vs ontem',
  receitaHojeTrendUp: true,
  aReceber: 197,
  pendingCount: 6,
  taxaRecebimento: 92,
  taxaMeta: 88,
  taxaTrendUp: true,
  ticketMedio: 285,
  ticketTrend: '+R$ 15 vs mês ant.',
  ticketTrendUp: true,
}

// ─── Period filter helper ─────────────────────────────────────────────────────

export function filterByPeriod(
  txs: Transaction[],
  filter: PeriodFilter,
  customFrom?: string,
  customTo?: string,
): Transaction[] {
  const now = new Date()
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const todayStart = sod(now)

  switch (filter) {
    case 'today':
      return txs.filter((t) => sod(t.date).getTime() === todayStart.getTime())
    case 'week': {
      const dow = todayStart.getDay()
      const diff = dow === 0 ? 6 : dow - 1
      const monStart = new Date(todayStart)
      monStart.setDate(todayStart.getDate() - diff)
      return txs.filter((t) => sod(t.date) >= monStart)
    }
    case 'month': {
      const monStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return txs.filter((t) => sod(t.date) >= monStart)
    }
    case 'last30': {
      const cutoff = new Date(todayStart)
      cutoff.setDate(todayStart.getDate() - 29)
      return txs.filter((t) => sod(t.date) >= cutoff)
    }
    case 'custom': {
      if (!customFrom || !customTo) return txs
      const from = sod(new Date(customFrom + 'T00:00:00'))
      const to = sod(new Date(customTo + 'T00:00:00'))
      return txs.filter((t) => {
        const d = sod(t.date)
        return d >= from && d <= to
      })
    }
  }
}

// ─── Date label helper ────────────────────────────────────────────────────────

export function txDateLabel(date: Date, time: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const d = date.toDateString()
  if (d === today.toDateString()) return `Hoje ${time}`
  if (d === yesterday.toDateString()) return `Ontem ${time}`
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${time}`
}
