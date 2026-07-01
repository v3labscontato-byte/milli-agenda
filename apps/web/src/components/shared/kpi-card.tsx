'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── KpiCard ──────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: 'default' | 'blue' | 'green' | 'red' | 'yellow'
  progress?: number
}

export function KpiCard({ label, value, sub, trend, trendUp, color = 'default', progress }: KpiCardProps) {
  const bg =
    color === 'blue'
      ? 'border-[#2563EB] bg-[#EFF6FF]'
      : color === 'yellow'
        ? 'border-[#CA8A04] bg-[#FEF9C3]'
        : 'border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]'
  const vc =
    color === 'blue'
      ? 'text-[#2563EB]'
      : color === 'green'
        ? 'text-[#16A34A]'
        : color === 'red'
          ? 'text-[#DC2626]'
          : color === 'yellow'
            ? 'text-[#CA8A04]'
            : 'text-[#0F172A]'
  return (
    <div className={cn('flex flex-col rounded-xl border p-4', bg)}>
      <p className="text-[11px] font-medium text-[#64748B]">{label}</p>
      <p className={cn('mt-1.5 font-tabular text-[22px] font-bold leading-none', vc)}>{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]" aria-hidden="true">
          <div
            className={cn(
              'h-full rounded-full transition-all motion-reduce:transition-none',
              color === 'green' ? 'bg-[#16A34A]' : 'bg-[#2563EB]',
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      {sub && <p className="mt-1 text-[11px] text-[#64748B]">{sub}</p>}
      {trend !== undefined && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 text-[11px] font-medium',
            trendUp ? 'text-[#16A34A]' : 'text-[#DC2626]',
          )}
        >
          {trendUp ? (
            <TrendingUp size={10} aria-hidden="true" />
          ) : (
            <TrendingDown size={10} aria-hidden="true" />
          )}
          {trend}
        </p>
      )}
    </div>
  )
}

// ─── KpiPeriodFilter ──────────────────────────────────────────────────────────

export interface KpiPeriodOption {
  key: string
  label: string
}

export interface KpiPeriodFilterProps {
  options: KpiPeriodOption[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function KpiPeriodFilter({ options, active, onChange, className }: KpiPeriodFilterProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-1', className)}
      role="group"
      aria-label="Período do resumo"
    >
      {options.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={active === key}
          className={cn(
            'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            active === key
              ? 'bg-[#2563EB] text-white'
              : 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
