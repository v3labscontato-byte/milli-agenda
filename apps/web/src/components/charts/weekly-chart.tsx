'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
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
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

const DATA = [
  { semana: 'S1',  atual: 38, anterior: 31 },
  { semana: 'S2',  atual: 42, anterior: 38 },
  { semana: 'S3',  atual: 35, anterior: 40 },
  { semana: 'S4',  atual: 50, anterior: 37 },
  { semana: 'S5',  atual: 47, anterior: 45 },
  { semana: 'S6',  atual: 53, anterior: 49 },
  { semana: 'S7',  atual: 60, anterior: 52 },
  { semana: 'S8',  atual: 58, anterior: 56 },
]

function pct(atual: number, anterior: number): string {
  if (anterior === 0) return '—'
  const diff = ((atual - anterior) / anterior) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const atual = payload.find((p) => p.dataKey === 'atual')?.value ?? 0
  const anterior = payload.find((p) => p.dataKey === 'anterior')?.value ?? 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[12px] text-[#2563EB]">Esta semana: {atual}</p>
      <p className="text-[12px] text-[#94A3B8]">Semana anterior: {anterior}</p>
      <p className="mt-1 text-[11px] font-medium text-[#475569]">
        Variação: {pct(atual as number, anterior as number)}
      </p>
    </div>
  )
}

export default function WeeklyChart() {
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
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Tendência Semanal</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Últimas 8 semanas</p>
        </div>
        <span className="rounded-sm bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#065F46]">
          +3.6% vs ant.
        </span>
      </div>

      <div className="px-5 pb-4 pt-5">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={DATA}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="semana"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }}
              iconSize={8}
            />
            <Line
              dataKey="atual"
              name="Esta semana"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 3, fill: '#2563EB' }}
              activeDot={{ r: 4 }}
              isAnimationActive={!prefersReduced}
            />
            <Line
              dataKey="anterior"
              name="Semana anterior"
              stroke="#CBD5E1"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 3, fill: '#CBD5E1' }}
              activeDot={{ r: 4 }}
              isAnimationActive={!prefersReduced}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
