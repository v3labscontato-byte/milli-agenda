'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TooltipEntry {
  dataKey?: string | number
  value?: number
  color?: string
  name?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

const DATA = [
  { mes: 'Jan', realizados: 142, cancelados: 18, finalizados: 124 },
  { mes: 'Fev', realizados: 158, cancelados: 21, finalizados: 137 },
  { mes: 'Mar', realizados: 175, cancelados: 14, finalizados: 161 },
  { mes: 'Abr', realizados: 163, cancelados: 25, finalizados: 138 },
  { mes: 'Mai', realizados: 191, cancelados: 17, finalizados: 174 },
  { mes: 'Jun', realizados: 204, cancelados: 22, finalizados: 182 },
]

const SERIES = [
  { key: 'realizados', label: 'Realizados', color: '#2563EB' },
  { key: 'cancelados', label: 'Cancelados', color: '#EF4444' },
  { key: 'finalizados', label: 'Finalizados', color: '#10B981' },
] as const

type SeriesKey = (typeof SERIES)[number]['key']

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-[12px]" style={{ color: entry.color }}>
          {SERIES.find((s) => s.key === entry.dataKey)?.label ?? entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="flex items-end justify-between gap-2 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-end gap-0.5">
            <div
              className="flex-1 animate-pulse motion-reduce:animate-none rounded-t bg-[#F1F5F9]"
              style={{ height: `${60 + i * 10}px` }}
            />
            <div
              className="flex-1 animate-pulse motion-reduce:animate-none rounded-t bg-[#F1F5F9]"
              style={{ height: `${20 + i * 3}px` }}
            />
            <div
              className="flex-1 animate-pulse motion-reduce:animate-none rounded-t bg-[#F1F5F9]"
              style={{ height: `${50 + i * 9}px` }}
            />
          </div>
        ))}
      </div>
      <div className="h-3 w-48 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
    </div>
  )
}

export default function BookingsChart() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Agendamentos Mensais</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Jan – Jun 2025</p>
        </div>
        <span className="rounded-sm bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
          6 meses
        </span>
      </div>

      <div className="px-5 pb-4 pt-5">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={DATA} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }}
              iconType="square"
              iconSize={8}
            />
            {SERIES.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key as SeriesKey}
                name={s.label}
                fill={s.color}
                radius={[3, 3, 0, 0]}
                isAnimationActive={!prefersReduced}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
