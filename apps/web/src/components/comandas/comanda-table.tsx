'use client'

import { cn } from '@/lib/utils'
import { calculateSubtotal, calculateDiscount, calculateTotal, formatBRL } from '@/lib/business-rules'
import type { Comanda, ComandaStatus } from '@/lib/comanda-mock'

const STATUS_CFG: Record<ComandaStatus, { label: string; bg: string; text: string }> = {
  OPEN:             { label: 'Aberta',        bg: '#F1F5F9', text: '#475569' },
  IN_PROGRESS:      { label: 'Em Atend.',     bg: '#DBEAFE', text: '#2563EB' },
  AWAITING_PAYMENT: { label: 'Aguard. Pagto', bg: '#FEF9C3', text: '#CA8A04' },
  PAID:             { label: 'Paga',          bg: '#DCFCE7', text: '#16A34A' },
  CANCELLED:        { label: 'Cancelada',     bg: '#FEE2E2', text: '#DC2626' },
}

function formatDateLabel(date: Date | string | undefined, startTime?: string): string {
  if (!date) return startTime ?? '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return startTime ?? '—'
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return `Hoje ${startTime ?? ''}`
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${startTime ?? ''}`
}

interface ComandaTableProps {
  comandas: Comanda[]
  onOpen: (id: string) => void
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] text-left'

export default function ComandaTable({ comandas, onOpen }: ComandaTableProps) {
  if (comandas.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[13px] text-[#94A3B8]">
        Nenhuma comanda encontrada
      </div>
    )
  }

  return (
    <table className="w-full min-w-[820px] border-collapse text-[13px]">
      <thead>
        <tr className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <th className={TH}>#</th>
          <th className={TH}>Cliente</th>
          <th className={TH}>Serviço</th>
          <th className={TH}>Profissional</th>
          <th className={TH}>Data/Hora</th>
          <th className={cn(TH, 'text-right')}>Valor</th>
          <th className={TH}>Status</th>
          <th className={cn(TH, 'w-[80px] text-center')}></th>
        </tr>
      </thead>
      <tbody>
        {comandas.map((c) => {
          const s = STATUS_CFG[c.status]
          const sub = calculateSubtotal(c.items)
          const total = calculateTotal(sub, calculateDiscount(sub, c.discount))

          return (
            <tr
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="group cursor-pointer border-b border-[#F1F5F9] bg-white transition-colors hover:bg-[#EFF6FF]"
            >
              <td className="px-4 py-3 font-tabular text-[12px] text-[#94A3B8]">
                #{c.number}
              </td>
              <td className="px-4 py-3 font-semibold text-[#0F172A]">{c.clientName}</td>
              <td className="px-4 py-3 text-[#475569]">{c.service}</td>
              <td className="px-4 py-3 text-[#475569]">{c.professional}</td>
              <td className="px-4 py-3 font-tabular text-[#475569]">
                {formatDateLabel(c.date, c.startTime)}
              </td>
              <td className="px-4 py-3 text-right font-tabular font-semibold text-[#0F172A]">
                {formatBRL(total)}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
              </td>
              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onOpen(c.id)}
                  className={cn(
                    'rounded-md border border-[#E2E8F0] px-3 py-1 text-[11px] font-medium text-[#475569]',
                    'transition-colors group-hover:border-[#2563EB] group-hover:text-[#2563EB]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  Abrir
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
