import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KpiData } from '@/lib/mock-data'

// Skeleton tile shown while data loads
function KpiTileSkeleton() {
  return (
    <div className="bg-white px-6 py-4" aria-hidden="true">
      <div className="h-8 w-16 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
      <div className="mt-2 h-3 w-28 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
      <div className="mt-2 h-3 w-20 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
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
        : 'text-[#475569]'

  const TrendIcon =
    kpi.trendUp === true ? TrendingUp : kpi.trendUp === false ? TrendingDown : Minus

  // flex-col + CSS order: dt precedes dd in HTML (spec requires it), order utilities flip visual position
  return (
    <div className="flex flex-col bg-white px-6 py-4">
      <dt className="order-2 mt-1 text-[12px] font-medium text-[#475569]">{kpi.label}</dt>
      <dd className="order-1 text-kpi font-tabular text-[#0F172A]">{kpi.value}</dd>
      {kpi.trend && (
        <div className={cn('order-3 mt-1.5 flex items-center gap-1 text-[11px] font-medium', trendColor)}>
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
