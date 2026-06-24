'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
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
  { dia: 'Seg', manha: 18, tarde: 24, noite: 8  },
  { dia: 'Ter', manha: 22, tarde: 28, noite: 10 },
  { dia: 'Qua', manha: 20, tarde: 31, noite: 12 },
  { dia: 'Qui', manha: 24, tarde: 35, noite: 14 },
  { dia: 'Sex', manha: 30, tarde: 42, noite: 18 },
  { dia: 'Sáb', manha: 38, tarde: 45, noite: 22 },
  { dia: 'Dom', manha: 14, tarde: 18, noite: 5  },
]

const SERIES = [
  { key: 'manha', label: 'Manhã',  color: '#BFDBFE' },
  { key: 'tarde', label: 'Tarde',  color: '#3B82F6' },
  { key: 'noite', label: 'Noite',  color: '#1E3A5F' },
] as const

type SeriesKey = (typeof SERIES)[number]['key']

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + ((p.value as number) ?? 0), 0)
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      {[...payload].reverse().map((entry) => (
        <p key={entry.dataKey} className="text-[12px]" style={{ color: entry.color }}>
          {SERIES.find((s) => s.key === entry.dataKey)?.label ?? entry.dataKey}: {entry.value}
        </p>
      ))}
      <p className="mt-1 border-t border-[#F1F5F9] pt-1 text-[11px] font-medium text-[#475569]">
        Total: {total}
      </p>
    </div>
  )
}

export default function VolumeChart() {
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
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Volume por Período</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Agendamentos por dia da semana</p>
        </div>
        <span className="rounded-sm bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
          Esta semana
        </span>
      </div>

      <div className="px-5 pb-4 pt-5">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={DATA}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="dia"
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
              iconType="square"
              iconSize={8}
            />
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key as SeriesKey}
                name={s.label}
                stackId="1"
                stroke={s.color}
                fill={s.color}
                fillOpacity={1}
                strokeWidth={1}
                isAnimationActive={!prefersReduced}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
