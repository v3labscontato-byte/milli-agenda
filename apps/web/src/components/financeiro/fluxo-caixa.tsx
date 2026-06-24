'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import type { FluxoCaixaEntry, FluxoLancamento } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface FluxoTooltipProps { active?: boolean; payload?: Array<{ value?: number; dataKey?: string }>; label?: string }

function FluxoTooltip({ active, payload, label }: FluxoTooltipProps) {
  if (!active || !payload?.length) return null
  const saldo = payload.find((p) => p.dataKey === 'saldoAcum')?.value ?? 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[11px] font-semibold text-[#0F172A]">Saldo acum.: {fmtBRL(saldo)}</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-[#F1F5F9]" />)}
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-[#F1F5F9]" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FluxoCaixaProps {
  entries: FluxoCaixaEntry[]
  lancamentos: FluxoLancamento[]
  totalEntradas: number
  totalSaidas: number
  saldoFinal: number
}

function FluxoCaixa({ entries, lancamentos, totalEntradas, totalSaidas, saldoFinal }: FluxoCaixaProps) {
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

  const chartData = useMemo(() => entries.map((e) => ({
    dateLabel: e.dateLabel, saldoAcum: e.saldoAcum,
  })), [entries])

  const tickFormatter = (_: string, idx: number) => (idx % 4 === 0 ? entries[idx]?.dateLabel ?? '' : '')

  // Compute running saldo from oldest to newest
  const withSaldo = useMemo(() => {
    const sorted = [...lancamentos].sort((a, b) => {
      const [da, ma] = a.date.split('/').map(Number)
      const [db, mb] = b.date.split('/').map(Number)
      return ma !== mb ? ma - mb : da - db
    })
    let running = 0
    return sorted.map((l) => {
      if (l.tipo === 'entrada') running += l.valor
      else running -= l.valor
      return { ...l, saldo: running }
    })
  }, [lancamentos])

  const displayLancamentos = useMemo(() => [...withSaldo].reverse(), [withSaldo])

  if (!mounted) return <Skeleton />

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total Entradas', value:totalEntradas, color:'text-[#16A34A]', border:'border-[#DCFCE7]' },
          { label:'Total Saídas',   value:totalSaidas,   color:'text-[#DC2626]', border:'border-[#FEE2E2]' },
          { label:'Saldo Final',    value:saldoFinal,    color:'text-[#2563EB]', border:'border-[#DBEAFE]' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-lg border bg-white px-4 py-3', s.border)}>
            <p className="text-[11px] text-[#64748B]">{s.label}</p>
            <p className={cn('mt-1 font-tabular text-[18px] font-bold', s.color)}>{fmtBRL(s.value)}</p>
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
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dateLabel" tickFormatter={tickFormatter} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={48}
                tickFormatter={(v: number) => `R$${Math.round(v/1000)}k`} />
              <Tooltip content={<FluxoTooltip />} />
              <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1} />
              <Area dataKey="saldoAcum" name="Saldo Acumulado" stroke="#2563EB" strokeWidth={2}
                fill="url(#gradSaldo)" dot={false}
                activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={!prefersReduced} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed lançamentos table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Lançamentos</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{lancamentos.length} movimentações no período</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]" aria-label="Lançamentos de caixa">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Data','Tipo','Categoria','Descrição','Entrada','Saída','Saldo'].map((h) => (
                  <th key={h} className={cn('px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                    ['Entrada','Saída','Saldo'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayLancamentos.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[#94A3B8]">Nenhum lançamento.</td></tr>
              ) : displayLancamentos.map((l, i) => (
                <tr key={l.id} className={cn('transition-colors hover:bg-[#F8FAFC]', i < displayLancamentos.length - 1 && 'border-b border-[#F1F5F9]')}>
                  <td className="px-4 py-2.5 font-tabular text-[12px] text-[#475569]">{l.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      l.tipo === 'entrada' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]')}>
                      {l.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-[#475569]">{l.categoria}</td>
                  <td className="px-4 py-2.5 text-[13px] text-[#0F172A]">{l.descricao}</td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#16A34A]">
                    {l.tipo === 'entrada' ? fmtBRL(l.valor) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#DC2626]">
                    {l.tipo === 'saida' ? fmtBRL(l.valor) : '—'}
                  </td>
                  <td className={cn('px-4 py-2.5 text-right font-tabular text-[12px] font-semibold',
                    l.saldo >= 0 ? 'text-[#0F172A]' : 'text-[#DC2626]')}>
                    {fmtBRL(l.saldo)}
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
