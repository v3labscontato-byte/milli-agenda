'use client'

import { useState } from 'react'
import { Eye, UserCheck, CheckSquare, CreditCard, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { PROFESSIONALS, type Appointment, type AppointmentStatus, type Professional } from '@/lib/mock-data'

// Maps each actionable status to the appropriate next-step action
interface QuickAction {
  icon: LucideIcon
  label: string
  colorClass: string
}

const QUICK_ACTIONS: Partial<Record<AppointmentStatus, QuickAction>> = {
  SCHEDULED:        { icon: CheckSquare, label: 'Confirmar', colorClass: 'text-[#1D4ED8] hover:bg-[#EFF6FF]' },
  CONFIRMED:        { icon: UserCheck,   label: 'Check-in',  colorClass: 'text-[#065F46] hover:bg-[#D1FAE5]' },
  CHECKED_IN:       { icon: CheckSquare, label: 'Iniciar',   colorClass: 'text-[#6B21A8] hover:bg-[#F3E8FF]' },
  IN_SERVICE:       { icon: CreditCard,  label: 'Cobrar',    colorClass: 'text-[#2563EB] hover:bg-[#EFF6FF]' },
  AWAITING_PAYMENT: { icon: CreditCard,  label: 'Cobrar',    colorClass: 'text-[#991B1B] hover:bg-[#FEE2E2]' },
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
  const [activeProf, setActiveProf] = useState<Professional>('Todos')

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
                  <th scope="col" className="w-28 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">
                    <span className="sr-only">Ações</span>
                  </th>
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
                  filtered.map((appt) => {
                    const action = QUICK_ACTIONS[appt.status]
                    return (
                      // group enables group-hover / group-focus-within on action buttons
                      <tr
                        key={appt.id}
                        className="group border-b border-[#E2E8F0] bg-white transition-colors last:border-0 hover:bg-[#F8FAFC]"
                      >
                        <td className="px-4 py-3">
                          <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                            {appt.time}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-[14px] font-medium text-[#0F172A]">{appt.client}</p>
                          {/* Service shown inline on small screens where its column is hidden */}
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

                        {/* Actions: hidden until row hover OR keyboard focus (WCAG: keyboard parity) */}
                        <td className="px-4 py-3">
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1',
                              'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
                            )}
                          >
                            <button
                              type="button"
                              aria-label={`Ver detalhes de ${appt.client}`}
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded',
                                'text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                              )}
                            >
                              <Eye size={14} aria-hidden="true" />
                            </button>

                            {action && (
                              <button
                                type="button"
                                aria-label={`${action.label}: ${appt.client}`}
                                className={cn(
                                  'flex items-center gap-1 rounded px-2 py-1',
                                  'text-[12px] font-medium transition-colors',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                                  action.colorClass,
                                )}
                              >
                                <action.icon size={12} aria-hidden="true" />
                                {action.label}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
