'use client'
import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import KpiStrip from '@/components/kpi-strip'
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

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempFrom, setTempFrom] = useState('')
  const [tempTo, setTempTo] = useState('')

  const { from, to } = customRange ?? periodoToRange(periodo)
  const { data: kpis, loading } = useRelatorios()

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold text-[#0F172A]">Dashboard</h1>
        <p className="mt-0.5 text-[12px] text-[#475569]">Visão geral do seu negócio</p>
      </div>

      {/* ① Visão Geral de Hoje — KPIs fixos (sem filtro) */}
      <div>
        <h2 className="mb-4 text-[15px] font-semibold text-[#0F172A]">Visão Geral de Hoje</h2>
        {loading
          ? <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[0,1,2,3,4,5].map((i) => <div key={i} className="h-24 rounded-xl bg-[#F1F5F9]" />)}
            </div>
          : <KpiStrip kpis={kpis} />
        }
      </div>

      {/* ② Histórico & Analytics — com filtro de período */}
      <section aria-labelledby="analytics-heading">

        {/* Header da seção + seletor */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="analytics-heading" className="text-[15px] font-semibold text-[#0F172A]">
              Histórico &amp; Analytics
            </h2>
            <p className="mt-0.5 text-[12px] text-[#475569]">Desempenho e tendências do salão</p>
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
