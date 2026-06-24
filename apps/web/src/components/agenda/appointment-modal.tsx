'use client'

import { useEffect } from 'react'
import { X, Clock, User, Scissors, CreditCard, CheckSquare, UserCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_STYLES, CALENDAR_PROFESSIONALS, type CalendarAppointment } from '@/lib/calendar-utils'
import type { AppointmentStatus } from '@/lib/mock-data'

interface Action {
  label: string
  icon: React.ElementType
  variant: 'primary' | 'secondary' | 'danger'
}

const ACTIONS: Partial<Record<AppointmentStatus, Action[]>> = {
  CONFIRMED:        [{ label: 'Check-in',            icon: UserCheck,   variant: 'primary'   }, { label: 'Cancelar', icon: XCircle, variant: 'danger' }],
  CHECKED_IN:       [{ label: 'Iniciar Atendimento',  icon: Scissors,    variant: 'primary'   }, { label: 'Cancelar', icon: XCircle, variant: 'danger' }],
  IN_SERVICE:       [{ label: 'Finalizar',            icon: CheckSquare, variant: 'secondary' }, { label: 'Cobrar',   icon: CreditCard, variant: 'primary' }],
  AWAITING_PAYMENT: [{ label: 'Cobrar Agora',         icon: CreditCard,  variant: 'primary'   }],
  SCHEDULED:        [{ label: 'Confirmar',            icon: CheckSquare, variant: 'primary'   }, { label: 'Cancelar', icon: XCircle, variant: 'danger' }],
}

const BTN = {
  primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
  secondary: 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
  danger:    'border border-[#FEE2E2] text-[#991B1B] hover:bg-[#FEF2F2]',
}

interface AppointmentModalProps {
  appointment: CalendarAppointment | null
  onClose: () => void
}

export default function AppointmentModal({ appointment, onClose }: AppointmentModalProps) {
  useEffect(() => {
    if (!appointment) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [appointment, onClose])

  if (!appointment) return null

  const style = STATUS_STYLES[appointment.status]
  const prof = CALENDAR_PROFESSIONALS.find((p) => p.id === appointment.professionalId)
  const actions = ACTIONS[appointment.status] ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes: ${appointment.client}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className={cn('rounded-t-xl px-5 py-4', style.bg)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn('text-[16px] font-semibold leading-tight', style.text)}>
                {appointment.client}
              </p>
              <p className="mt-0.5 text-[13px] text-[#475569]">{appointment.service}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Status badge */}
          <span className={cn('mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', style.text, style.bg, 'border-current/20')}>
            {style.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 px-5 py-4">
          <div className="flex items-center gap-2.5 text-[13px] text-[#475569]">
            <Clock size={14} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span>
              {appointment.startTime} → {appointment.endTime}
              <span className="ml-1.5 text-[12px] text-[#94A3B8]">({appointment.durationMinutes} min)</span>
            </span>
          </div>

          {prof && (
            <div className="flex items-center gap-2.5 text-[13px] text-[#475569]">
              <User size={14} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
              <span>{prof.name} · <span className="text-[#94A3B8]">{prof.role}</span></span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-[13px] text-[#475569]">
            <CreditCard size={14} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="font-tabular font-semibold text-[#0F172A]">R$ {appointment.amount}</span>
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 border-t border-[#F1F5F9] px-5 py-4">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  type="button"
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    BTN[action.variant],
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  {action.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
