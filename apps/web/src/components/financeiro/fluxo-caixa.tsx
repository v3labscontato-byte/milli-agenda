'use client'

import { memo, useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { FluxoCaixaEntry } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface ChartEntry { dateLabel?: string; entradas?: number; saidas?: number; saldoAcum?: number }
interface FluxoTooltipProps { active?: boolean; payload?: Array<{ value?: number; dataKey?: string }>; label?: string }

function FluxoTooltip({ active, payload, label }: FluxoTooltipProps) {
  if (!active || !payload?.length) return null
  const entradas = payload.find((p) => p.dataKey === 'entradas')?.value ?? 0
  const saidas   = payload.find((p) => p.dataKey === 'saidas')?.value ?? 0
  const saldo    = payload.find((p) => p.dataKey === 'saldoAcum')?.value ?? 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[12px] text-[#16A34A]">Entradas: {fmtBRL(entradas)}</p>
      {saidas > 0 && <p className="text-[12px] text-[#DC2626]">Saídas: {fmtBRL(saidas)}</p>}
      <p className="mt-1 border-t border-[#F1F5F9] pt-1 text-[11px] font-semibold text-[#0F172A]">
        Saldo acum.: {fmtBRL(saldo)}
      </p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5" aria-hidden="true">
      <div className="mb-4 h-5 w-44 animate-pulse rounded bg-[#F1F5F9]" />
      <div className="h-40 animate-pulse rounded bg-[#F1F5F9]" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FluxoCaixaProps {
  entries: FluxoCaixaEntry[]
}

function FluxoCaixa({ entries }: FluxoCaixaProps) {
  const [mounted, setMounted] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const saldoFinal    = entries.at(-1)?.saldoAcum ?? 0
  const totalEntradas = entries.reduce((s, e) => s + e.entradas, 0)
  const totalSaidas   = entries.reduce((s, e) => s + e.saidas, 0)

  const chartData: ChartEntry[] = entries.map((e) => ({
    dateLabel: e.dateLabel,
    entradas:  e.entradas,
    saidas:    e.saidas,
    saldoAcum: e.saldoAcum,
  }))

  // Show every 4th label to avoid crowding
  const tickFormatter = (_: string, idx: number) => (idx % 4 === 0 ? entries[idx]?.dateLabel ?? '' : '')

  if (!mounted) return <Skeleton />

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Entradas', value: totalEntradas, color: 'text-[#16A34A]' },
          { label: 'Total Saídas',   value: totalSaidas,   color: 'text-[#DC2626]' },
          { label: 'Saldo Final',    value: saldoFinal,    color: 'text-[#2563EB]' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
            <p className="text-[11px] text-[#64748B]">{s.label}</p>
            <p className={cn('mt-1 font-tabular text-[16px] font-bold', s.color)}>{fmtBRL(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Evolução do Saldo</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Saldo acumulado no mês</p>
        </div>
        <div className="px-5 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="dateLabel"
                tickFormatter={tickFormatter}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false} tickLine={false} width={48}
                tickFormatter={(v: number) => `R$${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<FluxoTooltip />} />
              <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1} />
              <Area
                dataKey="saldoAcum"
                name="Saldo Acumulado"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#gradSaldo)"
                dot={false}
                activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={!prefersReduced}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Movimento Diário</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]" aria-label="Fluxo de caixa diário">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Data</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Entradas</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Saídas</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Saldo Dia</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Saldo Acum.</th>
              </tr>
            </thead>
            <tbody>
              {[...entries].reverse().map((e, i, arr) => (
                <tr
                  key={e.dateLabel}
                  className={cn(
                    'transition-colors hover:bg-[#F8FAFC]',
                    i < arr.length - 1 && 'border-b border-[#F1F5F9]',
                    e.saldoDia < 0 && 'bg-[#FFF7F7]',
                  )}
                >
                  <td className="px-5 py-2.5 font-tabular text-[12px] text-[#475569]">{e.dateLabel}</td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#16A34A]">
                    {e.entradas > 0 ? fmtBRL(e.entradas) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#DC2626]">
                    {e.saidas > 0 ? fmtBRL(e.saidas) : '—'}
                  </td>
                  <td className={cn(
                    'px-4 py-2.5 text-right font-tabular text-[12px] font-medium',
                    e.saldoDia > 0 ? 'text-[#16A34A]' : e.saldoDia < 0 ? 'text-[#DC2626]' : 'text-[#94A3B8]',
                  )}>
                    {e.saldoDia === 0 ? '—' : fmtBRL(e.saldoDia)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-tabular text-[12px] font-semibold text-[#0F172A]">
                    {fmtBRL(e.saldoAcum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default memo(FluxoCaixa)
