'use client'

import { useEffect, useState } from 'react'
import { Calendar, ClipboardList, CreditCard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { PROFESSIONALS, type Appointment, type Professional } from '@/lib/mock-data'
import PaymentModal from '@/components/shared/payment-modal'
import NewAppointmentModal from '@/components/agenda/new-appointment-modal'

// ─── Constants ────────────────────────────────────────────────────────────────

const TH = 'px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]'

function Dash() {
  return (
    <td className="w-32 px-2 py-3 text-center">
      <span className="text-[#CBD5E1]" aria-hidden="true">—</span>
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

// ─── Manage Modal ─────────────────────────────────────────────────────────────

interface ManageModalProps {
  appt: Appointment
  onClose: () => void
  onReschedule: () => void
}

function ManageModal({ appt, onClose, onReschedule }: ManageModalProps) {
  const [cancelMode, setCancelMode] = useState(false)
  const [reason, setReason]         = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function handleConfirmCancel() {
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Gerenciar Agendamento"
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Gerenciar Agendamento</h2>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              {appt.client} · {appt.service} · {appt.time}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {!cancelMode ? (
            <div className="flex flex-col gap-3">
              {/* Reagendar option */}
              <button
                type="button"
                onClick={onReschedule}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border border-[#E2E8F0] px-4 py-3.5 text-left',
                  'transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Calendar size={16} className="text-[#2563EB]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">Reagendar</p>
                  <p className="text-[11px] text-[#64748B]">Escolher nova data e horário</p>
                </div>
              </button>

              {/* Cancelar option */}
              <button
                type="button"
                onClick={() => setCancelMode(true)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border border-[#E2E8F0] px-4 py-3.5 text-left',
                  'transition-colors hover:border-[#DC2626] hover:bg-[#FEF2F2]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2]">
                  <X size={16} className="text-[#DC2626]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">Cancelar agendamento</p>
                  <p className="text-[11px] text-[#64748B]">Registrar motivo do cancelamento</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="cancel-reason"
                  className="mb-1.5 block text-[12px] font-medium text-[#475569]"
                >
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex.: cliente solicitou, conflito de agenda…"
                  className={cn(
                    'w-full resize-none rounded-md border border-[#E2E8F0] px-3 py-2',
                    'text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                  )}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelMode(false)}
                  className={cn(
                    'flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569]',
                    'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className={cn(
                    'flex-1 rounded-md bg-[#DC2626] py-2 text-[13px] font-medium text-white',
                    'transition-colors hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  Confirmar cancelamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Action cell renderers ─────────────────────────────────────────────────────

function AgendaCell({ appt, onManage }: { appt: Appointment; onManage: () => void }) {
  if (appt.status !== 'SCHEDULED' && appt.status !== 'CONFIRMED') return <Dash />
  return (
    <td className="w-32 px-2 py-3 text-center">
      <button
        type="button"
        onClick={onManage}
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

function ComandaCell({ appt, onOpen }: { appt: Appointment; onOpen: () => void }) {
  const { status } = appt

  if (status === 'SCHEDULED' || status === 'CONFIRMED' || status === 'CANCELLED' || status === 'NO_SHOW') {
    return <Dash />
  }

  if (status === 'AWAITING_PAYMENT') {
    return (
      <td className="w-32 px-2 py-3 text-center">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Cobrar: ${appt.client}`}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5',
            'bg-[#F97316] text-[11px] font-medium text-white transition-colors hover:bg-[#EA580C]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
          )}
        >
          <CreditCard size={12} aria-hidden="true" />
          Cobrar
        </button>
      </td>
    )
  }

  const isAbrir = status === 'IN_SERVICE' || status === 'CHECKED_IN'

  return (
    <td className="w-32 px-2 py-3 text-center">
      <button
        type="button"
        onClick={isAbrir ? onOpen : undefined}
        aria-label={`${isAbrir ? 'Abrir' : 'Ver'} comanda de ${appt.client}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5',
          'text-[11px] font-medium transition-colors',
          isAbrir
            ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]'
            : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
        )}
      >
        <ClipboardList size={12} aria-hidden="true" />
        {isAbrir ? 'Abrir Comanda' : 'Ver Comanda'}
      </button>
    </td>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface AgendaTableProps {
  appointments: Appointment[]
  isLoading?: boolean
}

export default function AgendaTable({ appointments, isLoading = false }: AgendaTableProps) {
  const [activeProf, setActiveProf]         = useState<Professional>('Todos')
  const [manageAppt, setManageAppt]         = useState<Appointment | null>(null)
  const [paymentAppt, setPaymentAppt]       = useState<Appointment | null>(null)
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null)

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
                  <th scope="col" className={cn(TH, 'hidden text-right xl:table-cell')}>Valor</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={cn(TH, 'w-32 text-center')}>Agenda</th>
                  <th scope="col" className={cn(TH, 'w-32 text-center')}>Comanda</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <p className="text-[14px] font-medium text-[#475569]">
                        Nenhum agendamento para este filtro
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#475569]">
                        Tente selecionar outro profissional
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

                      <td className="hidden px-4 py-3 text-right xl:table-cell">
                        <span className="font-tabular text-[14px] font-medium text-[#0F172A]">
                          R$ {appt.amount}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={appt.status} />
                      </td>

                      <AgendaCell  appt={appt} onManage={() => setManageAppt(appt)} />
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
      {manageAppt && (
        <ManageModal
          appt={manageAppt}
          onClose={() => setManageAppt(null)}
          onReschedule={() => {
            setRescheduleAppt(manageAppt)
            setManageAppt(null)
          }}
        />
      )}

      {paymentAppt && (
        <PaymentModal
          open={!!paymentAppt}
          onClose={() => setPaymentAppt(null)}
          onConfirm={() => setPaymentAppt(null)}
          clientName={paymentAppt.client}
          professionalName={paymentAppt.professional}
          serviceName={paymentAppt.service}
          items={[{ name: paymentAppt.service, quantity: 1, unitPrice: paymentAppt.amount }]}
          date={paymentAppt.time}
          startTime={paymentAppt.time}
          endTime={paymentAppt.endTime ?? ''}
        />
      )}

      {rescheduleAppt && (
        <NewAppointmentModal
          open={!!rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          isReschedule={true}
          rescheduleClientName={rescheduleAppt.client}
        />
      )}
    </section>
  )
}
