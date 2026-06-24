'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { WeeklyRevenue, MetodoDistrib, FaturamentoMensal } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Daily data ───────────────────────────────────────────────────────────────

interface DailyEntry { date: string; value: number; isWeekend?: boolean; isToday?: boolean }

const META_DIARIA = 800

const DAILY_DATA: DailyEntry[] = [
  { date:'11/06', value:720,  isWeekend:false },
  { date:'12/06', value:850,  isWeekend:false },
  { date:'13/06', value:0,    isWeekend:true  },
  { date:'14/06', value:0,    isWeekend:true  },
  { date:'15/06', value:680,  isWeekend:false },
  { date:'16/06', value:920,  isWeekend:false },
  { date:'17/06', value:1100, isWeekend:false },
  { date:'18/06', value:780,  isWeekend:false },
  { date:'19/06', value:840,  isWeekend:false },
  { date:'20/06', value:0,    isWeekend:true  },
  { date:'21/06', value:0,    isWeekend:true  },
  { date:'22/06', value:950,  isWeekend:false },
  { date:'23/06', value:1050, isWeekend:false },
  { date:'24/06', value:642,  isWeekend:false, isToday:true },
]

// ─── Tooltips ─────────────────────────────────────────────────────────────────

interface DailyPayload { value?: number; dataKey?: string }
interface DailyTooltipProps { active?: boolean; payload?: DailyPayload[]; label?: string }

function DailyTooltip({ active, payload, label }: DailyTooltipProps) {
  if (!active || !payload?.length) return null
  const value = (payload[0]?.value as number) ?? 0
  const atingida = value >= META_DIARIA && value > 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2.5 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[12px] text-[#475569]">Faturamento: <span className="font-medium text-[#0F172A]">{fmtBRL(value)}</span></p>
      <p className="text-[12px] text-[#475569]">Meta: <span className="font-medium text-[#0F172A]">{fmtBRL(META_DIARIA)}</span></p>
      {value > 0 && (
        <p className={cn('mt-1.5 text-[11px] font-semibold', atingida ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
          {atingida ? '✓ Atingida' : '✗ Abaixo da meta'}
        </p>
      )}
    </div>
  )
}

interface BarEntry { dataKey?: string | number; value?: number; color?: string }
interface BarTooltipProps { active?: boolean; payload?: BarEntry[]; label?: string }

const BAR_SERIES = [
  { key: 'servicos', label: 'Serviços', color: '#2563EB' },
  { key: 'produtos', label: 'Produtos', color: '#16A34A' },
  { key: 'outros',   label: 'Outros',   color: '#94A3B8' },
] as const

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + ((p.value as number) ?? 0), 0)
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="text-[12px]" style={{ color: e.color }}>
          {BAR_SERIES.find((s) => s.key === e.dataKey)?.label ?? e.dataKey}: {fmtBRL(e.value ?? 0)}
        </p>
      ))}
      <p className="mt-1 border-t border-[#F1F5F9] pt-1 text-[11px] font-semibold text-[#0F172A]">Total: {fmtBRL(total)}</p>
    </div>
  )
}

interface DonutEntry { name?: string; value?: number; payload?: { total?: number } }
function DonutTooltip({ active, payload }: { active?: boolean; payload?: DonutEntry[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const total = d.payload?.total ?? 0
  const pct = total > 0 ? (((d.value ?? 0) / total) * 100).toFixed(1) : '0.0'
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="text-[12px] font-semibold text-[#0F172A]">{d.name}</p>
      <p className="text-[12px] text-[#475569]">{fmtBRL(d.value ?? 0)} · {pct}%</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 h-72 animate-pulse rounded-lg bg-[#F1F5F9]" />
        <div className="h-72 animate-pulse rounded-lg bg-[#F1F5F9]" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-[#F1F5F9]" />
        <div className="h-64 animate-pulse rounded-lg bg-[#F1F5F9]" />
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const MONTHLY_SERIES = [
  { key: 'servicos', label: 'Serviços', color: '#2563EB' },
  { key: 'produtos', label: 'Produtos', color: '#16A34A' },
  { key: 'outros',   label: 'Outros',   color: '#94A3B8' },
] as const

interface ReceitaChartProps {
  weeklyData: WeeklyRevenue[]
  metodoData: MetodoDistrib[]
  monthlyData: FaturamentoMensal[]
}

const META_SEMANAL = 4000

export default function ReceitaChart({ weeklyData, metodoData, monthlyData }: ReceitaChartProps) {
  const [mounted, setMounted] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const [monthlyChartType, setMonthlyChartType] = useState<'bar' | 'area'>('bar')

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  if (!mounted) return <Skeleton />

  const total = metodoData.reduce((s, m) => s + m.value, 0)
  const metodoDataWithTotal = metodoData.map((m) => ({ ...m, total }))

  const workDays = DAILY_DATA.filter((d) => !d.isWeekend)
  const avgDiario = Math.round(workDays.reduce((s, d) => s + d.value, 0) / workDays.length)

  return (
    <div className="space-y-5">

      {/* ── Row 1: Faturamento Diário (2/3) + Por Método (1/3) ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Daily chart */}
        <div className="lg:col-span-2 rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Faturamento Diário</h3>
              <p className="mt-0.5 text-[12px] text-[#475569]">Últimas 2 semanas</p>
            </div>
            <span className="rounded-sm bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-medium text-[#D97706]">
              Média {fmtBRL(avgDiario)}/dia · Meta {fmtBRL(META_DIARIA)}
            </span>
          </div>
          <div className="px-5 pb-4 pt-5">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={DAILY_DATA} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={44}
                  tickFormatter={(v: number) => `R$${v}`} domain={[0, 1300]} />
                <Tooltip content={<DailyTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <ReferenceLine y={META_DIARIA} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: `Meta R$${META_DIARIA}`, position: 'insideTopRight', fontSize: 10, fill: '#D97706', dy: -4 }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={!prefersReduced}>
                  {DAILY_DATA.map((d, i) => (
                    <Cell key={i} fill={
                      d.value === 0 ? '#F1F5F9' :
                      d.isToday ? '#1D4ED8' :
                      d.isWeekend ? '#60A5FA' :
                      '#2563EB'
                    } />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#475569]">
              {[['#2563EB','Dia normal'],['#1D4ED8','Hoje'],['#60A5FA','Fim de semana'],['#F1F5F9','Sem registro']].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} aria-hidden="true" />{l}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[#F59E0B]" aria-hidden="true" />Meta diária
              </span>
            </div>
          </div>
        </div>

        {/* Donut: por método */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h3 className="text-[14px] font-semibold text-[#0F172A]">Por Método</h3>
            <p className="mt-0.5 text-[12px] text-[#475569]">Distribuição do período</p>
          </div>
          <div className="flex items-center gap-5 px-5 pb-5 pt-4">
            {/* Donut à esquerda */}
            <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
              <PieChart width={220} height={220}>
                <Pie data={metodoDataWithTotal} dataKey="value" nameKey="label"
                  cx="50%" cy="50%" innerRadius={65} outerRadius={100} strokeWidth={2} stroke="#fff"
                  isAnimationActive={!prefersReduced}>
                  {metodoDataWithTotal.map((m) => <Cell key={m.id} fill={m.color} />)}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-tabular text-[22px] font-bold text-[#0F172A]">{fmtBRL(total)}</span>
                <span className="text-[10px] text-[#475569]">total</span>
              </div>
            </div>
            {/* Legendas à direita */}
            <ul className="flex-1 space-y-2.5" aria-label="Métodos de pagamento">
              {metodoData.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                    <span className="truncate text-[13px] text-[#475569]">{m.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(m.value)}</span>
                    <span className="w-8 text-right text-[11px] text-[#64748B]">{((m.value / total) * 100).toFixed(0)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Row 2: Faturamento Mensal (1/2) + Receita por Semana (1/2) ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Monthly chart */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Faturamento Mensal</h3>
              <p className="mt-0.5 text-[12px] text-[#475569]">Jan → Jun 2026</p>
            </div>
            <div className="flex gap-1" role="group" aria-label="Tipo de gráfico">
              {(['bar', 'area'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setMonthlyChartType(t)} aria-pressed={monthlyChartType === t}
                  className={cn('rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    monthlyChartType === t ? 'bg-[#2563EB] text-white' : 'border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
                  {t === 'bar' ? 'Barras' : 'Área'}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 pt-5">
            <ResponsiveContainer width="100%" height={200}>
              {monthlyChartType === 'bar' ? (
                <BarChart data={monthlyData} barCategoryGap="30%" barGap={2}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={48}
                    tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} domain={[0, 16000]} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
                  <ReferenceLine y={15000} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2}
                    label={{ value: 'Meta R$15k/mês', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }} />
                  {MONTHLY_SERIES.map((s) => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color}
                      radius={s.key === 'outros' ? [3,3,0,0] : [0,0,0,0]} isAnimationActive={!prefersReduced} />
                  ))}
                </BarChart>
              ) : (
                <AreaChart data={monthlyData}>
                  <defs>
                    {MONTHLY_SERIES.map((s) => (
                      <linearGradient key={s.key} id={`mgrad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={s.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={48}
                    tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} domain={[0, 16000]} />
                  <Tooltip content={<BarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
                  <ReferenceLine y={15000} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2}
                    label={{ value: 'Meta R$15k/mês', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }} />
                  {MONTHLY_SERIES.map((s) => (
                    <Area key={s.key} dataKey={s.key} name={s.label} stackId="a"
                      stroke={s.color} strokeWidth={1.5} fill={`url(#mgrad-${s.key})`}
                      dot={false} isAnimationActive={!prefersReduced} />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Receita por Semana</h3>
              <p className="mt-0.5 text-[12px] text-[#475569]">Serviços · Produtos · Outros</p>
            </div>
            <span className="rounded-sm bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
              Meta: {fmtBRL(META_SEMANAL)}/sem
            </span>
          </div>
          <div className="px-5 pb-4 pt-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barCategoryGap="30%" barGap={2}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={48}
                  tickFormatter={(v: number) => `R$${(v/1000).toFixed(v >= 1000 ? 1 : 0)}k`} domain={[0, 4500]} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
                <ReferenceLine y={META_SEMANAL} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2}
                  label={{ value: 'Meta R$4k/sem', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }} />
                {BAR_SERIES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color}
                    radius={s.key === 'outros' ? [3,3,0,0] : [0,0,0,0]} isAnimationActive={!prefersReduced} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
