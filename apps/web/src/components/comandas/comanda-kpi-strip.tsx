'use client'

import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateSubtotal, calculateDiscount, calculateTotal, formatBRL } from '@/lib/business-rules'
import type { Comanda, ComandasFilter } from '@/lib/comanda-mock'

// ─── Config ───────────────────────────────────────────────────────────────────

interface CardConfig {
  filter: ComandasFilter | null  // null = "Total" (no filter, just info)
  label: string
  accentBg: string
  accentBorder: string
  accentText: string
}

const CARD_CFG: CardConfig[] = [
  { filter: null,                label: 'Total',          accentBg: '#F8FAFC', accentBorder: '#CBD5E1', accentText: '#475569' },
  { filter: 'OPEN_IN_PROGRESS', label: 'Abertas',         accentBg: '#EFF6FF', accentBorder: '#2563EB', accentText: '#2563EB' },
  { filter: 'AWAITING_PAYMENT', label: 'Aguard. Pagto',   accentBg: '#FFFBEB', accentBorder: '#D97706', accentText: '#D97706' },
  { filter: 'PAID',             label: 'Pagas',           accentBg: '#F0FDF4', accentBorder: '#16A34A', accentText: '#16A34A' },
  { filter: 'CANCELLED',        label: 'Canceladas',      accentBg: '#FEF2F2', accentBorder: '#DC2626', accentText: '#DC2626' },
]

function comTotal(c: Comanda): number {
  const sub = calculateSubtotal(c.items)
  return calculateTotal(sub, calculateDiscount(sub, c.discount))
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ComandaKpiStripProps {
  comandas: Comanda[]
  activeFilter: ComandasFilter
  onFilterChange: (f: ComandasFilter) => void
  onNew: () => void
}

export default function ComandaKpiStrip({
  comandas,
  activeFilter,
  onFilterChange,
  onNew,
}: ComandaKpiStripProps) {
  const stats = useMemo(() => {
    const total = comandas.length
    const open  = comandas.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length
    const awPmt = comandas.filter((c) => c.status === 'AWAITING_PAYMENT')
    const paid  = comandas.filter((c) => c.status === 'PAID')
    const canc  = comandas.filter((c) => c.status === 'CANCELLED').length

    return {
      total,
      open,
      openPct: total > 0 ? Math.round((open / total) * 100) : 0,
      awCount: awPmt.length,
      awAmt:   awPmt.reduce((s, c) => s + comTotal(c), 0),
      paidCount: paid.length,
      paidAmt:   paid.reduce((s, c) => s + comTotal(c), 0),
      canc,
    }
  }, [comandas])

  const cards: Array<{ cfg: CardConfig; value: number | string; sub: string }> = [
    { cfg: CARD_CFG[0], value: stats.total,    sub: 'no total hoje' },
    { cfg: CARD_CFG[1], value: stats.open,     sub: `${stats.openPct}% do total` },
    { cfg: CARD_CFG[2], value: stats.awCount,  sub: `${formatBRL(stats.awAmt)} pendente` },
    { cfg: CARD_CFG[3], value: stats.paidCount, sub: `${formatBRL(stats.paidAmt)} recebido` },
    { cfg: CARD_CFG[4], value: stats.canc,      sub: stats.canc === 1 ? '1 cancelada' : `${stats.canc} canceladas` },
  ]

  return (
    <div className="shrink-0 border-b border-[#E2E8F0] bg-white">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={onNew}
          aria-label="Nova comanda"
          className={cn(
            'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5',
            'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          )}
        >
          <Plus size={13} aria-hidden="true" />
          Nova Comanda
        </button>
      </div>

      {/* KPI cards row */}
      <div className="grid w-full grid-cols-2 gap-3 px-5 pb-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {cards.map(({ cfg, value, sub }) => {
          const isActive = cfg.filter !== null && activeFilter === cfg.filter
          const canClick = cfg.filter !== null

          return (
            <button
              key={cfg.label}
              type="button"
              disabled={!canClick}
              onClick={() => {
                if (!cfg.filter) return
                onFilterChange(isActive ? 'ALL' : cfg.filter)
              }}
              aria-pressed={isActive}
              className={cn(
                'flex flex-1 flex-col rounded-xl border-2 p-5 text-left transition-all duration-150 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                canClick ? 'cursor-pointer' : 'cursor-default',
                isActive
                  ? 'shadow-sm'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] hover:border-[#94A3B8] hover:bg-white',
              )}
              style={
                isActive
                  ? { backgroundColor: cfg.accentBg, borderColor: cfg.accentBorder }
                  : undefined
              }
            >
              <span
                className="font-tabular text-3xl font-bold leading-none"
                style={{ color: isActive ? cfg.accentText : '#0F172A' }}
              >
                {value}
              </span>
              <span
                className="mt-1.5 text-sm font-semibold"
                style={{ color: isActive ? cfg.accentText : '#0F172A' }}
              >
                {cfg.label}
              </span>
              <span className="mt-0.5 text-[11px]" style={{ color: isActive ? cfg.accentText : '#94A3B8' }}>
                {sub}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
