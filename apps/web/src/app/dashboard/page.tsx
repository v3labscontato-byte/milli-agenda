'use client'
import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import KpiStrip from '@/components/kpi-strip'
import { KpiPeriodFilter } from '@/components/shared/kpi-card'
import BookingsChart from '@/components/charts/bookings-chart'
import WeeklyChart from '@/components/charts/weekly-chart'
import ServicesChart from '@/components/charts/services-chart'
import VolumeChart from '@/components/charts/volume-chart'
import { useRelatorios } from '@/hooks/use-relatorios'

type Periodo = '7d' | '30d' | '90d' | 'mes'

const PERIODOS: { label: string; value: Periodo }[] = [
  { label: '7 dias',   value: '7d'  },
  { label: '30 dias',  value: '30d' },
  { label: '90 dias',  value: '90d' },
  { label: 'Este mês', value: 'mes' },
]

function periodoToRange(p: Periodo): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const to = fmt(now)
  const from = new Date(now)
  if (p === '7d')  from.setDate(from.getDate() - 7)
  if (p === '30d') from.setDate(from.getDate() - 30)
  if (p === '90d') from.setDate(from.getDate() - 90)
  if (p === 'mes') from.setDate(1)
  return { from: fmt(from), to }
}

type KpiPeriod = 'hoje' | 'semana' | 'mes' | '30d'

const KPI_PERIODOS: Array<{ key: KpiPeriod; label: string }> = [
  { key: 'hoje',   label: 'Hoje'            },
  { key: 'semana', label: 'Esta semana'     },
  { key: 'mes',    label: 'Este mês'        },
  { key: '30d',    label: 'Últimos 30 dias' },
]

function kpiPeriodoToRange(p: KpiPeriod): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const to = fmt(now)
  if (p === 'hoje') return { from: to, to }
  const from = new Date(now)
  if (p === 'semana') from.setDate(from.getDate() - from.getDay())
  if (p === 'mes')    from.setDate(1)
  if (p === '30d')    from.setDate(from.getDate() - 30)
  return { from: fmt(from), to }
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempFrom, setTempFrom] = useState('')
  const [tempTo, setTempTo] = useState('')
  const [kpiPeriodo, setKpiPeriodo] = useState<KpiPeriod>('hoje')

  const { from, to } = customRange ?? periodoToRange(periodo)
  const { from: kpiFrom, to: kpiTo } = kpiPeriodoToRange(kpiPeriodo)
  const { data: kpis, loading } = useRelatorios(kpiFrom, kpiTo)

  return (
    <div className="space-y-8 pb-10">

      {/* ① Visão Geral — KPIs com filtro de período */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">
            Visão Geral — {KPI_PERIODOS.find((p) => p.key === kpiPeriodo)?.label}
          </h2>
          <KpiPeriodFilter
            options={KPI_PERIODOS}
            active={kpiPeriodo}
            onChange={(k) => setKpiPeriodo(k as KpiPeriod)}
          />
        </div>
        <KpiStrip kpis={kpis} isLoading={loading} />
      </div>

      {/* ② Histórico & Analytics — com filtro de período */}
      <section aria-labelledby="analytics-heading">

        {/* Header da seção + seletor */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="analytics-heading" className="text-[15px] font-semibold text-[#0F172A]">
              Histórico &amp; Analytics
            </h2>
            <p className="mt-0.5 text-[12px] text-[#475569]">Desempenho e tendências do seu negócio</p>
          </div>

          <div className="flex gap-1 rounded-lg bg-[#F1F5F9] p-1" role="group" aria-label="Período">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setPeriodo(p.value); setCustomRange(null) }}
                aria-pressed={periodo === p.value && !customRange}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  periodo === p.value && !customRange
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]',
                )}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowDatePicker((v) => !v)}
              aria-pressed={!!customRange}
              className={cn(
                'flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                customRange
                  ? 'bg-white text-[#2563EB] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]',
              )}
            >
              <CalendarIcon size={12} aria-hidden="true" />
              {customRange ? `${customRange.from} → ${customRange.to}` : 'Personalizado'}
            </button>
          </div>
        </div>

        {/* Date picker personalizado */}
        {showDatePicker && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-[#64748B]">De:</label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[12px] text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-[#64748B]">Até:</label>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[12px] text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (tempFrom && tempTo) {
                  setCustomRange({ from: tempFrom, to: tempTo })
                  setShowDatePicker(false)
                }
              }}
              className="rounded-md bg-[#2563EB] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] transition-colors duration-150 motion-reduce:transition-none"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => { setShowDatePicker(false); setCustomRange(null) }}
              className="text-[12px] text-[#64748B] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] transition-colors duration-150 motion-reduce:transition-none"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <BookingsChart from={from} to={to} />
          <ServicesChart from={from} to={to} />
          <WeeklyChart   from={from} to={to} />
          <VolumeChart   from={from} to={to} />
        </div>
      </section>

    </div>
  )
}
