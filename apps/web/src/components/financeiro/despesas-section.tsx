'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { MOCK_DESPESAS_CATEGORIA, MOCK_DESPESAS_MENSAL } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

const TOTAL_DESPESAS = MOCK_DESPESAS_CATEGORIA.reduce((s, d) => s + d.valor, 0)

// ─── Tooltips ─────────────────────────────────────────────────────────────────

interface PieTEntry { name?: string; value?: number; payload?: { pct?: number } }
function PieTooltip({ active, payload }: { active?: boolean; payload?: PieTEntry[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="text-[12px] font-semibold text-[#0F172A]">{d.name}</p>
      <p className="text-[12px] text-[#475569]">{fmtBRL(d.value ?? 0)} · {d.payload?.pct ?? 0}%</p>
    </div>
  )
}

interface LineTEntry { dataKey?: string | number; value?: number; color?: string }
interface LineTooltipProps { active?: boolean; payload?: LineTEntry[]; label?: string }
const LINE_LABELS: Record<string, string> = { total: 'Total', fixas: 'Fixas', variaveis: 'Variáveis' }

function LineTooltip({ active, payload, label }: LineTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2.5 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      {payload.map((e) => (
        <p key={String(e.dataKey)} className="text-[12px]" style={{ color: e.color }}>
          {LINE_LABELS[String(e.dataKey)] ?? String(e.dataKey)}: {fmtBRL(e.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DespesasSection() {
  const [mounted, setMounted]           = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#0F172A]">Análise de Despesas</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Jun 2026 · Total: {fmtBRL(TOTAL_DESPESAS)}</p>
        </div>
        <span className="shrink-0 rounded-md bg-[#FEF2F2] px-2.5 py-1 text-[12px] font-semibold text-[#DC2626]">
          ↑ +2,3% vs mês anterior
        </span>
      </div>

      {!mounted ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" aria-hidden="true">
          <div className="h-64 animate-pulse rounded-lg bg-[#F1F5F9]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#F1F5F9]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* ── Donut: por categoria ── */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
            <div className="border-b border-[#E2E8F0] px-5 py-3.5">
              <h4 className="text-[13px] font-semibold text-[#0F172A]">Por Categoria</h4>
              <p className="mt-0.5 text-[11px] text-[#475569]">Jun 2026</p>
            </div>
            <div className="flex items-center gap-4 px-5 pb-5 pt-4">
              {/* Pie */}
              <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={MOCK_DESPESAS_CATEGORIA} dataKey="valor" nameKey="nome"
                      cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                      strokeWidth={2} stroke="#fff" isAnimationActive={!prefersReduced}
                    >
                      {MOCK_DESPESAS_CATEGORIA.map((d, i) => <Cell key={i} fill={d.cor} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="tabular-nums text-[12px] font-bold text-[#0F172A]">{fmtBRL(TOTAL_DESPESAS)}</span>
                  <span className="text-[9px] text-[#64748B]">total</span>
                </div>
              </div>
              {/* Legend */}
              <ul className="min-w-0 flex-1 space-y-1.5" aria-label="Categorias de despesas">
                {MOCK_DESPESAS_CATEGORIA.map((d) => (
                  <li key={d.nome} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.cor }} aria-hidden="true" />
                      <span className="truncate text-[11px] text-[#475569]">{d.nome}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums text-[11px] font-medium text-[#0F172A]">{fmtBRL(d.valor)}</span>
                      <span className="w-6 text-right text-[11px] text-[#64748B]">{d.pct}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Line chart: evolução mensal ── */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
            <div className="border-b border-[#E2E8F0] px-5 py-3.5">
              <h4 className="text-[13px] font-semibold text-[#0F172A]">Evolução Mensal de Despesas</h4>
              <p className="mt-0.5 text-[11px] text-[#475569]">Total · Fixas · Variáveis</p>
            </div>
            <div className="px-5 pb-4 pt-5">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MOCK_DESPESAS_MENSAL}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={48}
                    tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<LineTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} iconType="plainline" iconSize={16} />
                  <Line type="monotone" dataKey="total"     name="Total"     stroke="#EF4444" strokeWidth={2}   dot={false} isAnimationActive={!prefersReduced} />
                  <Line type="monotone" dataKey="fixas"     name="Fixas"     stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={!prefersReduced} />
                  <Line type="monotone" dataKey="variaveis" name="Variáveis" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={!prefersReduced} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
