'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, User, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  UPCOMING_APPOINTMENTS,
  PAST_APPOINTMENTS,
  formatPrice,
  type BookingAppointment,
  type AppointmentStatus,
} from '@/lib/booking-mock'

type Tab = 'upcoming' | 'history'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  CONFIRMED:  'Confirmado',
  SCHEDULED:  'Agendado',
  COMPLETED:  'Concluído',
  CANCELLED:  'Cancelado',
}

// Aligned with status tokens in tailwind.config.ts
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  CONFIRMED: 'bg-status-confirmed-bg text-status-confirmed-text',
  SCHEDULED: 'bg-status-scheduled-bg text-status-scheduled-text',
  COMPLETED: 'bg-background-secondary text-content-secondary',
  CANCELLED: 'bg-status-cancelled-bg text-status-cancelled-text',
}

function StarRating({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn('transition-colors', i < n ? 'fill-warning text-warning' : 'text-border')}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

interface UpcomingCardProps {
  appt: BookingAppointment
  idx: number
  onCancel: (id: string) => void
}

function UpcomingCard({ appt, idx, onCancel }: UpcomingCardProps) {
  const [confirming, setConfirming] = useState(false)

  const actionBtn = cn(
    'flex-1 min-h-[44px] flex items-center justify-center rounded-xl border',
    'text-[13px] font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
  )

  return (
    <div
      className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_COLOR[appt.status])}>
          {STATUS_LABEL[appt.status]}
        </span>
        <span className="tabular-nums text-[14px] font-bold text-content-primary">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[16px] font-semibold text-content-primary">
        {appt.serviceEmoji} {appt.service}
      </p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <Calendar size={13} aria-hidden="true" />
          {appt.dateLabel}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <User size={13} aria-hidden="true" />
          {appt.professional} · Salão Bella Vista
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className={cn(actionBtn, 'border-border text-content-secondary hover:border-primary hover:text-primary')}
        >
          Reagendar
        </button>
        {confirming ? (
          <div className="flex flex-1 gap-1.5">
            <button
              type="button"
              onClick={() => onCancel(appt.id)}
              className={cn(actionBtn, 'border-danger-medium bg-danger-medium text-white hover:bg-danger-strong')}
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={cn(actionBtn, 'border-border text-content-secondary')}
            >
              Não
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={cn(actionBtn, 'border-border text-danger-medium hover:border-danger-medium')}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

interface PastCardProps {
  appt: BookingAppointment
  idx: number
  onRate: (id: string) => void
}

function PastCard({ appt, idx, onRate }: PastCardProps) {
  return (
    <div
      className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-content-subtle">
          ✓ {STATUS_LABEL[appt.status]} · {appt.dateLabel}
        </span>
        <span className="tabular-nums text-[13px] font-semibold text-content-secondary">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[14px] font-medium text-content-primary">
        {appt.serviceEmoji} {appt.service} · {appt.professional}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {appt.rated ? (
          <StarRating n={5} />
        ) : (
          <button
            type="button"
            onClick={() => onRate(appt.id)}
            className={cn(
              'flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border px-4',
              'text-[13px] font-medium text-content-secondary',
              'transition-colors hover:border-warning hover:text-warning-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-light',
            )}
          >
            <Star size={13} aria-hidden="true" />
            Avaliar
          </button>
        )}
      </div>
    </div>
  )
}

export default function MeusAgendamentosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [upcoming, setUpcoming]   = useState<BookingAppointment[]>(UPCOMING_APPOINTMENTS)
  const [past, setPast]           = useState<BookingAppointment[]>(PAST_APPOINTMENTS)

  function cancelUpcoming(id: string) {
    setUpcoming((prev) => prev.filter((a) => a.id !== id))
  }

  function markRated(id: string) {
    setPast((prev) => prev.map((a) => a.id === id ? { ...a, rated: true } : a))
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-background-secondary px-5 pb-0 pt-6">
        <h1 className="text-h2 font-bold text-content-primary">Meus Agendamentos</h1>
        <div className="mt-4 flex gap-1" role="tablist" aria-label="Abas de agendamentos">
          {(['upcoming', 'history'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 px-4 pb-3 text-[14px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-content-subtle hover:text-content-secondary',
              )}
            >
              {tab === 'upcoming' ? `Próximos (${upcoming.length})` : `Histórico (${past.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        {activeTab === 'upcoming' && (
          upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <span className="mb-3 text-[40px]" aria-hidden="true">📅</span>
              <p className="text-[15px] font-medium text-content-primary">Nenhum agendamento próximo</p>
              <p className="mt-1 text-[13px] text-content-subtle">Que tal marcar um horário?</p>
              <Link
                href="/booking/agendar"
                className="mt-4 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Agendar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a, i) => <UpcomingCard key={a.id} appt={a} idx={i} onCancel={cancelUpcoming} />)}
            </div>
          )
        )}

        {activeTab === 'history' && (
          past.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-body text-content-subtle">Nenhum histórico ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((a, i) => <PastCard key={a.id} appt={a} idx={i} onRate={markRated} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
