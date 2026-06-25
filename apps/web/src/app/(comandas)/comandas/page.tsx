'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  nextNumber,
  type Comanda,
  type ComandasFilter,
} from '@/lib/comanda-mock'
import { useComandas } from '@/hooks/use-comandas'
import { comandasApi } from '@/lib/api/comandas'
import ComandaKpiStrip from '@/components/comandas/comanda-kpi-strip'
import ComandaTable from '@/components/comandas/comanda-table'
import NovaComandaModal, { type NovaComandaData } from '@/components/comandas/nova-comanda-modal'
import PaymentModal from '@/components/shared/payment-modal'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

// ─── Filter pills config ──────────────────────────────────────────────────────

const FILTER_PILLS: { label: string; value: ComandasFilter }[] = [
  { label: 'Todas',        value: 'ALL'              },
  { label: 'Abertas',      value: 'OPEN_IN_PROGRESS' },
  { label: 'Aguard. Pagto', value: 'AWAITING_PAYMENT' },
  { label: 'Pagas',        value: 'PAID'             },
  { label: 'Canceladas',   value: 'CANCELLED'        },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComandasPage() {
  const { data: initialComandas, loading, error } = useComandas()
  const [comandas, setComandas]         = useState<Comanda[]>(initialComandas)
  const [statusFilter, setStatusFilter] = useState<ComandasFilter>('ALL')
  const [searchQuery, setSearchQuery]   = useState('')
  const [openId, setOpenId]             = useState<string | null>(null)
  const [novoOpen, setNovoOpen]         = useState(false)

  useEffect(() => {
    if (!loading && initialComandas.length > 0 && comandas.length === 0) {
      setComandas(initialComandas)
    }
  }, [loading, initialComandas])

  const openComanda = useMemo(
    () => comandas.find((c) => c.id === openId) ?? null,
    [comandas, openId],
  )

  const filtered = useMemo(() => {
    let result = comandas

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OPEN_IN_PROGRESS') {
        result = result.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS')
      } else {
        result = result.filter((c) => c.status === statusFilter)
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.clientName.toLowerCase().includes(q) ||
          c.service.toLowerCase().includes(q) ||
          c.professional.toLowerCase().includes(q) ||
          c.number.includes(q),
      )
    }

    return result
  }, [comandas, statusFilter, searchQuery])

  const handleFilterChange = useCallback((f: ComandasFilter) => {
    setStatusFilter(f)
    setSearchQuery('')
  }, [])

  const handleCreate = useCallback((data: NovaComandaData) => {
    const id = `c-${Date.now()}`
    const endMins = (() => {
      const [h, m] = (data.startTime || '09:00').split(':').map(Number)
      return (h * 60 + m) + data.serviceDuration
    })()
    const endTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`

    setComandas((prev) => {
      const comanda: Comanda = {
        id,
        number:       nextNumber(prev),
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
      return [comanda, ...prev]
    })
    setStatusFilter('ALL')

    // Fire-and-forget: persist to backend (optimistic UI already updated above)
    comandasApi.create({
      clientName:     data.clientName,
      clientPhone:    data.clientPhone || undefined,
      serviceId:      data.serviceId,
      professionalId: data.professionalId,
      startTime:      data.startTime || '09:00',
    }).catch(() => {
      // Silently fail — local state already reflects the new comanda
    })
  }, [])

  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-[#F1F5F9]" />)}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0,1,2,3,4,5,6,7].map((i) => <div key={i} className="h-12 rounded-lg bg-[#F1F5F9]" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-[#DC2626]">{error}</p>
    </div>
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── KPI strip ── */}
      <ComandaKpiStrip
        comandas={comandas}
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
        onNew={() => setNovoOpen(true)}
      />

      {/* ── Search + filter pills ── */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-5 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Buscar cliente, serviço, profissional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'min-w-0 flex-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC]',
              'px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B]',
              'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
            )}
          />
          <div className="flex shrink-0 flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
            {FILTER_PILLS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-[12px] font-medium',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  statusFilter === value
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full-width table ── */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <ComandaTable comandas={filtered} onOpen={setOpenId} />
      </div>

      {/* ── Nova Comanda modal ── */}
      <NovaComandaModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={handleCreate}
      />

      {/* ── Payment modal ── */}
      {openComanda && (
        <PaymentModal
          open={openId !== null}
          commandId={openComanda.number}
          clientName={openComanda.clientName}
          professionalName={openComanda.professional}
          serviceName={openComanda.service}
          date={formatDateShort(openComanda.date)}
          startTime={openComanda.startTime}
          endTime={openComanda.endTime}
          items={openComanda.items}
          deposit={openComanda.deposit}
          initialDiscount={openComanda.discount}
          onClose={() => setOpenId(null)}
          onConfirm={() => {
            setComandas((prev) =>
              prev.map((c) => (c.id === openId ? { ...c, status: 'PAID' } : c)),
            )
            setOpenId(null)
          }}
        />
      )}
    </div>
  )
}
