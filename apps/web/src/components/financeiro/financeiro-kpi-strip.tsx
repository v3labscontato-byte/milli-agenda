'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinanceiroKpis } from '@/lib/financeiro-mock'

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

function TrendChip({ text, up }: { text: string; up: boolean | null }) {
  const Icon = up === null ? Minus : up ? TrendingUp : TrendingDown
  return (
    <p
      className={cn(
        'mt-1.5 flex items-center gap-1 text-[11px] font-medium',
        up === true  && 'text-[#16A34A]',
        up === false && 'text-[#DC2626]',
        up === null  && 'text-[#475569]',
      )}
    >
      <Icon size={10} aria-hidden="true" />
      {text}
    </p>
  )
}

interface KpiCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  trend?: string
  trendUp?: boolean | null
  accent?: boolean
}

function KpiCard({ label, value, sub, trend, trendUp = null, accent }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border p-5',
        accent
          ? 'border-[#2563EB] bg-[#EFF6FF]'
          : 'border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]',
      )}
    >
      <p className="text-[11px] font-medium text-[#64748B]">{label}</p>
      <p
        className={cn(
          'mt-2 font-tabular text-[24px] font-bold leading-none',
          accent ? 'text-[#2563EB]' : 'text-[#0F172A]',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-[#64748B]">{sub}</p>}
      {trend !== undefined && <TrendChip text={trend} up={trendUp ?? null} />}
    </div>
  )
}

interface FinanceiroKpiStripProps {
  kpis: FinanceiroKpis
}

export default function FinanceiroKpiStrip({ kpis }: FinanceiroKpiStripProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5"
      role="region"
      aria-label="Indicadores financeiros"
    >
      <KpiCard
        label="Receita do Mês"
        value={formatBRL(kpis.receitaMes)}
        trend={kpis.receitaMesTrend}
        trendUp={kpis.receitaMesTrendUp}
        accent
      />
      <KpiCard
        label="Receita de Hoje"
        value={formatBRL(kpis.receitaHoje)}
        trend={kpis.receitaHojeTrend}
        trendUp={kpis.receitaHojeTrendUp}
      />
      <KpiCard
        label="A Receber"
        value={formatBRL(kpis.aReceber)}
        sub={`${kpis.pendingCount} pendentes`}
      />
      <KpiCard
        label="Taxa de Recebimento"
        value={`${kpis.taxaRecebimento}%`}
        sub={`Meta: ${kpis.taxaMeta}%`}
        trend={`vs ${kpis.taxaMeta}% meta`}
        trendUp={kpis.taxaTrendUp}
      />
      <KpiCard
        label="Ticket Médio"
        value={formatBRL(kpis.ticketMedio)}
        trend={kpis.ticketTrend}
        trendUp={kpis.ticketTrendUp}
      />
    </div>
  )
}
