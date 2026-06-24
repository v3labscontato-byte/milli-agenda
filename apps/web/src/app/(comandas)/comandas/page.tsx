'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MOCK_COMANDAS,
  type Comanda,
  type ComandasFilter,
} from '@/lib/comanda-mock'
import ComandaKpiStrip from '@/components/comandas/comanda-kpi-strip'
import ComandaTable from '@/components/comandas/comanda-table'
import PaymentModal from '@/components/shared/payment-modal'

// ─── Config ───────────────────────────────────────────────────────────────────

const FILTER_LABELS: Partial<Record<ComandasFilter, string>> = {
  ALL:              'Todas',
  OPEN_IN_PROGRESS: 'Abertas',
  AWAITING_PAYMENT: 'Aguard. Pagto',
  PAID:             'Pagas',
  CANCELLED:        'Canceladas',
}

const FILTER_PILLS = Object.keys(FILTER_LABELS) as ComandasFilter[]

function formatDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComandasPage() {
  const [comandas, setComandas]               = useState<Comanda[]>(MOCK_COMANDAS)
  const [statusFilter, setStatusFilter]       = useState<ComandasFilter>('ALL')
  const [search, setSearch]                   = useState('')
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return comandas.filter((c) => {
      const statusMatch =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN_IN_PROGRESS'
          ? c.status === 'OPEN' || c.status === 'IN_PROGRESS'
          : c.status === statusFilter)
      if (!statusMatch) return false
      if (!q) return true
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.number.includes(q)
      )
    })
  }, [comandas, statusFilter, search])

  function handleOpen(id: string) {
    setSelectedComanda(comandas.find((c) => c.id === id) ?? null)
  }

  function handleConfirm() {
    if (!selectedComanda) return
    setComandas((prev) =>
      prev.map((c) => (c.id === selectedComanda.id ? { ...c, status: 'PAID' } : c)),
    )
    setSelectedComanda(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      {/* KPI Strip */}
      <ComandaKpiStrip
        comandas={comandas}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onNew={() => { /* future */ }}
      />

      {/* Search + Filter bar */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar cliente, serviço…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar comanda"
              className={cn(
                'w-56 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3',
                'text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]',
                'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
              )}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar por status">
            {FILTER_PILLS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                aria-pressed={statusFilter === f}
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  statusFilter === f
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
                )}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          <span className="ml-auto text-[11px] text-[#94A3B8]">
            {filtered.length} de {comandas.length} comanda{comandas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Full-width table */}
      <div className="flex-1 overflow-auto bg-white">
        <ComandaTable comandas={filtered} onOpen={handleOpen} />
      </div>

      {/* Payment modal */}
      {selectedComanda && (
        <PaymentModal
          open={!!selectedComanda}
          commandId={selectedComanda.number}
          clientName={selectedComanda.clientName}
          professionalName={selectedComanda.professional}
          serviceName={selectedComanda.service}
          date={formatDateShort(selectedComanda.date)}
          startTime={selectedComanda.startTime}
          endTime={selectedComanda.endTime}
          items={selectedComanda.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          }))}
          deposit={selectedComanda.deposit}
          onClose={() => setSelectedComanda(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
