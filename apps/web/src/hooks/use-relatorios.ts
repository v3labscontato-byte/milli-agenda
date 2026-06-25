'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { relatoriosApi } from '@/lib/api/relatorios'
import { mockKpis, type KpiData } from '@/lib/mock-data'

interface KpiRawResponse {
  date?: string
  totalAppointments?: number
  completedAppointments?: number
  cancelledAppointments?: number
  occupancyRate?: number
  todayRevenue?: number
  totalClients?: number
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

  useEffect(() => {
    if (!FEATURES.realRelatorios) return
    let cancelled = false
    setLoading(true)
    setError(null)
    relatoriosApi.kpis()
      .then((res: unknown) => {
        if (!cancelled) {
          // Backend returns a flat object; transform to KpiData[]
          const kpis = Array.isArray(res) ? (res as KpiData[]) : toKpiArray(res as KpiRawResponse)
          setData(kpis)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar relatórios')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
