'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comanda, ComandaItem, ComandaStatus, Discount } from '@/lib/comanda-mock'
import ComandaDetail from './comanda-detail'

const STATUS_CFG = {
  OPEN:             { label: 'Aberta',        bg: '#F1F5F9', text: '#475569' },
  IN_PROGRESS:      { label: 'Em Atend.',     bg: '#EFF6FF', text: '#2563EB' },
  AWAITING_PAYMENT: { label: 'Aguard. Pagto', bg: '#FFFBEB', text: '#D97706' },
  PAID:             { label: 'Paga',          bg: '#F0FDF4', text: '#16A34A' },
  CANCELLED:        { label: 'Cancelada',     bg: '#FEF2F2', text: '#DC2626' },
}

interface ComandaDrawerProps {
  comanda: Comanda
  onClose: () => void
  onAddItem: (item: Omit<ComandaItem, 'id'>) => void
  onRemoveItem: (itemId: string) => void
  onApplyDiscount: (discount: Discount | null) => void
  onStatusChange: (status: ComandaStatus) => void
  onNewComanda: () => void
}

export default function ComandaDrawer({
  comanda,
  onClose,
  onAddItem,
  onRemoveItem,
  onApplyDiscount,
  onStatusChange,
  onNewComanda,
}: ComandaDrawerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const s = STATUS_CFG[comanda.status]

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Comanda #${comanda.number}`}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]',
          'transition-opacity duration-300 motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="shrink-0 text-[15px] font-semibold text-[#0F172A]">
              Comanda <span className="text-[#94A3B8]">#{comanda.number}</span>
            </h2>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: s.bg, color: s.text }}
            >
              {s.label}
            </span>
            <span className="truncate text-[13px] text-[#475569]">{comanda.clientName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Content — ComandaDetail fills remaining height */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ComandaDetail
            key={comanda.id}
            comanda={comanda}
            onBack={onClose}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onApplyDiscount={onApplyDiscount}
            onStatusChange={onStatusChange}
            onNewComanda={onNewComanda}
            hideHeader
          />
        </div>
      </div>
    </div>
  )
}
