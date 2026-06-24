'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface TooltipEntry {
  name?: string
  value?: number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
}

const DATA = [
  { servico: 'Corte',     quantidade: 312, color: '#2563EB' },
  { servico: 'Escova',    quantidade: 248, color: '#7C3AED' },
  { servico: 'Coloração', quantidade: 187, color: '#DB2777' },
  { servico: 'Manicure',  quantidade: 165, color: '#0891B2' },
  { servico: 'Barba',     quantidade: 134, color: '#059669' },
  { servico: 'Pedicure',  quantidade: 98,  color: '#D97706' },
]

const TOTAL = DATA.reduce((sum, d) => sum + d.quantidade, 0)

function pct(n: number) {
  return ((n / TOTAL) * 100).toFixed(1)
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="text-[12px] font-semibold text-[#0F172A]">{d.name}</p>
      <p className="text-[12px] text-[#475569]">
        {d.value} agendamentos ({pct(d.value as number)}%)
      </p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex items-center gap-6 pt-4" aria-hidden="true">
      <div className="h-40 w-40 shrink-0 animate-pulse motion-reduce:animate-none rounded-full bg-[#F1F5F9]" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse motion-reduce:animate-none rounded-full bg-[#F1F5F9]" />
            <div className="h-3 w-24 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ServicesChart() {
  const [prefersReduced, setPrefersReduced] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Serviços Populares</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Distribuição por tipo · Jan – Jun 2025</p>
        </div>
        <span className="rounded-sm bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
          {TOTAL} total
        </span>
      </div>

      <div className="px-5 pb-5 pt-4">
        {!mounted ? (
          <Skeleton />
        ) : (
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={DATA}
                    dataKey="quantidade"
                    nameKey="servico"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    strokeWidth={2}
                    stroke="#fff"
                    isAnimationActive={!prefersReduced}
                  >
                    {DATA.map((d) => (
                      <Cell key={d.servico} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-tabular text-[20px] font-bold text-[#0F172A]">{TOTAL}</span>
                <span className="text-[10px] text-[#475569]">total</span>
              </div>
            </div>

            {/* Legend */}
            <ul className="flex-1 space-y-1.5" role="list">
              {DATA.map((d) => (
                <li key={d.servico} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[12px] text-[#475569]">{d.servico}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-tabular text-[12px] font-medium text-[#0F172A]">
                      {d.quantidade}
                    </span>
                    <span className="w-9 text-right text-[11px] text-[#475569]">
                      {pct(d.quantidade)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
