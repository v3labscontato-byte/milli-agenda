'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import {
  MOCK_PROCEDIMENTOS, MOCK_PROF_RANKING, MOCK_PRODUTOS,
  type ProcedimentoRanking, type ProfissionalRanking, type ProdutoRanking,
} from '@/lib/financeiro-mock'
import { FEATURES } from '@/lib/features'
import type { ServiceRankRow } from '@/hooks/use-relatorios'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

const MONTHS = [
  { key:'jan-26', label:'Jan/26' }, { key:'fev-26', label:'Fev/26' },
  { key:'mar-26', label:'Mar/26' }, { key:'abr-26', label:'Abr/26' },
  { key:'mai-26', label:'Mai/26' }, { key:'jun-26', label:'Jun/26' },
]

const PROC_COLORS  = ['#1D4ED8','#2563EB','#3B82F6','#5090F8','#60A5FA','#74B2FB','#93C5FD','#A5D0FE','#BAE0FF','#D0EDFF']
const PROF_COLORS  = ['#7C3AED','#9333EA','#A855F7','#C084FC','#D8B4FE']
const PROD_COLORS  = ['#16A34A','#22C55E','#4ADE80','#86EFAC','#BBF7D0']

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

interface HBarProps<T extends { nome: string; receita: number }> {
  data: T[]
  colors: readonly string[]
  yWidth?: number
  reduced?: boolean
  height?: number
}

function HBar<T extends { nome: string; receita: number }>({ data, colors, yWidth = 130, reduced = false, height = 200 }: HBarProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="#F1F5F9" />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="nome" width={yWidth} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [fmtBRL(Number(v ?? 0)), 'Receita']}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0' }}
          cursor={{ fill: '#F8FAFC' }}
        />
        <Bar dataKey="receita" radius={[0, 3, 3, 0]} isAnimationActive={!reduced}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length] ?? '#2563EB'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Procedures panel ─────────────────────────────────────────────────────────

function ProcedimentosPanel({ data, reduced }: { data: ProcedimentoRanking[]; reduced: boolean }) {
  const total = data.reduce((s, p) => s + p.receita, 0)
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="border-b border-[#E2E8F0] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Top 10 Procedimentos</h3>
        <p className="mt-0.5 text-[12px] text-[#475569]">Total: {fmtBRL(total)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]" aria-label="Ranking de procedimentos">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {['#','Procedimento','Qtd','Receita','%'].map((h) => (
                <th key={h} className={cn('px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                  ['Receita','%'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={p.rank} className={cn('hover:bg-[#F8FAFC]', i < data.length - 1 && 'border-b border-[#F1F5F9]')}>
                <td className="px-4 py-2 text-[12px] font-bold" style={{ color: PROC_COLORS[i] }}>#{p.rank}</td>
                <td className="px-4 py-2 text-[12px] font-medium text-[#0F172A]">{p.nome}</td>
                <td className="px-4 py-2 text-[12px] text-[#475569]">{p.qtd}x</td>
                <td className="px-4 py-2 text-right font-tabular text-[12px] font-semibold text-[#0F172A]">{fmtBRL(p.receita)}</td>
                <td className="px-4 py-2 text-right">
                  <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">{p.pct}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#F1F5F9] px-5 pb-4 pt-4">
        <HBar data={data} colors={PROC_COLORS} yWidth={128} reduced={reduced} height={220} />
      </div>
    </div>
  )
}

// ─── Professionals panel ──────────────────────────────────────────────────────

function ProfissionaisPanel({ data, reduced }: { data: ProfissionalRanking[]; reduced: boolean }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="border-b border-[#E2E8F0] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Top Profissionais</h3>
        <p className="mt-0.5 text-[12px] text-[#475569]">Faturamento + avaliação</p>
      </div>
      <ul className="divide-y divide-[#F1F5F9]">
        {data.map((p, i) => {
          const pct = Math.round((p.receita / data[0].receita) * 100)
          return (
            <li key={p.rank} className="flex items-center gap-3 px-5 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: p.avatarBg }}>{p.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-[#0F172A]">{p.nome}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[11px] text-[#F59E0B]">★</span>
                    <span className="text-[11px] font-semibold text-[#0F172A]">{p.avaliacao.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PROF_COLORS[i] }} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-tabular text-[11px] font-semibold text-[#0F172A]">{fmtBRL(p.receita)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#64748B]">{p.atendimentos} atendimentos</p>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="border-t border-[#F1F5F9] px-5 pb-4 pt-4">
        <HBar data={data} colors={PROF_COLORS} yWidth={100} reduced={reduced} height={140} />
      </div>
    </div>
  )
}

// ─── Products panel ───────────────────────────────────────────────────────────

function ProdutosPanel({ data, reduced }: { data: ProdutoRanking[]; reduced: boolean }) {
  const total = data.reduce((s, p) => s + p.receita, 0)
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="border-b border-[#E2E8F0] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Top Produtos</h3>
        <p className="mt-0.5 text-[12px] text-[#475569]">Total vendido: {fmtBRL(total)}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 px-5 py-5">
        <ul className="space-y-3">
          {data.map((p, i) => {
            const pct = Math.round((p.receita / data[0].receita) * 100)
            return (
              <li key={p.rank} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ backgroundColor: PROD_COLORS[i] }}>{p.rank}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-medium text-[#0F172A]">{p.nome}</p>
                    <span className="shrink-0 font-tabular text-[12px] font-semibold text-[#0F172A]">{fmtBRL(p.receita)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PROD_COLORS[i] }} />
                    </div>
                    <span className="shrink-0 text-[11px] text-[#64748B]">{p.qtd}x</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <HBar data={data} colors={PROD_COLORS} yWidth={140} reduced={reduced} height={160} />
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface ProcedimentosSectionProps {
  realData?: ServiceRankRow[]
  loading?: boolean
  error?: string | null
}

export default function ProcedimentosSection({ realData, loading, error }: ProcedimentosSectionProps) {
  const [mesSel, setMesSel] = useState('jun-26')
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  // All months show same mock data; sorted by receita for chart
  const procedimentos = useMemo(() => [...MOCK_PROCEDIMENTOS].sort((a, b) => b.receita - a.receita), [])
  const profissionais  = useMemo(() => [...MOCK_PROF_RANKING].sort((a, b) => b.receita - a.receita), [])
  const produtos       = useMemo(() => [...MOCK_PRODUTOS].sort((a, b) => b.receita - a.receita), [])

  if (FEATURES.realRelatorios) {
    if (error) return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="text-[13px] text-[#DC2626]">Erro ao carregar procedimentos. Tente novamente.</p>
      </div>
    )
    if (loading) return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="text-[13px] text-[#64748B]">Carregando…</p>
      </div>
    )
    if (!realData || realData.length === 0) return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="text-[13px] text-[#475569] font-medium">Sem procedimentos no período.</p>
        <p className="mt-1 text-[12px] text-[#94A3B8]">Os dados aparecerão assim que houver comandas fechadas.</p>
      </div>
    )
    const total = realData.reduce((s, p) => s + p.receita, 0)
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Top Procedimentos</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Total: {fmtBRL(total)} no período</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]" aria-label="Ranking de procedimentos">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['#', 'Procedimento', 'Qtd', 'Receita', '%'].map((h) => (
                  <th key={h} className={cn('px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                    ['Receita', '%'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {realData.map((p, i) => (
                <tr key={p.rank} className={cn('hover:bg-[#F8FAFC]', i < realData.length - 1 && 'border-b border-[#F1F5F9]')}>
                  <td className="px-4 py-2 text-[12px] font-bold" style={{ color: PROC_COLORS[i] }}>#{p.rank}</td>
                  <td className="px-4 py-2 text-[12px] font-medium text-[#0F172A]">{p.nome}</td>
                  <td className="px-4 py-2 text-[12px] text-[#475569]">{p.qtd}x</td>
                  <td className="px-4 py-2 text-right font-tabular text-[12px] font-semibold text-[#0F172A]">{fmtBRL(p.receita)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
                      {total > 0 ? ((p.receita / total) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F1F5F9] px-5 pb-4 pt-4">
          <HBar data={realData} colors={PROC_COLORS} yWidth={128} reduced={reduced} height={Math.max(120, realData.length * 28)} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header + month filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Faturamento por Procedimento</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Rankings do período selecionado</p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar mês">
          {MONTHS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setMesSel(key)} aria-pressed={mesSel === key}
              className={cn('rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                mesSel === key ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures + Professionals grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ProcedimentosPanel data={procedimentos} reduced={reduced} />
        <ProfissionaisPanel data={profissionais} reduced={reduced} />
      </div>

      {/* Products */}
      <ProdutosPanel data={produtos} reduced={reduced} />
    </div>
  )
}
