'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { WeeklyRevenue, MetodoDistrib, FaturamentoMensal } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Bar chart tooltip ────────────────────────────────────────────────────────

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
      <p className="mt-1 border-t border-[#F1F5F9] pt-1 text-[11px] font-semibold text-[#0F172A]">
        Total: {fmtBRL(total)}
      </p>
    </div>
  )
}

// ─── Donut tooltip ────────────────────────────────────────────────────────────

interface DonutEntry { name?: string; value?: number; payload?: { total?: number } }
interface DonutTooltipProps { active?: boolean; payload?: DonutEntry[] }

function DonutTooltip({ active, payload }: DonutTooltipProps) {
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3" aria-hidden="true">
      <div className="lg:col-span-2 rounded-lg border border-[#E2E8F0] bg-white p-5">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-[#F1F5F9]" />
        <div className="flex items-end gap-2 h-52">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-end gap-1">
              <div className="flex-1 animate-pulse rounded-t bg-[#F1F5F9]" style={{ height: `${80 + i * 15}px` }} />
              <div className="flex-1 animate-pulse rounded-t bg-[#F1F5F9]" style={{ height: `${30 + i * 5}px` }} />
              <div className="flex-1 animate-pulse rounded-t bg-[#F1F5F9]" style={{ height: `${15 + i * 3}px` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
        <div className="mb-4 h-5 w-36 animate-pulse rounded bg-[#F1F5F9]" />
        <div className="flex items-center justify-center h-40 w-40 mx-auto animate-pulse rounded-full bg-[#F1F5F9]" />
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

const META_SEMANAL = 2000

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

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

      {/* ── Stacked bar: receita por semana ── */}
      <div className="lg:col-span-2 rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false} tickLine={false} width={52}
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
              <ReferenceLine y={META_SEMANAL} stroke="#E2E8F0" strokeDasharray="4 3" strokeWidth={1.5} />
              {BAR_SERIES.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stackId="a"
                  fill={s.color}
                  radius={s.key === 'outros' ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={!prefersReduced}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Donut: distribuição por método ── */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Por Método</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Distribuição do período</p>
        </div>
        <div className="px-5 pb-5 pt-4">
          <div className="relative mx-auto" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={metodoDataWithTotal}
                  dataKey="value"
                  nameKey="label"
                  cx="50%" cy="50%"
                  innerRadius={44} outerRadius={64}
                  strokeWidth={2} stroke="#fff"
                  isAnimationActive={!prefersReduced}
                >
                  {metodoDataWithTotal.map((m) => <Cell key={m.id} fill={m.color} />)}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-tabular text-[15px] font-bold text-[#0F172A]">
                {fmtBRL(total)}
              </span>
              <span className="text-[9px] text-[#475569]">total</span>
            </div>
          </div>
          <ul className="mt-4 space-y-2" aria-label="Métodos de pagamento">
            {metodoData.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                  <span className="truncate text-[12px] text-[#475569]">{m.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-tabular text-[11px] font-medium text-[#0F172A]">{fmtBRL(m.value)}</span>
                  <span className="w-8 text-right text-[11px] text-[#475569]">
                    {((m.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Faturamento Mensal (Jan–Jun) ── */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#0F172A]">Faturamento Mensal</h3>
            <p className="mt-0.5 text-[12px] text-[#475569]">Jan → Jun 2026 · Serviços · Produtos · Outros</p>
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
          <ResponsiveContainer width="100%" height={220}>
            {monthlyChartType === 'bar' ? (
              <BarChart data={monthlyData} barCategoryGap="30%" barGap={2}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
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
                      <stop offset="95%" stopColor={s.color} stopOpacity={0}   />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<BarTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="square" iconSize={8} />
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
    </div>
  )
}
