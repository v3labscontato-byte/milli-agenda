'use client'

import { useState } from 'react'
import { ClipboardList, CheckSquare, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { PROFESSIONALS, type Appointment, type Professional } from '@/lib/mock-data'
import PaymentModal from '@/components/shared/payment-modal'
import NewAppointmentModal from '@/components/agenda/new-appointment-modal'

// ─── Constants ────────────────────────────────────────────────────────────────

const TH = 'px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]'
const TH_ACTION = cn(TH, 'w-28 text-center')
const BTN = [
  'inline-flex items-center gap-1 rounded px-2 py-1',
  'text-[11px] font-medium transition-colors motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
].join(' ')

function Dash() {
  return (
    <td className="w-28 px-2 py-3 text-center">
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

// ─── Action cell renderers ─────────────────────────────────────────────────────

function ComandaCell({
  appt,
  onOpen,
}: {
  appt: Appointment
  onOpen: () => void
}) {
  const { status } = appt
  if (status === 'CANCELLED' || status === 'NO_SHOW') return <Dash />

  const isAbrir =
    status === 'CHECKED_IN' || status === 'IN_SERVICE' || status === 'AWAITING_PAYMENT'

  return (
    <td className="w-28 px-2 py-3 text-center">
      <button
        type="button"
        onClick={isAbrir ? onOpen : undefined}
        aria-label={`${isAbrir ? 'Abrir' : 'Ver'} comanda de ${appt.client}`}
        className={cn(
          BTN,
          isAbrir
            ? 'text-[#2563EB] hover:bg-[#EFF6FF]'
            : 'text-[#475569] hover:bg-[#F1F5F9]',
        )}
      >
        <ClipboardList size={12} aria-hidden="true" />
        {isAbrir ? 'Abrir' : 'Ver'}
      </button>
    </td>
  )
}

function ConfirmarCell({ appt }: { appt: Appointment }) {
  const { status } = appt
  if (status !== 'SCHEDULED' && status !== 'CONFIRMED') return <Dash />
  return (
    <td className="w-28 px-2 py-3 text-center">
      <button
        type="button"
        aria-label={`Confirmar agendamento de ${appt.client}`}
        className={cn(BTN, 'text-[#16A34A] hover:bg-[#F0FDF4]')}
      >
        <CheckSquare size={12} aria-hidden="true" />
        Confirmar
      </button>
    </td>
  )
}

function ReagendarCell({
  appt,
  onReschedule,
}: {
  appt: Appointment
  onReschedule: () => void
}) {
  const { status } = appt
  if (status !== 'SCHEDULED' && status !== 'CONFIRMED') return <Dash />
  return (
    <td className="w-28 px-2 py-3 text-center">
      <button
        type="button"
        onClick={onReschedule}
        aria-label={`Reagendar agendamento de ${appt.client}`}
        className={cn(BTN, 'text-[#D97706] hover:bg-[#FFFBEB]')}
      >
        <Calendar size={12} aria-hidden="true" />
        Reagendar
      </button>
    </td>
  )
}

function CancelarCell({ appt }: { appt: Appointment }) {
  const { status } = appt
  if (status !== 'SCHEDULED' && status !== 'CONFIRMED') return <Dash />
  return (
    <td className="w-28 px-2 py-3 text-center">
      <button
        type="button"
        aria-label={`Cancelar agendamento de ${appt.client}`}
        className={cn(BTN, 'text-[#DC2626] hover:bg-[#FEF2F2]')}
      >
        <X size={12} aria-hidden="true" />
        Cancelar
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
          const isActive   = activeProf === prof
          const shortName  = prof === 'Todos' ? 'Todos' : prof.split(' ')[0]
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
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th scope="col" className={TH}>Hora</th>
                  <th scope="col" className={TH}>Cliente</th>
                  <th scope="col" className={cn(TH, 'hidden md:table-cell')}>Serviço</th>
                  <th scope="col" className={cn(TH, 'hidden lg:table-cell')}>Profissional</th>
                  <th scope="col" className={cn(TH, 'hidden text-right xl:table-cell')}>Valor</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={TH_ACTION}>Comanda</th>
                  <th scope="col" className={TH_ACTION}>Confirmar</th>
                  <th scope="col" className={TH_ACTION}>Reagendar</th>
                  <th scope="col" className={TH_ACTION}>Cancelar</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
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

                      <ComandaCell appt={appt} onOpen={() => setPaymentAppt(appt)} />
                      <ConfirmarCell appt={appt} />
                      <ReagendarCell appt={appt} onReschedule={() => setRescheduleAppt(appt)} />
                      <CancelarCell appt={appt} />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
