'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateSubtotal, calculateDiscount, calculateTotal, formatBRL } from '@/lib/business-rules'
import { KpiPeriodFilter } from '@/components/shared/kpi-card'
import type { Comanda, ComandasFilter } from '@/lib/comanda-mock'

// ─── Config ───────────────────────────────────────────────────────────────────

interface CardConfig {
  filter: ComandasFilter
  label: string
  activeBg: string
  activeBorder: string
  activeText: string
  clickable: boolean
}

const CARD_CFG: CardConfig[] = [
  { filter: 'ALL',              label: 'Total',         activeBg: '#EFF6FF',  activeBorder: '#2563EB', activeText: '#2563EB', clickable: true  },
  { filter: 'OPEN_IN_PROGRESS', label: 'Abertas',        activeBg: '#DBEAFE',  activeBorder: '#2563EB', activeText: '#2563EB', clickable: true  },
  { filter: 'AWAITING_PAYMENT', label: 'Aguard. Pagto',  activeBg: '#FEF9C3',  activeBorder: '#CA8A04', activeText: '#CA8A04', clickable: true  },
  { filter: 'PAID',             label: 'Pagas',          activeBg: '#DCFCE7',  activeBorder: '#16A34A', activeText: '#16A34A', clickable: true  },
  { filter: 'CANCELLED',        label: 'Canceladas',     activeBg: '#FEE2E2',  activeBorder: '#DC2626', activeText: '#DC2626', clickable: true  },
  { filter: 'ALL',              label: 'Receita',        activeBg: '#DCFCE7',  activeBorder: '#16A34A', activeText: '#16A34A', clickable: false },
]

const PERIOD_OPTIONS = [
  { key: 'hoje',   label: 'Hoje'        },
  { key: 'semana', label: 'Esta semana' },
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
  const [period, setPeriod] = useState('hoje')

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
      receita: [...awPmt, ...paid].reduce((s, c) => s + comTotal(c), 0),
    }
  }, [comandas])

  const cardValues: Array<{ value: number | string; sub: string }> = [
    { value: stats.total,                     sub: 'no período'                                           },
    { value: stats.open,                      sub: `${stats.openPct}% do total`                          },
    { value: stats.awCount,                   sub: `${formatBRL(stats.awAmt)} pendente`                  },
    { value: stats.paidCount,                 sub: `${formatBRL(stats.paidAmt)} recebido`                },
    { value: stats.canc,                      sub: stats.canc === 1 ? '1 cancelada' : `${stats.canc} canceladas` },
    { value: formatBRL(stats.receita),        sub: 'pago + a receber'                                    },
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
        <KpiPeriodFilter options={PERIOD_OPTIONS} active={period} onChange={setPeriod} />
      </div>

      {/* KPI cards grid */}
      <div className="grid w-full grid-cols-2 gap-3 px-5 pb-4 sm:grid-cols-3 xl:grid-cols-6">
        {CARD_CFG.map((cfg, i) => {
          const { value, sub } = cardValues[i]
          const isActive = cfg.clickable && activeFilter === cfg.filter
          const isReceita = !cfg.clickable

          return (
            <button
              key={`${cfg.label}-${i}`}
              type="button"
              disabled={isReceita}
              onClick={() => {
                if (!cfg.clickable) return
                onFilterChange(isActive ? 'ALL' : cfg.filter)
              }}
              aria-pressed={cfg.clickable ? isActive : undefined}
              className={cn(
                'flex flex-col rounded-xl border p-4 text-left transition-all duration-150 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                cfg.clickable ? 'cursor-pointer' : 'cursor-default',
                isActive
                  ? 'shadow-sm'
                  : 'border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]',
                cfg.clickable && !isActive && 'hover:border-[#94A3B8]',
              )}
              style={isActive ? { backgroundColor: cfg.activeBg, borderColor: cfg.activeBorder } : undefined}
            >
              <span className="text-[11px] font-medium text-[#64748B]">{cfg.label}</span>
              <span
                className="mt-1.5 font-tabular text-[22px] font-bold leading-none"
                style={{ color: isActive ? cfg.activeText : '#0F172A' }}
              >
                {value}
              </span>
              <span
                className="mt-1 text-[11px]"
                style={{ color: isActive ? cfg.activeText : '#94A3B8' }}
              >
                {sub}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
