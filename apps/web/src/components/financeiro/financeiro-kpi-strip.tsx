'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinanceiroKpis } from '@/lib/financeiro-mock'

function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

function progressColor(pct: number): string {
  if (pct >= 100) return '#10B981'
  if (pct >= 70)  return '#2563EB'
  if (pct >= 50)  return '#F59E0B'
  return '#EF4444'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetaBarProps {
  atual: number
  meta: number
  diasRestantes?: number
}

function MetaBar({ atual, meta, diasRestantes }: MetaBarProps) {
  const pct = meta > 0 ? Math.min(Math.round((atual / meta) * 100), 100) : 0
  const color = progressColor(pct)
  const faltam = Math.max(meta - atual, 0)
  const porDia = diasRestantes && diasRestantes > 0 && faltam > 0 ? Math.ceil(faltam / diasRestantes) : null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <span className="text-[#475569]">Meta: {fmtBRL(meta)}</span>
        <span className="font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]" aria-hidden="true">
        <div className="h-full rounded-full transition-all motion-reduce:transition-none" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      {faltam > 0 && (
        <p className="text-[10px] text-[#64748B]">
          Faltam {fmtBRL(faltam)}{porDia ? ` · ${fmtBRL(porDia)}/dia` : ''}
        </p>
      )}
      {faltam === 0 && <p className="text-[10px] font-medium text-[#10B981]">Meta atingida!</p>}
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: 'default' | 'blue' | 'green' | 'red'
  progress?: number
  meta?: number
  valorNum?: number
  diasRestantes?: number
}

function KpiCard({ label, value, sub, trend, trendUp, color = 'default', progress, meta, valorNum, diasRestantes }: KpiCardProps) {
  const bg = color === 'blue' ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]'
  const vc = color === 'blue' ? 'text-[#2563EB]' : color === 'green' ? 'text-[#16A34A]' : color === 'red' ? 'text-[#DC2626]' : 'text-[#0F172A]'
  return (
    <div className={cn('flex flex-col rounded-xl border p-4', bg)}>
      <p className="text-[11px] font-medium text-[#64748B]">{label}</p>
      <p className={cn('mt-1.5 font-tabular text-[22px] font-bold leading-none', vc)}>{value}</p>
      {/* Simple progress bar (for Meta Atingida card) */}
      {progress !== undefined && meta === undefined && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]" aria-hidden="true">
          <div className={cn('h-full rounded-full transition-all motion-reduce:transition-none', color === 'green' ? 'bg-[#16A34A]' : 'bg-[#2563EB]')}
            style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      {/* Meta progress bar (only when a goal is configured) */}
      {meta !== undefined && meta > 0 && valorNum !== undefined && (
        <MetaBar atual={valorNum} meta={meta} diasRestantes={diasRestantes} />
      )}
      {sub && <p className="mt-1 text-[11px] text-[#64748B]">{sub}</p>}
      {trend !== undefined && (
        <p className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-medium', trendUp ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
          {trendUp ? <TrendingUp size={10} aria-hidden="true" /> : <TrendingDown size={10} aria-hidden="true" />}
          {trend}
        </p>
      )}
    </div>
  )
}

// ─── Strip ────────────────────────────────────────────────────────────────────

interface FinanceiroKpiStripProps {
  kpis: FinanceiroKpis
}

export default function FinanceiroKpiStrip({ kpis }: FinanceiroKpiStripProps) {
  // Days remaining to end of working week (Sat) for "por dia" hint
  const dow = new Date().getDay() // 0=Sun, 1=Mon,..., 6=Sat
  const daysToSat = dow === 0 ? 0 : Math.max(6 - dow, 0)

  // Days remaining in month
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysToMonthEnd = Math.max(lastDay - today.getDate(), 0)

  return (
    <div className="space-y-3" role="region" aria-label="Indicadores financeiros">
      {/* Business health */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Receita Bruta"   value={fmtBRL(kpis.receitaBruta)}  trend={kpis.receitaMesTrend}  trendUp={kpis.receitaMesTrendUp} color="blue" />
        <KpiCard label="Despesas"        value={fmtBRL(kpis.despesas)}       sub="custo total"              color="red" />
        <KpiCard label="Lucro Líquido"   value={fmtBRL(kpis.lucroLiquido)}   trend="+8% vs mês ant."        trendUp color="green" />
        <KpiCard label="Margem"          value={`${kpis.margem}%`}            sub="lucro / receita" />
        <KpiCard label="Meta Atingida"   value={`${kpis.metaAting}%`}         progress={kpis.metaAting}      color="green" />
        <KpiCard label="Inadimplência"   value={`${kpis.inadimplenciaPct}%`}  sub={kpis.inadimplenciaPct > 5 ? 'Acima do limite' : 'Dentro do limite'} color={kpis.inadimplenciaPct > 5 ? 'red' : 'default'} />
      </div>

      {/* Operational — with meta progress */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Receita de Hoje"
          value={fmtBRL(kpis.receitaHoje)}
          trend={kpis.receitaHojeTrend}
          trendUp={kpis.receitaHojeTrendUp}
          meta={kpis.metaDiaria}
          valorNum={kpis.receitaHoje}
        />
        <KpiCard
          label="Receita da Semana"
          value={fmtBRL(kpis.receitaSemana)}
          meta={kpis.metaSemanal}
          valorNum={kpis.receitaSemana}
          diasRestantes={daysToSat}
        />
        <KpiCard
          label="Receita do Mês"
          value={fmtBRL(kpis.receitaMes)}
          trend={kpis.receitaMesTrend}
          trendUp={kpis.receitaMesTrendUp}
          meta={kpis.metaMensal}
          valorNum={kpis.receitaMes}
          diasRestantes={daysToMonthEnd}
        />
        <KpiCard label="A Receber"        value={fmtBRL(kpis.aReceber)}       sub={`${kpis.pendingCount} pendentes`} />
        <KpiCard label="Taxa Recebimento" value={`${kpis.taxaRecebimento}%`}  sub={`Meta: ${kpis.taxaMeta}%`} trend={`vs ${kpis.taxaMeta}% meta`} trendUp={kpis.taxaTrendUp} />
        <KpiCard label="Ticket Médio"     value={fmtBRL(kpis.ticketMedio)}    trend={kpis.ticketTrend} trendUp={kpis.ticketTrendUp} />
      </div>
    </div>
  )
}
