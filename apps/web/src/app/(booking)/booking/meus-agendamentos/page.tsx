'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, User, Star, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  UPCOMING_APPOINTMENTS, PAST_APPOINTMENTS,
  formatPrice, type BookingAppointment, type AppointmentStatus,
} from '@/lib/booking-mock'
import AvaliacaoModal from '@/components/booking/avaliacao-modal'

type Tab = 'upcoming' | 'history'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  CONFIRMED: 'Confirmado', SCHEDULED: 'Agendado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  CONFIRMED: 'bg-status-confirmed-bg text-status-confirmed-text',
  SCHEDULED: 'bg-status-scheduled-bg text-status-scheduled-text',
  COMPLETED: 'bg-background-secondary text-content-secondary',
  CANCELLED: 'bg-status-cancelled-bg text-status-cancelled-text',
}

const MOTIVOS = ['Compromisso imprevisto', 'Problema de saúde', 'Questão financeira', 'Mudança de planos', 'Outro']

function isFreeCancel(date: Date): boolean {
  return date.getTime() - Date.now() > 24 * 60 * 60 * 1000
}

function StarRating({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={cn('transition-colors', i < n ? 'fill-warning text-warning' : 'text-border')} aria-hidden="true" />
      ))}
    </span>
  )
}

interface CancelModalProps { appt: BookingAppointment; onConfirm: () => void; onClose: () => void }

function CancelModal({ appt, onConfirm, onClose }: CancelModalProps) {
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const free = isFreeCancel(appt.date)
  const fee  = free ? 0 : appt.price * 0.5

  async function handleConfirm() {
    if (!motivo) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div className="w-full max-w-md animate-fade-in rounded-t-3xl bg-white p-6 pb-8 motion-reduce:animate-none">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="cancel-modal-title" className="text-[16px] font-bold text-content-primary">Cancelar agendamento</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-content-subtle transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="text-[14px] text-content-secondary">
          {appt.serviceEmoji} {appt.service} · {appt.dateLabel}
        </p>

        {/* Policy */}
        <div className={cn('mt-4 flex items-start gap-3 rounded-2xl p-4', free ? 'bg-success-xlight' : 'bg-warning-light border border-warning-border')}>
          <AlertTriangle size={18} className={free ? 'text-success-medium' : 'text-warning-medium'} aria-hidden="true" />
          <div>
            {free ? (
              <>
                <p className="text-[13px] font-semibold text-success-medium">Cancelamento gratuito</p>
                <p className="text-[12px] text-content-secondary">Agendamento com mais de 24h — sem cobrança.</p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-warning-medium">Taxa de {formatPrice(fee)}</p>
                <p className="text-[12px] text-content-secondary">Menos de 24h de antecedência — 50% do valor cobrado.</p>
              </>
            )}
          </div>
        </div>

        {/* Motivo */}
        <div className="mt-4">
          <label htmlFor="cancel-motivo" className="mb-1.5 block text-[12px] font-medium text-content-secondary">
            Motivo do cancelamento <span className="text-danger-medium">*</span>
          </label>
          <select
            id="cancel-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-body text-content-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Selecione um motivo</option>
            {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-[14px] font-medium text-content-secondary transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={!motivo || loading}
            onClick={handleConfirm}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger-border',
              motivo && !loading
                ? 'bg-danger-medium text-white hover:bg-danger-strong'
                : 'cursor-not-allowed bg-background-secondary text-content-muted',
            )}
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />}
            {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface UpcomingCardProps {
  appt: BookingAppointment
  idx: number
  onCancelRequest: (appt: BookingAppointment) => void
  onReschedule: (appt: BookingAppointment) => void
}

function UpcomingCard({ appt, idx, onCancelRequest, onReschedule }: UpcomingCardProps) {
  const actionBtn = cn(
    'flex-1 min-h-[44px] flex items-center justify-center rounded-xl border',
    'text-[13px] font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
  )
  return (
    <div className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4" style={{ animationDelay: `${idx * 60}ms` }}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_COLOR[appt.status])}>
          {STATUS_LABEL[appt.status]}
        </span>
        <span className="tabular-nums text-[14px] font-bold text-content-primary">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[16px] font-semibold text-content-primary">{appt.serviceEmoji} {appt.service}</p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <Calendar size={13} aria-hidden="true" />{appt.dateLabel}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <User size={13} aria-hidden="true" />{appt.professional} · Salão Bella Vista
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onReschedule(appt)}
          className={cn(actionBtn, 'border-border text-content-secondary hover:border-primary hover:text-primary')}
        >
          Reagendar
        </button>
        <button
          type="button"
          onClick={() => onCancelRequest(appt)}
          className={cn(actionBtn, 'border-border text-danger-medium hover:border-danger-medium')}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

interface PastCardProps { appt: BookingAppointment; idx: number; onRate: (appt: BookingAppointment) => void }

function PastCard({ appt, idx, onRate }: PastCardProps) {
  return (
    <div className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4" style={{ animationDelay: `${idx * 60}ms` }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-content-subtle">✓ {STATUS_LABEL[appt.status]} · {appt.dateLabel}</span>
        <span className="tabular-nums text-[13px] font-semibold text-content-secondary">{formatPrice(appt.price)}</span>
      </div>
      <p className="text-[14px] font-medium text-content-primary">{appt.serviceEmoji} {appt.service} · {appt.professional}</p>
      <div className="mt-3 flex items-center gap-3">
        {appt.rated ? (
          <StarRating n={5} />
        ) : (
          <button
            type="button"
            onClick={() => onRate(appt)}
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
  const router = useRouter()
  const [activeTab,   setActiveTab]   = useState<Tab>('upcoming')
  const [upcoming,    setUpcoming]    = useState<BookingAppointment[]>(UPCOMING_APPOINTMENTS)
  const [past,        setPast]        = useState<BookingAppointment[]>(PAST_APPOINTMENTS)
  const [cancelTarget, setCancelTarget] = useState<BookingAppointment | null>(null)
  const [ratingTarget, setRatingTarget] = useState<BookingAppointment | null>(null)

  function handleCancelConfirm() {
    if (!cancelTarget) return
    setUpcoming((prev) => prev.filter((a) => a.id !== cancelTarget.id))
    setCancelTarget(null)
  }

  function handleReschedule(appt: BookingAppointment) {
    sessionStorage.setItem('reschedule', JSON.stringify({
      apptId: appt.id,
      serviceId: appt.serviceId,
      proId: appt.proId,
    }))
    router.push('/booking/agendar')
  }

  function handleRated(id: string) {
    setPast((prev) => prev.map((a) => a.id === id ? { ...a, rated: true } : a))
    setRatingTarget(null)
  }

  return (
    <div className="flex flex-col">
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {ratingTarget && (
        <AvaliacaoModal
          appt={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSubmit={handleRated}
        />
      )}

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
              {upcoming.map((a, i) => (
                <UpcomingCard key={a.id} appt={a} idx={i} onCancelRequest={setCancelTarget} onReschedule={handleReschedule} />
              ))}
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
              {past.map((a, i) => <PastCard key={a.id} appt={a} idx={i} onRate={setRatingTarget} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
