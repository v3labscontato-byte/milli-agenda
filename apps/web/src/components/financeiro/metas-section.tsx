'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_METAS_HISTORICO } from '@/lib/financeiro-historico'
import MonthFilter, { CURRENT_MONTH } from './month-filter'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function MetaTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  const realizado = payload.find((p) => p.name === 'Realizado')?.value ?? 0
  const meta      = payload.find((p) => p.name === 'Meta')?.value      ?? 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[11px] text-[#2563EB]">Realizado: {fmtBRL(realizado)}</p>
      <p className="text-[11px] text-[#F59E0B]">Meta: {fmtBRL(meta)}</p>
    </div>
  )
}

function PctTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[11px] font-semibold text-[#7C3AED]">{payload[0].value}% atingido</p>
    </div>
  )
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function StatusChip({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">Atingida</span>
  if (pct >= 80)  return <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">Em andamento</span>
  return <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">Abaixo da meta</span>
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function MetasSection() {
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const selected = MOCK_METAS_HISTORICO.find((m) => m.mesKey === selectedMonth) ?? MOCK_METAS_HISTORICO.at(-1)!

  const chartData = MOCK_METAS_HISTORICO.map((m) => ({ mes: m.mes, Realizado: m.realizado, Meta: m.meta }))
  const lineData  = MOCK_METAS_HISTORICO.map((m) => ({ mes: m.mes, pct: m.pct }))

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-8 w-72 animate-pulse rounded-md bg-[#F1F5F9]" />
        {[1,2,3].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-[#F1F5F9]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />

      {/* Realizado vs Meta: bar + line */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Realizado vs Meta</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Evolução jan–jun/26</p>
        </div>
        <div className="px-4 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={52}
                tickFormatter={(v: number) => `R$${Math.round(v / 1000)}k`} />
              <Tooltip content={<MetaTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="Realizado" fill="#2563EB" radius={[3,3,0,0]} maxBarSize={52} isAnimationActive={false} />
              <Line dataKey="Meta" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* % Atingimento line chart */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Taxa de Atingimento</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">% da meta mensal alcançado</p>
        </div>
        <div className="px-4 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={lineData} margin={{ top: 4, right: 28, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v: number) => `${v}%`} domain={[0, 120]} />
              <Tooltip content={<PctTooltip />} />
              <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: '100%', position: 'insideRight', fontSize: 10, fill: '#16A34A' }} />
              <Line dataKey="pct" stroke="#7C3AED" strokeWidth={2}
                dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                activeDot={{ r: 5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI cards for selected month */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          { label:'Meta',          value:fmtBRL(selected.meta),     icon:Target,      color:'text-[#F59E0B]', bg:'bg-[#FFFBEB]'  },
          { label:'Realizado',     value:fmtBRL(selected.realizado), icon:TrendingUp,  color:'text-[#2563EB]', bg:'bg-[#EFF6FF]'  },
          {
            label: '% Atingimento',
            value: `${selected.pct}%`,
            icon:  selected.pct >= 100 ? CheckCircle2 : AlertCircle,
            color: selected.pct >= 100 ? 'text-[#16A34A]' : selected.pct >= 80 ? 'text-[#2563EB]' : 'text-[#DC2626]',
            bg:    selected.pct >= 100 ? 'bg-[#F0FDF4]'   : selected.pct >= 80 ? 'bg-[#EFF6FF]'   : 'bg-[#FEF2F2]',
          },
        ] as const).map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', bg)}>
                <Icon size={14} className={color} aria-hidden="true" />
              </div>
              <p className="text-[12px] text-[#475569]">{label}</p>
            </div>
            <p className={cn('mt-3 font-tabular text-[22px] font-bold', color)}>{value}</p>
            <p className="mt-1 text-[11px] text-[#94A3B8]">{selected.mes}</p>
          </div>
        ))}
      </div>

      {/* Histórico table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Histórico Mensal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]" aria-label="Histórico de metas">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Mês','Meta','Realizado','% Ating.','Status'].map((h) => (
                  <th key={h} className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                    ['Meta','Realizado','% Ating.'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_METAS_HISTORICO.map((m, i) => (
                <tr key={m.mesKey}
                  className={cn('transition-colors hover:bg-[#F8FAFC]',
                    i < MOCK_METAS_HISTORICO.length - 1 && 'border-b border-[#F1F5F9]',
                    m.mesKey === selectedMonth && 'bg-[#EFF6FF]')}>
                  <td className="px-5 py-3 text-[13px] font-medium text-[#0F172A]">{m.mes}</td>
                  <td className="px-5 py-3 text-right font-tabular text-[12px] text-[#475569]">{fmtBRL(m.meta)}</td>
                  <td className="px-5 py-3 text-right font-tabular text-[12px] font-semibold text-[#0F172A]">{fmtBRL(m.realizado)}</td>
                  <td className={cn('px-5 py-3 text-right font-tabular text-[12px] font-bold',
                    m.pct >= 100 ? 'text-[#16A34A]' : m.pct >= 80 ? 'text-[#2563EB]' : 'text-[#DC2626]')}>{m.pct}%</td>
                  <td className="px-5 py-3"><StatusChip pct={m.pct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
