'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useBookingsByStatus } from '@/hooks/use-relatorios'

interface TooltipEntry {
  value?: number
  payload?: { label?: string; count?: number }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:        '#94A3B8',
  CONFIRMED:        '#2563EB',
  CHECKED_IN:       '#0891B2',
  IN_SERVICE:       '#7C3AED',
  AWAITING_PAYMENT: '#D97706',
  COMPLETED:        '#10B981',
  NO_SHOW:          '#94A3B8',
  CANCELLED:        '#EF4444',
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-0.5 text-[12px] font-semibold text-[#0F172A]">{d?.label}</p>
      <p className="text-[12px] text-[#475569]">{d?.count} agendamentos</p>
    </div>
  )
}

function Frame({ total, children }: { total: number | null; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Agendamentos por Status</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Distribuição do período atual</p>
        </div>
        {total != null && (
          <span className="rounded-sm bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
            {total} total
          </span>
        )}
      </div>
      <div className="px-5 pb-4 pt-5">{children}</div>
    </div>
  )
}

interface BookingsChartProps {
  from?: string
  to?: string
}

export default function BookingsChart({ from, to }: BookingsChartProps) {
  const { data, loading, error } = useBookingsByStatus(from, to)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (loading) {
    return (
      <Frame total={null}>
        <div className="animate-pulse motion-reduce:animate-none h-[240px] w-full rounded-lg bg-[#F1F5F9]" />
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame total={null}>
        <div className="flex h-[240px] items-center justify-center text-sm text-red-500">
          Erro ao carregar. Tente novamente.
        </div>
      </Frame>
    )
  }

  if (data.length === 0) {
    return (
      <Frame total={0}>
        <div className="flex h-[240px] flex-col items-center justify-center text-slate-400">
          <p className="text-sm">Sem informações suficientes para o período</p>
        </div>
      </Frame>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Frame total={total}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={!prefersReduced}>
            {data.map((d) => (
              <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? '#2563EB'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  )
}
