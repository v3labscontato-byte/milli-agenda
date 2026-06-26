'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  nextNumber,
  type Comanda,
  type ComandasFilter,
} from '@/lib/comanda-mock'
import { useComandas } from '@/hooks/use-comandas'
import { comandasApi } from '@/lib/api/comandas'
import { pagamentosApi } from '@/lib/api/pagamentos'
import { agendaApi } from '@/lib/api/agenda'
import { FEATURES } from '@/lib/features'
import ComandaKpiStrip from '@/components/comandas/comanda-kpi-strip'
import ComandaTable from '@/components/comandas/comanda-table'
import NovaComandaModal, { type NovaComandaData } from '@/components/comandas/nova-comanda-modal'
import PaymentModal, { type PaymentResult } from '@/components/shared/payment-modal'
import { ReceiptText } from 'lucide-react'
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

function ComandasPageInner() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams?.get('appointmentId')

  const { data: initialComandas, loading, error, refetch } = useComandas()
  const [comandas, setComandas]         = useState<Comanda[]>(initialComandas)
  const [statusFilter, setStatusFilter] = useState<ComandasFilter>('ALL')
  const [searchQuery, setSearchQuery]   = useState('')
  const [openId, setOpenId]             = useState<string | null>(null)
  const [novoOpen, setNovoOpen]         = useState(false)
  const [prefillData, setPrefillData]   = useState<Partial<NovaComandaData> | null>(null)

  // In real-API mode the hook is the source of truth — mirror it (incl. after refetch).
  useEffect(() => {
    if (FEATURES.realComandas) setComandas(initialComandas)
  }, [initialComandas])

  // Handle appointmentId from URL to prefill nova comanda
  useEffect(() => {
    if (!appointmentId) return
    agendaApi.get(appointmentId)
      .then((appt: any) => {
        setPrefillData({
          clientName: appt.client?.name || '',
          clientPhone: appt.client?.phone || '',
          professionalId: appt.professional?.id || '',
          professional: appt.professional?.name || '',
          serviceId: appt.service?.id || '',
          service: appt.service?.name || '',
          serviceValue: Number(appt.service?.price ?? 0),
          serviceDuration: appt.service?.durationMin || 60,
          startTime: appt.startAt ? new Date(appt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '09:00',
        })
        setNovoOpen(true)
      })
      .catch(() => { /* silent fail */ })
  }, [appointmentId])

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
    setStatusFilter('ALL')

    if (FEATURES.realComandas) {
      comandasApi.create({
        clientName:     data.clientName,
        clientPhone:    data.clientPhone || undefined,
        serviceId:      data.serviceId,
        professionalId: data.professionalId,
        startTime:      data.startTime || '09:00',
      })
        .then(() => refetch())
        .catch(() => { /* error surfaced on next load */ })
      return
    }

    // Mock mode: optimistic local insert
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
  }, [refetch])

  const handlePaymentConfirm = useCallback((result: PaymentResult) => {
    const target = comandas.find((c) => c.id === openId)
    setOpenId(null)

    if (FEATURES.realComandas && target) {
      const method = result.methods[0]?.method ?? 'pix'
      pagamentosApi.create({
        commandId: target.id,
        amount:    result.total,
        method:    method.toUpperCase(),
        status:    'PAID',
      })
        .then(() => comandasApi.close(target.id, {}).catch(() => {}))
        .then(() => refetch())
        .catch(() => { /* error surfaced on next load */ })
      return
    }

    setComandas((prev) =>
      prev.map((c) => (c.id === target?.id ? { ...c, status: 'PAID' } : c)),
    )
  }, [comandas, openId, refetch])

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

      {/* ── Full-width table / empty state ── */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        {comandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ReceiptText className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
            <h3 className="font-medium text-slate-700">Nenhuma comanda aberta</h3>
            <p className="mt-1 text-sm text-slate-400">Abra uma nova comanda para começar.</p>
            <button
              type="button"
              onClick={() => setNovoOpen(true)}
              className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              + Nova Comanda
            </button>
          </div>
        ) : (
          <ComandaTable comandas={filtered} onOpen={setOpenId} />
        )}
      </div>

      {/* ── Nova Comanda modal ── */}
      <NovaComandaModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={handleCreate}
        prefill={prefillData ?? undefined}
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
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  )
}

export default function ComandasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    }>
      <ComandasPageInner />
    </Suspense>
  )
}
