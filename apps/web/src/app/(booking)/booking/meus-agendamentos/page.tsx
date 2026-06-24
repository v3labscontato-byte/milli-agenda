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

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  CONFIRMED:  'bg-[#DCFCE7] text-[#166534]',
  SCHEDULED:  'bg-[#DBEAFE] text-[#1E40AF]',
  COMPLETED:  'bg-[#F1F5F9] text-[#475569]',
  CANCELLED:  'bg-[#FEE2E2] text-[#991B1B]',
}

function StarRating({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={cn('transition-colors', i < n ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E2E8F0]')} aria-hidden="true" />
      ))}
    </span>
  )
}

interface UpcomingCardProps {
  appt: BookingAppointment
  onCancel: (id: string) => void
}

function UpcomingCard({ appt, onCancel }: UpcomingCardProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_COLOR[appt.status])}>
          {STATUS_LABEL[appt.status]}
        </span>
        <span className="font-tabular text-[14px] font-bold text-[#0F172A]">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[16px] font-semibold text-[#0F172A]">
        {appt.serviceEmoji} {appt.service}
      </p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center gap-2 text-[13px] text-[#475569]">
          <Calendar size={13} aria-hidden="true" />
          {appt.dateLabel}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-[#475569]">
          <User size={13} aria-hidden="true" />
          {appt.professional} · Salão Bella Vista
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
        >
          Reagendar
        </button>
        {confirming ? (
          <div className="flex flex-1 gap-1.5">
            <button
              type="button"
              onClick={() => onCancel(appt.id)}
              className="flex-1 rounded-xl bg-[#DC2626] py-2.5 text-[13px] font-medium text-white hover:bg-[#B91C1C]"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569]"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#DC2626] hover:border-[#DC2626]"
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
  onRate: (id: string) => void
}

function PastCard({ appt, onRate }: PastCardProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[#64748B]">
          ✓ {STATUS_LABEL[appt.status]} · {appt.dateLabel}
        </span>
        <span className="font-tabular text-[13px] font-semibold text-[#475569]">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[14px] font-medium text-[#0F172A]">
        {appt.serviceEmoji} {appt.service} · {appt.professional}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {appt.rated ? (
          <StarRating n={5} />
        ) : (
          <button
            type="button"
            onClick={() => onRate(appt.id)}
            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:border-[#F59E0B] hover:text-[#D97706]"
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
      <div className="border-b border-[#F1F5F9] px-5 pt-6 pb-0">
        <h1 className="text-[20px] font-bold text-[#0F172A]">Meus Agendamentos</h1>
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                activeTab === tab
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#475569]',
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
              <p className="text-[15px] font-medium text-[#0F172A]">Nenhum agendamento próximo</p>
              <p className="mt-1 text-[13px] text-[#64748B]">Que tal marcar um horário?</p>
              <Link
                href="/booking/agendar"
                className="mt-4 rounded-xl bg-[#2563EB] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Agendar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => <UpcomingCard key={a.id} appt={a} onCancel={cancelUpcoming} />)}
            </div>
          )
        )}

        {activeTab === 'history' && (
          past.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[14px] text-[#94A3B8]">Nenhum histórico ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((a) => <PastCard key={a.id} appt={a} onRate={markRated} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
