'use client'

import { useState } from 'react'
import {
  Eye, CheckCircle2, UserCheck, Play, Receipt, X, CreditCard,
  Calendar as CalendarIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { PROFESSIONALS, type Appointment, type Professional } from '@/lib/mock-data'
import PaymentModal from '@/components/shared/payment-modal'
import NewAppointmentModal from '@/components/agenda/new-appointment-modal'

type AppointmentStatus = Appointment['status']
type Variant = 'ghost' | 'primary' | 'danger'
type Modal = 'payment' | 'reschedule'

interface ActionDef {
  label: string
  icon: LucideIcon
  variant: Variant
  modal?: Modal
}

const ACTIONS: Record<AppointmentStatus, ActionDef[]> = {
  SCHEDULED: [
    { label: 'Ver',       icon: Eye,          variant: 'ghost'   },
    { label: 'Confirmar', icon: CheckCircle2, variant: 'primary' },
    { label: 'Reagendar', icon: CalendarIcon, variant: 'ghost',   modal: 'reschedule' },
    { label: 'Cancelar',  icon: X,            variant: 'danger'  },
  ],
  CONFIRMED: [
    { label: 'Ver',       icon: Eye,          variant: 'ghost'   },
    { label: 'Check-in',  icon: UserCheck,    variant: 'primary' },
    { label: 'Reagendar', icon: CalendarIcon, variant: 'ghost',   modal: 'reschedule' },
    { label: 'Cancelar',  icon: X,            variant: 'danger'  },
  ],
  CHECKED_IN: [
    { label: 'Ver',      icon: Eye,  variant: 'ghost'   },
    { label: 'Iniciar',  icon: Play, variant: 'primary' },
    { label: 'Cancelar', icon: X,    variant: 'danger'  },
  ],
  IN_SERVICE: [
    { label: 'Ver',          icon: Eye,     variant: 'ghost'   },
    { label: 'Abrir Comanda', icon: Receipt, variant: 'primary', modal: 'payment' },
  ],
  AWAITING_PAYMENT: [
    { label: 'Cobrar', icon: CreditCard, variant: 'primary', modal: 'payment' },
  ],
  COMPLETED: [
    { label: 'Ver Comanda', icon: Receipt, variant: 'ghost', modal: 'payment' },
  ],
  NO_SHOW: [
    { label: 'Ver', icon: Eye, variant: 'ghost' },
  ],
  CANCELLED: [
    { label: 'Ver', icon: Eye, variant: 'ghost' },
  ],
}

const VARIANT_CLASS: Record<Variant, string> = {
  ghost:   'inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
  primary: 'inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
  danger:  'inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEE2E2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]" aria-hidden="true">
      <div className="h-10 bg-[#F8FAFC] border-b border-[#E2E8F0]" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 py-3 last:border-0">
          <div className="h-3.5 w-10 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
          <div className="h-3.5 w-28 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
          <div className="h-3.5 w-24 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
          <div className="ml-auto h-5 w-20 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]" />
        </div>
      ))}
    </div>
  )
}

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
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por profissional"
      >
        {PROFESSIONALS.map((prof) => {
          const isActive = activeProf === prof
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
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">Hora</th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">Cliente</th>
                  <th scope="col" className="hidden px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569] md:table-cell">Serviço</th>
                  <th scope="col" className="hidden px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569] lg:table-cell">Profissional</th>
                  <th scope="col" className="hidden px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569] xl:table-cell">Valor</th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-[14px] font-medium text-[#475569]">Nenhum agendamento para este filtro</p>
                      <p className="mt-0.5 text-[12px] text-[#475569]">Tente selecionar outro profissional</p>
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

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {ACTIONS[appt.status]?.map((action) => {
                            const onClick =
                              action.modal === 'payment'    ? () => setPaymentAppt(appt)    :
                              action.modal === 'reschedule' ? () => setRescheduleAppt(appt) :
                              undefined
                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={onClick}
                                className={VARIANT_CLASS[action.variant]}
                              >
                                <action.icon size={12} aria-hidden="true" />
                                {action.label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
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
