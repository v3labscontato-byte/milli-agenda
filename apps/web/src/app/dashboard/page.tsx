'use client'
import { useState } from 'react'
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
  const { from, to } = periodoToRange(periodo)
  const { data: kpis, loading } = useRelatorios(from, to)

  return (
    <div className="space-y-8 pb-10">

      {/* Header + seletor de período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#0F172A]">Dashboard</h1>
          <p className="mt-0.5 text-[12px] text-[#475569]">Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-[#F1F5F9] p-1" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriodo(p.value)}
              aria-pressed={periodo === p.value}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                periodo === p.value
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ① KPI Strip */}
      {loading
        ? <div className="grid animate-pulse grid-cols-2 gap-4 lg:grid-cols-4">
            {[0,1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-[#F1F5F9]" />)}
          </div>
        : <KpiStrip kpis={kpis} />
      }

      {/* ② Analytics 2×2 */}
      <section aria-labelledby="analytics-heading">
        <div className="mb-4">
          <h2 id="analytics-heading" className="text-[16px] font-medium leading-[1.4] text-[#0F172A]">
            Analytics
          </h2>
          <p className="mt-0.5 text-[12px] text-[#475569]">Desempenho e tendências do salão</p>
        </div>
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
