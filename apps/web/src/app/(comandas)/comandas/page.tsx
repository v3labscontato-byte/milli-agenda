'use client'

import { useCallback, useMemo, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import {
  MOCK_COMANDAS,
  nextNumber,
  type Comanda,
  type ComandaItem,
  type ComandaStatus,
  type ComandasFilter,
  type Discount,
} from '@/lib/comanda-mock'
import ComandaKpiStrip from '@/components/comandas/comanda-kpi-strip'
import ComandaList from '@/components/comandas/comanda-list'
import ComandaDetail from '@/components/comandas/comanda-detail'
import NovaComandaModal, { type NovaComandaData } from '@/components/comandas/nova-comanda-modal'

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDetail({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ReceiptText size={24} className="text-[#CBD5E1]" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-[#475569]">Selecione uma comanda</p>
        <p className="mt-1 text-[12px] text-[#94A3B8]">
          Clique em qualquer comanda para ver os detalhes e gerenciar o atendimento.
        </p>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="mt-2 flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
      >
        <ReceiptText size={13} aria-hidden="true" />
        Abrir Nova Comanda
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComandasPage() {
  const [comandas, setComandas]     = useState<Comanda[]>(MOCK_COMANDAS)
  const [statusFilter, setStatusFilter] = useState<ComandasFilter>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const first = MOCK_COMANDAS.find((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS')
    return first?.id ?? MOCK_COMANDAS[0]?.id ?? null
  })
  const [novoOpen, setNovoOpen]     = useState(false)

  const selected = useMemo(
    () => comandas.find((c) => c.id === selectedId) ?? null,
    [comandas, selectedId],
  )

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateSelected = useCallback((fn: (c: Comanda) => Comanda) => {
    setComandas((prev) => prev.map((c) => (c.id === selectedId ? fn(c) : c)))
  }, [selectedId])

  const handleAddItem = useCallback((item: Omit<ComandaItem, 'id'>) => {
    updateSelected((c) => ({
      ...c,
      items: [...c.items, { ...item, id: `i-${Date.now()}` }],
    }))
  }, [updateSelected])

  const handleRemoveItem = useCallback((itemId: string) => {
    updateSelected((c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) }))
  }, [updateSelected])

  const handleApplyDiscount = useCallback((discount: Discount | null) => {
    updateSelected((c) => ({ ...c, discount }))
  }, [updateSelected])

  const handleStatusChange = useCallback((status: ComandaStatus) => {
    updateSelected((c) => ({ ...c, status }))
  }, [updateSelected])

  const handleCreate = useCallback((data: NovaComandaData) => {
    const id = `c-${Date.now()}`
    const endMins = (() => {
      const [h, m] = (data.startTime || '09:00').split(':').map(Number)
      return (h * 60 + m) + data.serviceDuration
    })()
    const endTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`

    const comanda: Comanda = {
      id,
      number:       nextNumber(comandas),
      clientName:   data.clientName,
      service:      data.service,
      professional: data.professional,
      date:         new Date(),
      startTime:    data.startTime || '09:00',
      endTime,
      items:        [{ id: `i-${Date.now()}`, name: data.service, category: 'service', quantity: 1, unitPrice: data.serviceValue }],
      discount:     null,
      deposit:      null,
      status:       'OPEN',
      openedAt:     new Date(),
    }

    setComandas((prev) => [comanda, ...prev])
    setSelectedId(id)
    setStatusFilter('ALL')
  }, [comandas])

  function handleFilterChange(f: ComandasFilter) {
    setStatusFilter(f)
    setSelectedId(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── KPI strip (full width, clickable filter cards) ── */}
      <ComandaKpiStrip
        comandas={comandas}
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
        onNew={() => setNovoOpen(true)}
      />

      {/* ── Split panel ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left: scrollable comanda list */}
        <div className="w-[320px] shrink-0 overflow-hidden border-r border-[#E2E8F0] bg-white">
          <ComandaList
            comandas={comandas}
            selectedId={selectedId}
            statusFilter={statusFilter}
            onStatusFilterChange={handleFilterChange}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right: detail panel */}
        <div className="min-w-0 flex-1 overflow-hidden">
          {selected ? (
            <ComandaDetail
              key={selected.id}
              comanda={selected}
              onBack={() => setSelectedId(null)}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onApplyDiscount={handleApplyDiscount}
              onStatusChange={handleStatusChange}
              onNewComanda={() => setNovoOpen(true)}
            />
          ) : (
            <EmptyDetail onNew={() => setNovoOpen(true)} />
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <NovaComandaModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
