'use client'
// TODO Backlog: Metas financeiras → endpoint /reports/goals (tabela Goal no banco)
// TODO Backlog: Despesas → endpoint /reports/expenses (tabela Expense no banco)
import { useState, useEffect, useCallback } from 'react'
import { FEATURES } from '@/lib/features'
import { relatoriosApi } from '@/lib/api/relatorios'
import { mockKpis, type KpiData } from '@/lib/mock-data'

export interface KpiRawResponse {
  date?: string
  receitaBruta?: number
  receitaLiquida?: number
  despesas?: number
  lucro?: number
  margem?: number
  ticketMedio?: number
  recebido?: number
  aReceber?: number
  totalAppointments?: number
  completedAppointments?: number
  cancelledAppointments?: number
  occupancyRate?: number
  todayRevenue?: number
  totalClients?: number
}

export interface CommissionRow {
  professionalId: string
  name: string
  atendimentos: number
  receita: number
  pctComissao: number
  comissaoValue: number
  periodoRef: string
  status: 'PENDING' | 'PAID'
}

export interface CashflowEntry {
  date: string
  dateLabel: string
  entradas: number
  saidas: number
  saldo: number
}

export interface CashflowResponse {
  from: string
  to: string
  entries: CashflowEntry[]
}

export interface OverdueRow {
  id: string
  clientName: string
  service: string
  value: number
  date: string
  daysOverdue: number
}

export type Period = 'hoje' | 'semana' | 'mes' | 'ultimos30' | 'custom'

export interface DateRange {
  from: string
  to: string
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function periodToRange(period: Period, customFrom = '', customTo = ''): DateRange {
  const today = new Date()
  const to = ymd(today)
  switch (period) {
    case 'hoje':
      return { from: to, to }
    case 'semana': {
      const d = new Date(today)
      d.setDate(d.getDate() - 6)
      return { from: ymd(d), to }
    }
    case 'mes': {
      const d = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: ymd(d), to }
    }
    case 'ultimos30': {
      const d = new Date(today)
      d.setDate(d.getDate() - 29)
      return { from: ymd(d), to }
    }
    case 'custom':
      return { from: customFrom, to: customTo }
  }
}

function toKpiArray(raw: KpiRawResponse): KpiData[] {
  const brl = (n = 0) =>
    `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const pct = (n = 0) => `${n}%`

  return [
    {
      label:   'Agendamentos Hoje',
      value:   String(raw.totalAppointments ?? 0),
      trend:   `${raw.completedAppointments ?? 0} concluídos`,
      trendUp: null,
    },
    {
      label:   'Clientes Atendidos',
      value:   String(raw.totalClients ?? 0),
      trend:   `${raw.completedAppointments ?? 0} atendimentos`,
      trendUp: null,
    },
    {
      label:   'Receita do Dia',
      value:   brl(raw.todayRevenue),
      trend:   '',
      trendUp: null,
    },
    {
      label:   'Ocupação',
      value:   pct(raw.occupancyRate),
      trend:   '',
      trendUp: null,
    },
  ]
}

export function useRelatorios() {
  const [data, setData]       = useState<KpiData[]>(() => FEATURES.realRelatorios ? [] : mockKpis)
  const [loading, setLoading] = useState(FEATURES.realRelatorios)
  const [error, setError]     = useState<string | null>(null)

  // Raw KPI object (calculated financial fields from backend)
  const [kpis, setKpis]               = useState<KpiRawResponse | null>(null)
  const [kpisLoading, setKpisLoading] = useState(FEATURES.realRelatorios)
  const [kpisError, setKpisError]     = useState<string | null>(null)

  const [commissions, setCommissions]               = useState<CommissionRow[]>([])
  const [commissionsLoading, setCommissionsLoading] = useState(false)
  const [commissionsError, setCommissionsError]     = useState<string | null>(null)

  const [cashflow, setCashflow]               = useState<CashflowResponse | null>(null)
  const [cashflowLoading, setCashflowLoading] = useState(false)
  const [cashflowError, setCashflowError]     = useState<string | null>(null)

  const [overdue, setOverdue]             = useState<OverdueRow[]>([])
  const [overdueLoading, setOverdueLoading] = useState(false)
  const [overdueError, setOverdueError]   = useState<string | null>(null)

  const [period, setPeriod]         = useState<Period>('mes')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')

  useEffect(() => {
    if (!FEATURES.realRelatorios) return
    let cancelled = false
    setLoading(true); setKpisLoading(true)
    setError(null); setKpisError(null)
    relatoriosApi.kpis()
      .then((res: unknown) => {
        if (cancelled) return
        const raw = (res ?? {}) as KpiRawResponse
        setKpis(raw)
        // Backend returns a flat object; transform to KpiData[]
        setData(Array.isArray(res) ? (res as KpiData[]) : toKpiArray(raw))
      })
      .catch(() => {
        if (cancelled) return
        setError('Erro ao carregar relatórios')
        setKpisError('Erro ao carregar relatórios')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false); setKpisLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const fetchCommissions = useCallback((from?: string, to?: string) => {
    if (!FEATURES.realRelatorios) return
    setCommissionsLoading(true)
    setCommissionsError(null)
    relatoriosApi.commissions({ from, to })
      .then((res: unknown) => setCommissions(Array.isArray(res) ? (res as CommissionRow[]) : []))
      .catch(() => setCommissionsError('Erro ao carregar comissões'))
      .finally(() => setCommissionsLoading(false))
  }, [])

  const fetchCashflow = useCallback((from?: string, to?: string) => {
    if (!FEATURES.realRelatorios) return
    setCashflowLoading(true)
    setCashflowError(null)
    relatoriosApi.cashflow({ from, to })
      .then((res: unknown) => setCashflow((res ?? null) as CashflowResponse | null))
      .catch(() => setCashflowError('Erro ao carregar fluxo de caixa'))
      .finally(() => setCashflowLoading(false))
  }, [])

  const fetchOverdue = useCallback(() => {
    if (!FEATURES.realRelatorios) return
    setOverdueLoading(true)
    setOverdueError(null)
    relatoriosApi.overdue()
      .then((res: unknown) => setOverdue(Array.isArray(res) ? (res as OverdueRow[]) : []))
      .catch(() => setOverdueError('Erro ao carregar inadimplência'))
      .finally(() => setOverdueLoading(false))
  }, [])

  const range = periodToRange(period, customFrom, customTo)

  return {
    data, loading, error,
    kpis, kpisLoading, kpisError,
    commissions, commissionsLoading, commissionsError, fetchCommissions,
    cashflow, cashflowLoading, cashflowError, fetchCashflow,
    overdue, overdueLoading, overdueError, fetchOverdue,
    period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, range,
  }
}

// ── Dashboard chart hooks ───────────────────────────────────────────────────

interface AsyncState<T> {
  data: T
  loading: boolean
  error: string | null
}

function useReport<T>(
  fetcher: () => Promise<unknown>,
  transform: (raw: unknown) => T,
  empty: T,
): AsyncState<T> {
  const [data, setData] = useState<T>(empty)
  const [loading, setLoading] = useState(FEATURES.realRelatorios)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realRelatorios) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((res) => {
        if (!cancelled) setData(transform(res))
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error }
}

export interface BookingStatusDatum {
  status: string
  label: string
  count: number
}

interface AppointmentsRaw {
  total?: number
  byStatus?: { status?: string; count?: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED:        'Agendados',
  CONFIRMED:        'Confirmados',
  CHECKED_IN:       'Check-in',
  IN_SERVICE:       'Em atendimento',
  AWAITING_PAYMENT: 'Aguard. pagamento',
  COMPLETED:        'Concluídos',
  NO_SHOW:          'Não compareceu',
  CANCELLED:        'Cancelados',
}

export function useBookingsByStatus() {
  return useReport<BookingStatusDatum[]>(
    () => relatoriosApi.appointments(),
    (raw) => {
      const r = (raw ?? {}) as AppointmentsRaw
      return (r.byStatus ?? [])
        .filter((s) => (s.count ?? 0) > 0)
        .map((s) => ({
          status: s.status ?? '',
          label: STATUS_LABELS[s.status ?? ''] ?? (s.status ?? '—'),
          count: s.count ?? 0,
        }))
    },
    [],
  )
}

export interface ProfessionalDatum {
  id: string
  name: string
  completedAppts: number
  revenue: number
}

export function useProfessionalsReport() {
  return useReport<ProfessionalDatum[]>(
    () => relatoriosApi.professionals(),
    (raw) => {
      const arr = Array.isArray(raw) ? raw : []
      return arr
        .map((p) => {
          const o = (p ?? {}) as Record<string, unknown>
          return {
            id: String(o.id ?? ''),
            name: String(o.name ?? '—'),
            completedAppts: Number(o.completedAppts ?? 0),
            revenue: Number(o.revenue ?? 0),
          }
        })
        .filter((p) => p.completedAppts > 0)
    },
    [],
  )
}

export interface RevenuePointDatum {
  label: string
  total: number
}

interface RevenueRaw {
  total?: number
  payments?: { amount?: number | string; paidAt?: string }[]
}

export function useRevenueReport() {
  return useReport<RevenuePointDatum[]>(
    () => relatoriosApi.revenue(),
    (raw) => {
      const r = (raw ?? {}) as RevenueRaw
      const byDay: Record<string, number> = {}
      for (const p of r.payments ?? []) {
        if (!p.paidAt) continue
        const key = String(p.paidAt).slice(0, 10)
        byDay[key] = (byDay[key] ?? 0) + Number(p.amount ?? 0)
      }
      return Object.keys(byDay)
        .sort((a, b) => a.localeCompare(b))
        .map((date) => {
          const [, m, d] = date.split('-')
          return { label: `${d}/${m}`, total: byDay[date] }
        })
    },
    [],
  )
}

export interface CashflowDatum {
  label: string
  entradas: number
  saldo: number
}

interface CashflowRaw {
  entries?: { dateLabel?: string; entradas?: number; saldo?: number }[]
}

export function useCashflowReport() {
  return useReport<CashflowDatum[]>(
    () => relatoriosApi.cashflow(),
    (raw) => {
      const r = (raw ?? {}) as CashflowRaw
      return (r.entries ?? []).map((e) => ({
        label: e.dateLabel ?? '',
        entradas: Number(e.entradas ?? 0),
        saldo: Number(e.saldo ?? 0),
      }))
    },
    [],
  )
}
