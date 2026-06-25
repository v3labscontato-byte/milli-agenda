'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useProfessionalsReport } from '@/hooks/use-relatorios'

interface TooltipEntry {
  name?: string
  value?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
}

const COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#0891B2', '#059669', '#D97706', '#475569']

function Frame({ total, children }: { total: number | null; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Atendimentos por Profissional</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Distribuição concluída no período</p>
        </div>
        {total != null && (
          <span className="rounded-sm bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
            {total} total
          </span>
        )}
      </div>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </div>
  )
}

export default function ServicesChart() {
  const { data, loading, error } = useProfessionalsReport()
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

  if (loading || !mounted) {
    return (
      <Frame total={null}>
        <div className="animate-pulse motion-reduce:animate-none h-[180px] w-full rounded-lg bg-[#F1F5F9]" />
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame total={null}>
        <div className="flex h-[180px] items-center justify-center text-sm text-red-500">
          Erro ao carregar. Tente novamente.
        </div>
      </Frame>
    )
  }

  if (data.length === 0) {
    return (
      <Frame total={0}>
        <div className="flex h-[180px] flex-col items-center justify-center text-slate-400">
          <p className="text-sm">Sem informações suficientes para o período</p>
        </div>
      </Frame>
    )
  }

  const total = data.reduce((s, d) => s + d.completedAppts, 0)
  const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : '0.0')

  function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
        <p className="text-[12px] font-semibold text-[#0F172A]">{d.name}</p>
        <p className="text-[12px] text-[#475569]">
          {d.value} atendimentos ({pct(d.value as number)}%)
        </p>
      </div>
    )
  }

  return (
    <Frame total={total}>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                dataKey="completedAppts"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                strokeWidth={2}
                stroke="#fff"
                isAnimationActive={!prefersReduced}
              >
                {data.map((d, i) => (
                  <Cell key={d.id} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-tabular text-[20px] font-bold text-[#0F172A]">{total}</span>
            <span className="text-[10px] text-[#475569]">total</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5" role="list">
          {data.map((d, i) => (
            <li key={d.id} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="truncate text-[12px] text-[#475569]">{d.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-tabular text-[12px] font-medium text-[#0F172A]">
                  {d.completedAppts}
                </span>
                <span className="w-9 text-right text-[11px] text-[#475569]">
                  {pct(d.completedAppts)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  )
}
