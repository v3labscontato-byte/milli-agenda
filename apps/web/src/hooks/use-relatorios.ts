'use client'
// TODO Backlog: Despesas → endpoint /reports/expenses (tabela Expense no banco)
import { useState, useEffect, useCallback } from 'react'
import { relatoriosApi } from '@/lib/api/relatorios'
import type { KpiData } from '@/lib/mock-data'

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
  todayPending?: number
  todayTotal?: number
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
  paidAt?: string | null
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

export interface MethodDatum {
  method: string
  total: number
}

export interface ServiceRankRow {
  rank: number
  nome: string
  qtd: number
  receita: number
}

export interface PaymentRow {
  id: string
  method: string
  amount: number
  status: string
  paidAt: string
  clientName: string
  service: string
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
      label:   'Recebido Hoje',
      value:   brl(raw.todayRevenue),
      trend:   '',
      trendUp: null,
    },
    {
      label:   'Pendente Hoje',
      value:   brl(raw.todayPending),
      trend:   '',
      trendUp: null,
    },
    {
      label:   'Total do Dia',
      value:   brl(raw.todayTotal),
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

export function useRelatorios(from?: string, to?: string) {
  const [data, setData]       = useState<KpiData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [kpis, setKpis]               = useState<KpiRawResponse | null>(null)
  const [kpisLoading, setKpisLoading] = useState(true)
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

  const [methodData, setMethodData]             = useState<MethodDatum[]>([])
  const [methodLoading, setMethodLoading]       = useState(false)
  const [methodError, setMethodError]           = useState<string | null>(null)

  const [topServices, setTopServices]           = useState<ServiceRankRow[]>([])
  const [topServicesLoading, setTopServicesLoading] = useState(false)
  const [topServicesError, setTopServicesError] = useState<string | null>(null)

  const [payments, setPayments]                 = useState<PaymentRow[]>([])
  const [paymentsLoading, setPaymentsLoading]   = useState(false)
  const [paymentsError, setPaymentsError]       = useState<string | null>(null)

  const [period, setPeriod]         = useState<Period>('mes')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); setKpisLoading(false); return }
    let cancelled = false
    setLoading(true); setKpisLoading(true)
    setError(null); setKpisError(null)
    relatoriosApi.kpis({ from, to })
      .then((res: unknown) => {
        if (cancelled) return
        const raw = (res ?? {}) as KpiRawResponse
        setKpis(raw)
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
  }, [from, to])

  const fetchCommissions = useCallback((from?: string, to?: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setCommissionsLoading(true)
    setCommissionsError(null)
    relatoriosApi.commissions({ from, to })
      .then((res: unknown) => setCommissions(Array.isArray(res) ? (res as CommissionRow[]) : []))
      .catch(() => setCommissionsError('Erro ao carregar comissões'))
      .finally(() => setCommissionsLoading(false))
  }, [])

  const fetchCashflow = useCallback((from?: string, to?: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setCashflowLoading(true)
    setCashflowError(null)
    relatoriosApi.cashflow({ from, to })
      .then((res: unknown) => setCashflow((res ?? null) as CashflowResponse | null))
      .catch(() => setCashflowError('Erro ao carregar fluxo de caixa'))
      .finally(() => setCashflowLoading(false))
  }, [])

  const fetchOverdue = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setOverdueLoading(true)
    setOverdueError(null)
    relatoriosApi.overdue()
      .then((res: unknown) => setOverdue(Array.isArray(res) ? (res as OverdueRow[]) : []))
      .catch(() => setOverdueError('Erro ao carregar inadimplência'))
      .finally(() => setOverdueLoading(false))
  }, [])

  const fetchMethodData = useCallback((from?: string, to?: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setMethodLoading(true)
    setMethodError(null)
    relatoriosApi.paymentsByMethod({ from, to })
      .then((res: unknown) => setMethodData(Array.isArray(res) ? (res as MethodDatum[]) : []))
      .catch(() => setMethodError('Erro ao carregar métodos'))
      .finally(() => setMethodLoading(false))
  }, [])

  const fetchTopServices = useCallback((from?: string, to?: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setTopServicesLoading(true)
    setTopServicesError(null)
    relatoriosApi.topServices({ from, to })
      .then((res: unknown) => setTopServices(Array.isArray(res) ? (res as ServiceRankRow[]) : []))
      .catch(() => setTopServicesError('Erro ao carregar procedimentos'))
      .finally(() => setTopServicesLoading(false))
  }, [])

  const fetchPayments = useCallback((from?: string, to?: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    setPaymentsLoading(true)
    setPaymentsError(null)
    relatoriosApi.payments({ from, to })
      .then((res: unknown) => setPayments(Array.isArray(res) ? (res as PaymentRow[]) : []))
      .catch(() => setPaymentsError('Erro ao carregar recebimentos'))
      .finally(() => setPaymentsLoading(false))
  }, [])

  const range = periodToRange(period, customFrom, customTo)

  return {
    data, loading, error,
    kpis, kpisLoading, kpisError,
    commissions, commissionsLoading, commissionsError, fetchCommissions,
    cashflow, cashflowLoading, cashflowError, fetchCashflow,
    overdue, overdueLoading, overdueError, fetchOverdue,
    methodData, methodLoading, methodError, fetchMethodData,
    topServices, topServicesLoading, topServicesError, fetchTopServices,
    payments, paymentsLoading, paymentsError, fetchPayments,
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
  fetcher: (params?: { from?: string; to?: string }) => Promise<unknown>,
  transform: (raw: unknown) => T,
  empty: T,
  from?: string,
  to?: string,
): AsyncState<T> {
  const [data, setData] = useState<T>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher({ from, to })
      .then((res) => { if (!cancelled) setData(transform(res)) })
      .catch(() => { if (!cancelled) setError('Erro ao carregar') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

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

export function useBookingsByStatus(from?: string, to?: string) {
  return useReport<BookingStatusDatum[]>(
    (params) => relatoriosApi.appointments(params),
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
    from,
    to,
  )
}

export interface ProfessionalDatum {
  id: string
  name: string
  completedAppts: number
  revenue: number
}

export function useProfessionalsReport(from?: string, to?: string) {
  return useReport<ProfessionalDatum[]>(
    (params) => relatoriosApi.professionals(params),
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
    from,
    to,
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

export function useRevenueReport(from?: string, to?: string) {
  return useReport<RevenuePointDatum[]>(
    (params) => relatoriosApi.revenue(params),
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
          return { label: `${d}/${m}`, total: byDay[date] ?? 0 }
        })
    },
    [],
    from,
    to,
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

export function useCashflowReport(from?: string, to?: string) {
  return useReport<CashflowDatum[]>(
    (params) => relatoriosApi.cashflow(params),
    (raw) => {
      const r = (raw ?? {}) as CashflowRaw
      return (r.entries ?? []).map((e) => ({
        label: e.dateLabel ?? '',
        entradas: Number(e.entradas ?? 0),
        saldo: Number(e.saldo ?? 0),
      }))
    },
    [],
    from,
    to,
  )
}
