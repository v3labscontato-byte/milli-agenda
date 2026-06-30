'use client'

import { cn } from '@/lib/utils'
import { calculateSubtotal, calculateDiscount, calculateTotal, formatBRL } from '@/lib/business-rules'
import type { Comanda, ComandaStatus } from '@/lib/comanda-mock'

const STATUS_CONFIG: Record<ComandaStatus, { label: string; bg: string; text: string }> = {
  OPEN:             { label: 'Aberta',          bg: '#F1F5F9', text: '#475569' },
  IN_PROGRESS:      { label: 'Em Atendimento',  bg: '#DBEAFE', text: '#2563EB' },
  AWAITING_PAYMENT: { label: 'Aguard. Pagto',   bg: '#FEF9C3', text: '#CA8A04' },
  PAID:             { label: 'Paga',            bg: '#DCFCE7', text: '#16A34A' },
  CANCELLED:        { label: 'Cancelada',       bg: '#FEE2E2', text: '#DC2626' },
}

function getElapsed(openedAt: Date): string {
  const minutes = Math.floor((Date.now() - openedAt.getTime()) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h${m}min`
}

function formatDateLabel(date: Date, startTime: string, endTime: string): string {
  const today = new Date()
  const label = date.toDateString() === today.toDateString()
    ? 'Hoje'
    : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
  return `${label} · ${startTime}–${endTime}`
}

interface ComandaCardProps {
  comanda: Comanda
  isSelected: boolean
  onClick: () => void
}

export default function ComandaCard({ comanda, isSelected, onClick }: ComandaCardProps) {
  const { number, clientName, service, professional, items, discount, status, openedAt, date, startTime, endTime } = comanda
  const s = STATUS_CONFIG[status]
  const subtotal = calculateSubtotal(items)
  const discountAmt = calculateDiscount(subtotal, discount)
  const total = calculateTotal(subtotal, discountAmt)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Comanda #${number} — ${clientName}`}
      className={cn(
        'w-full border-b border-[#E2E8F0] px-4 py-3.5 text-left transition-colors duration-150 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
        isSelected
          ? 'bg-[#EFF6FF] ring-2 ring-inset ring-[#2563EB]'
          : 'bg-[#F8FAFC] hover:bg-white',
      )}
    >
      {/* Row 1: number + client + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#0F172A]">
            <span className="font-tabular text-[#94A3B8]">#{number}</span>
            <span className="mx-1.5 text-[#CBD5E1]">·</span>
            {clientName}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-[#475569]">
            {service}
            <span className="mx-1 text-[#CBD5E1]">·</span>
            {professional}
          </p>
        </div>
        <span
          className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: s.bg, color: s.text }}
        >
          {s.label}
        </span>
      </div>

      {/* Row 2: date + time */}
      <p className="mt-1.5 text-[11px] text-[#94A3B8]">
        {formatDateLabel(date, startTime, endTime)}
      </p>

      {/* Row 3: elapsed + total */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11px] text-[#94A3B8]">há {getElapsed(openedAt)}</span>
        <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
          {formatBRL(total)}
        </span>
      </div>
    </button>
  )
}
