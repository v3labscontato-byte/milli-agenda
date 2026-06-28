'use client'

import { useState } from 'react'
import { Calendar, ClipboardList, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFESSIONALS, type Appointment, type Professional } from '@/lib/mock-data'
import PaymentModal, { type PaymentResult } from '@/components/shared/payment-modal'

// ─── Constants ────────────────────────────────────────────────────────────────

const TH = 'px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]'

function Dash() {
  return (
    <td className="w-32 px-2 py-3 text-center">
      <span className="text-[#CBD5E1]" aria-hidden="true">—</span>
    </td>
  )
}

// ─── Payment status ────────────────────────────────────────────────────────────

type PaymentSt = 'pago' | 'pendente' | 'atrasado'

function getPaymentStatus(appt: Appointment): PaymentSt {
  if (appt.status === 'COMPLETED') return 'pago'
  if (appt.status === 'AWAITING_PAYMENT') return 'atrasado'
  return 'pendente'
}

const PAYMENT_STYLES: Record<PaymentSt, { bg: string; text: string; border: string; label: string }> = {
  pago:     { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Pago'     },
  pendente: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Pendente' },
  atrasado: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Atrasado' },
}

function PaymentStatusCell({ appt }: { appt: Appointment }) {
  if (appt.status === 'CANCELLED' || appt.status === 'NO_SHOW') {
    return <td className="px-4 py-3"><span className="text-[#CBD5E1]" aria-hidden="true">—</span></td>
  }
  const ps = getPaymentStatus(appt)
  const style = PAYMENT_STYLES[ps]
  return (
    <td className="px-4 py-3">
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
      >
        {style.label}
      </span>
    </td>
  )
}

// ─── Atendimento status ───────────────────────────────────────────────────────

type AtendimentoSt = 'realizado' | 'pendente' | 'cancelado' | 'confirmado'

function getAtendimentoStatus(appt: Appointment): AtendimentoSt {
  if (appt.status === 'COMPLETED') return 'realizado'
  if (appt.status === 'CANCELLED') return 'cancelado'
  if (appt.status === 'CONFIRMED') return 'confirmado'
  return 'pendente'
}

const ATENDIMENTO_STYLES: Record<AtendimentoSt, { bg: string; text: string; border: string; label: string }> = {
  realizado:  { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Realizado'  },
  pendente:   { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Pendente'   },
  confirmado: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Confirmado' },
  cancelado:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Cancelado'  },
}

function AtendimentoCell({ appt }: { appt: Appointment }) {
  const s = getAtendimentoStatus(appt)
  const style = ATENDIMENTO_STYLES[s]
  return (
    <td className="px-4 py-3">
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
      >
        {style.label}
      </span>
    </td>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]"
      aria-hidden="true"
    >
      <div className="h-10 border-b border-[#E2E8F0] bg-[#F8FAFC]" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 py-3 last:border-0"
        >
          <div className="h-3.5 w-10 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  )
}

// ─── Action cell renderers ─────────────────────────────────────────────────────

function AgendaCell({ appt, onReschedule }: { appt: Appointment; onReschedule?: (id: string) => void }) {
  if (appt.status !== 'SCHEDULED' && appt.status !== 'CONFIRMED') return <Dash />
  return (
    <td className="w-32 px-2 py-3 text-center">
      <button
        type="button"
        onClick={() => onReschedule?.(appt.id)}
        aria-label={`Gerenciar agendamento de ${appt.client}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5',
          'bg-[#2563EB] text-[11px] font-medium text-white transition-colors hover:bg-[#1D4ED8]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
        )}
      >
        <Calendar size={12} aria-hidden="true" />
        Agenda
      </button>
    </td>
  )
}

const COMANDA_STYLES: Record<PaymentSt, { bg: string; text: string; border: string; label: string; icon: typeof ClipboardList }> = {
  pago:     { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Ver Comanda',   icon: ClipboardList },
  pendente: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Abrir Comanda', icon: ClipboardList },
  atrasado: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Cobrar',        icon: CreditCard   },
}

function ComandaCell({ appt, onOpen }: { appt: Appointment; onOpen: () => void }) {
  if (appt.status === 'CANCELLED' || appt.status === 'NO_SHOW') {
    return <Dash />
  }

  const ps = getPaymentStatus(appt)
  const style = COMANDA_STYLES[ps]
  const Icon = style.icon

  return (
    <td className="w-32 px-2 py-3 text-center">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${style.label}: ${appt.client}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5',
          'text-[11px] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
        )}
        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
      >
        <Icon size={12} aria-hidden="true" />
        {style.label}
      </button>
    </td>
  )
}

// ─── Valor cell ───────────────────────────────────────────────────────────────

function ValorCell({ appt }: { appt: Appointment }) {
  if (appt.status === 'CANCELLED') {
    return <td className="px-4 py-3"><span className="text-[#CBD5E1]" aria-hidden="true">—</span></td>
  }
  return (
    <td className="px-4 py-3">
      <span className="font-tabular text-[13px] font-medium text-[#0F172A]">
        {appt.amount > 0
          ? `R$ ${Number(appt.amount).toFixed(2).replace('.', ',')}`
          : <span className="text-[#94A3B8]">—</span>
        }
      </span>
    </td>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface AgendaTableProps {
  appointments: Appointment[]
  isLoading?: boolean
  onReschedule?: (id: string) => void
  onSuccess?: () => void
}

const METHOD_MAP: Record<string, string> = {
  pix: 'PIX', dinheiro: 'CASH', debito: 'DEBIT_CARD',
  credito: 'CREDIT_CARD', voucher: 'VOUCHER', transferencia: 'BANK_TRANSFER',
}

export default function AgendaTable({ appointments, isLoading = false, onReschedule, onSuccess }: AgendaTableProps) {
  const [activeProf, setActiveProf]   = useState<Professional>('Todos')
  const [paymentAppt, setPaymentAppt] = useState<Appointment | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  async function handlePaymentConfirm(result: PaymentResult) {
    if (!paymentAppt) return
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const base = process.env.NEXT_PUBLIC_API_URL
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

      const cmdRes = await fetch(`${base}/api/v1/commands`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ clientId: paymentAppt.clientId }),
      })
      const cmd = await cmdRes.json()
      const commandId = cmd.data?.id
      if (!commandId) throw new Error('Comanda não criada')

      for (const m of result.methods ?? []) {
        await fetch(`${base}/api/v1/payments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            commandId,
            method: METHOD_MAP[m.method] ?? m.method.toUpperCase(),
            amount: m.amount,
          }),
        })
      }

      await fetch(`${base}/api/v1/commands/${commandId}/close`, { method: 'POST', headers })

      await fetch(`${base}/api/v1/appointments/${paymentAppt.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      onSuccess?.()
    } catch (e) {
      console.error('[comanda] erro:', e)
    } finally {
      setPaymentLoading(false)
      setPaymentAppt(null)
    }
  }

  const filtered =
    activeProf === 'Todos'
      ? appointments
      : appointments.filter((a) => a.professional === activeProf)

  return (
    <section aria-labelledby="agenda-heading">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="agenda-heading"
          className="text-[16px] font-medium leading-[1.4] text-[#0F172A]"
        >
          Agenda de Hoje
        </h2>
        <p className="text-[12px] text-[#475569]" aria-live="polite" aria-atomic="true">
          {isLoading ? '…' : `${filtered.length} agendamento${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Professional filter pills */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por profissional">
        {PROFESSIONALS.map((prof) => {
          const isActive  = activeProf === prof
          const shortName = prof === 'Todos' ? 'Todos' : prof.split(' ')[0]
          return (
            <button
              key={prof}
              type="button"
              onClick={() => setActiveProf(prof)}
              aria-pressed={isActive}
              className={cn(
                'rounded-sm border px-3 py-1 text-[13px] font-medium',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                isActive
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
              )}
            >
              {shortName}
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th scope="col" className={TH}>Hora</th>
                  <th scope="col" className={TH}>Cliente</th>
                  <th scope="col" className={cn(TH, 'hidden md:table-cell')}>Serviço</th>
                  <th scope="col" className={cn(TH, 'hidden lg:table-cell')}>Profissional</th>
                  <th scope="col" className={TH}>Pagamento</th>
                  <th scope="col" className={TH}>Valor</th>
                  <th scope="col" className={TH}>Atendimento</th>
                  <th scope="col" className={cn(TH, 'w-32 text-center')}>Agenda</th>
                  <th scope="col" className={cn(TH, 'w-32 text-center')}>Comanda</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <p className="text-[14px] font-medium text-[#475569]">
                        Nenhum atendimento encontrado para o período.
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#475569]">
                        Tente selecionar outro profissional.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt) => (
                    <tr
                      key={appt.id}
                      className="border-b border-[#E2E8F0] bg-white transition-colors last:border-0 hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-3">
                        <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                          {appt.time}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[14px] font-medium text-[#0F172A]">{appt.client}</p>
                        <p className="text-[12px] text-[#475569] md:hidden">{appt.service}</p>
                      </td>

                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-[14px] text-[#475569]">{appt.service}</span>
                      </td>

                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-[14px] text-[#475569]">
                          {appt.professional.split(' ')[0]}
                        </span>
                      </td>

                      <PaymentStatusCell  appt={appt} />
                      <ValorCell         appt={appt} />
                      <AtendimentoCell   appt={appt} />

                      <AgendaCell  appt={appt} onReschedule={onReschedule} />
                      <ComandaCell appt={appt} onOpen={() => setPaymentAppt(appt)} />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}

      {paymentAppt && (
        <PaymentModal
          open={!!paymentAppt}
          onClose={() => setPaymentAppt(null)}
          onConfirm={handlePaymentConfirm}
          loading={paymentLoading}
          clientName={paymentAppt.client}
          professionalName={paymentAppt.professional}
          serviceName={paymentAppt.service}
          items={[{ name: paymentAppt.service, quantity: 1, unitPrice: paymentAppt.amount }]}
          date={paymentAppt.time}
          startTime={paymentAppt.time}
          endTime={paymentAppt.endTime ?? ''}
        />
      )}

    </section>
  )
}
