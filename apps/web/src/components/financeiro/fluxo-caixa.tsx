'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { MOCK_FLUXO_HISTORICO, MOCK_LANCAMENTOS_HISTORICO } from '@/lib/financeiro-historico'
import { FEATURES } from '@/lib/features'
import type { CashflowResponse } from '@/hooks/use-relatorios'
import MonthFilter, { CURRENT_MONTH } from './month-filter'

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
  realData?: CashflowResponse | null
  loading?: boolean
  error?: string | null
}

function FluxoCaixa({ realData, loading, error }: FluxoCaixaProps) {
  const real = FEATURES.realRelatorios
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [mounted, setMounted] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  const apiEntries = useMemo(() => realData?.entries ?? [], [realData])

  const entries = MOCK_FLUXO_HISTORICO[selectedMonth] ?? []
  const lancamentos = MOCK_LANCAMENTOS_HISTORICO[selectedMonth] ?? []

  const mockTotalEntradas = useMemo(() => lancamentos.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0), [lancamentos])
  const mockTotalSaidas   = useMemo(() => lancamentos.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0),   [lancamentos])

  const totalEntradas = real ? apiEntries.reduce((s, e) => s + e.entradas, 0) : mockTotalEntradas
  const totalSaidas   = real ? apiEntries.reduce((s, e) => s + e.saidas, 0)   : mockTotalSaidas
  const saldoFinal    = totalEntradas - totalSaidas

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  // Area chart: cumulative saldo over the period
  const chartData = useMemo(() => {
    if (real) {
      let acc = 0
      return apiEntries.map((e) => { acc += e.saldo; return { dateLabel: e.dateLabel, saldoAcum: acc } })
    }
    return entries.map((e) => ({ dateLabel: e.dateLabel, saldoAcum: e.saldoAcum }))
  }, [real, apiEntries, entries])

  const tickFormatter = (_: string, idx: number) =>
    (idx % 4 === 0 ? (real ? apiEntries[idx]?.dateLabel : entries[idx]?.dateLabel) ?? '' : '')

  // Detailed table: per-transaction lançamentos (mock only) with running saldo
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

  // Real mode: daily entries table (newest first) with cumulative saldo
  const displayDaily = useMemo(() => {
    let acc = 0
    return apiEntries.map((e) => { acc += e.saldo; return { ...e, saldoAcum: acc } }).reverse()
  }, [apiEntries])

  if (real && error) {
    return <div className="text-sm text-red-500 p-4">Erro ao carregar. Tente novamente.</div>
  }

  if (real && loading) return <Skeleton />
  if (!mounted) return <Skeleton />

  if (real && apiEntries.length === 0) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-12 text-center">
        <p className="text-[13px] text-[#64748B]">Sem movimentações no período selecionado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!real && <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />}
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

      {/* Movimentações table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">{real ? 'Movimentações diárias' : 'Lançamentos'}</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">
            {real ? `${apiEntries.length} dias no período` : `${lancamentos.length} movimentações no mês`}
          </p>
        </div>
        <div className="overflow-x-auto">
          {real ? (
            <table className="w-full min-w-[560px]" aria-label="Movimentações diárias">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {['Data','Entradas','Saídas','Saldo do dia','Saldo acum.'].map((h) => (
                    <th key={h} className={cn('px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                      h === 'Data' ? 'text-left' : 'text-right')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayDaily.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-[13px] text-[#94A3B8]">Sem movimentações no período selecionado.</td></tr>
                ) : displayDaily.map((e, i) => (
                  <tr key={e.date} className={cn('transition-colors hover:bg-[#F8FAFC]', i < displayDaily.length - 1 && 'border-b border-[#F1F5F9]')}>
                    <td className="px-4 py-2.5 font-tabular text-[12px] text-[#475569]">{e.dateLabel}</td>
                    <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#16A34A]">{e.entradas > 0 ? fmtBRL(e.entradas) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-tabular text-[12px] text-[#DC2626]">{e.saidas > 0 ? fmtBRL(e.saidas) : '—'}</td>
                    <td className={cn('px-4 py-2.5 text-right font-tabular text-[12px] font-medium', e.saldo >= 0 ? 'text-[#0F172A]' : 'text-[#DC2626]')}>{fmtBRL(e.saldo)}</td>
                    <td className={cn('px-4 py-2.5 text-right font-tabular text-[12px] font-semibold', e.saldoAcum >= 0 ? 'text-[#0F172A]' : 'text-[#DC2626]')}>{fmtBRL(e.saldoAcum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(FluxoCaixa)
