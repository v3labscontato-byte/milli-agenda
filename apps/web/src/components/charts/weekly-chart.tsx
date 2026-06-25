'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useRevenueReport } from '@/hooks/use-relatorios'

interface TooltipEntry {
  value?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

const brl = (n = 0) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[12px] text-[#2563EB]">{brl(payload[0]?.value)}</p>
    </div>
  )
}

function Frame({ total, children }: { total: number | null; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Receita no Período</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Pagamentos recebidos por dia</p>
        </div>
        {total != null && (
          <span className="rounded-sm bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#065F46]">
            {brl(total)}
          </span>
        )}
      </div>
      <div className="px-5 pb-4 pt-5">{children}</div>
    </div>
  )
}

export default function WeeklyChart() {
  const { data, loading, error } = useRevenueReport()
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

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <Frame total={total}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            dataKey="total"
            name="Receita"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2563EB' }}
            activeDot={{ r: 4 }}
            isAnimationActive={!prefersReduced}
          />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  )
}
