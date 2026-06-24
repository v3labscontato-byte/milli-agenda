import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KpiData } from '@/lib/mock-data'

// Skeleton tile shown while data loads
function KpiTileSkeleton() {
  return (
    <div className="bg-white px-6 py-4" aria-hidden="true">
      <div className="h-8 w-16 animate-pulse rounded bg-[#F1F5F9]" />
      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-[#F1F5F9]" />
      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[#F1F5F9]" />
    </div>
  )
}

interface KpiTileProps {
  kpi: KpiData
}

function KpiTile({ kpi }: KpiTileProps) {
  const trendColor =
    kpi.trendUp === true
      ? 'text-[#065F46]'
      : kpi.trendUp === false
        ? 'text-[#991B1B]'
        : 'text-[#94A3B8]'

  const TrendIcon =
    kpi.trendUp === true ? TrendingUp : kpi.trendUp === false ? TrendingDown : Minus

  return (
    <div className="bg-white px-6 py-4">
      {/* KPI value — 28px/700/-0.02em (text-kpi from tailwind.config.ts) */}
      <dd className="text-kpi font-tabular text-[#0F172A]">{kpi.value}</dd>
      {/* Caption label — 11px/500/uppercase/+0.06em */}
      <dt className="mt-1 text-[12px] font-medium text-[#64748B]">{kpi.label}</dt>
      {kpi.trend && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-medium', trendColor)}>
          <TrendIcon size={11} aria-hidden="true" />
          <span>{kpi.trend}</span>
        </div>
      )}
    </div>
  )
}

interface KpiStripProps {
  kpis: KpiData[]
  isLoading?: boolean
}

export default function KpiStrip({ kpis, isLoading = false }: KpiStripProps) {
  return (
    // gap-px + bg-[#E2E8F0] creates 1px dividers between cells without explicit borders
    // This avoids the "identical floating card grid" pattern while preserving separation
    <dl
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#E2E8F0] xl:grid-cols-4',
        'bg-[#E2E8F0] shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]',
      )}
      aria-label="Métricas do dia"
    >
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <KpiTileSkeleton key={i} />)
        : kpis.map((kpi) => <KpiTile key={kpi.label} kpi={kpi} />)}
    </dl>
  )
}
