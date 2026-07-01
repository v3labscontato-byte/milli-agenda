import { KpiCard } from '@/components/shared/kpi-card'
import type { KpiData } from '@/lib/mock-data'

function KpiTileSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]"
      aria-hidden="true"
    >
      <div className="h-3 w-20 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
      <div className="mt-1.5 h-8 w-16 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
      <div className="mt-1 h-3 w-24 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
    </div>
  )
}

interface KpiStripProps {
  kpis: KpiData[]
  isLoading?: boolean
}

export default function KpiStrip({ kpis, isLoading = false }: KpiStripProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      aria-label="Métricas do dia"
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => <KpiTileSkeleton key={i} />)
        : kpis.map((kpi, i) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend || undefined}
              trendUp={kpi.trendUp ?? undefined}
              color={i === 0 ? 'blue' : 'default'}
            />
          ))}
    </div>
  )
}
