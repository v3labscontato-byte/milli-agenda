'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, User, X, AlertTriangle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchPublicClientAppointments,
  cancelPublicAppointment,
  TENANT_SLUG,
  type PublicAppointmentItem,
} from '@/lib/api/public-booking'
import { useBookingClient, type BookingClientInfo } from '@/hooks/use-booking-client'
import { usePublicTenant } from '@/hooks/use-public-tenant'
import PhoneIdentify from '@/components/booking/phone-identify'

type ActiveStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_SERVICE' | 'AWAITING_PAYMENT'
type DoneStatus   = 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
type Tab = 'upcoming' | 'history'

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendado', CONFIRMED: 'Confirmado', CHECKED_IN: 'Check-in',
  IN_SERVICE: 'Em atendimento', AWAITING_PAYMENT: 'Aguardando pag.',
  COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não compareceu',
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:        'bg-[#DBEAFE] text-[#2563EB]',
  CONFIRMED:        'bg-[#DBEAFE] text-[#2563EB]',
  CHECKED_IN:       'bg-[#DBEAFE] text-[#2563EB]',
  IN_SERVICE:       'bg-[#DBEAFE] text-[#2563EB]',
  AWAITING_PAYMENT: 'bg-[#FEF9C3] text-[#CA8A04]',
  COMPLETED:        'bg-[#DCFCE7] text-[#16A34A]',
  CANCELLED:        'bg-[#F1F5F9] text-[#64748B]',
  NO_SHOW:          'bg-[#FEE2E2] text-[#DC2626]',
}

const ACTIVE_STATUSES: string[] = ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE', 'AWAITING_PAYMENT']

function isUpcoming(appt: PublicAppointmentItem): boolean {
  return ACTIVE_STATUSES.includes(appt.status) && new Date(appt.startAt) > new Date()
}

function formatApptDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Cancel Modal ────────────────────────────────────────────────────────────

interface CancelModalProps {
  appt: PublicAppointmentItem
  phone: string
  minHours: number
  feePercent: number
  onConfirm: (id: string) => void
  onClose: () => void
}

function CancelModal({ appt, phone, minHours, feePercent, onConfirm, onClose }: CancelModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const hoursUntil = (new Date(appt.startAt).getTime() - Date.now()) / 3_600_000
  const freeCancel = hoursUntil >= minHours

  async function handleConfirm() {
    setError('')
    setLoading(true)
    try {
      await cancelPublicAppointment(TENANT_SLUG, appt.id, phone)
      onConfirm(appt.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar. Tente novamente.')
    } finally {
      setLoading(false)
    }
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
          {appt.service.name} · {formatApptDate(appt.startAt)}
        </p>

        <div className={cn(
          'mt-4 flex items-start gap-3 rounded-2xl p-4',
          freeCancel ? 'bg-[#DCFCE7]' : 'bg-[#FEF9C3] border border-[#FDE68A]',
        )}>
          <AlertTriangle size={18} className={freeCancel ? 'text-[#16A34A]' : 'text-[#CA8A04]'} aria-hidden="true" />
          <div>
            {freeCancel ? (
              <>
                <p className="text-[13px] font-semibold text-[#16A34A]">Cancelamento gratuito</p>
                <p className="text-[12px] text-content-secondary">
                  Com mais de {minHours}h de antecedência — sem cobrança.
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[#CA8A04]">Fora do prazo de cancelamento</p>
                <p className="text-[12px] text-content-secondary">
                  Cancelamentos devem ser feitos com pelo menos {minHours}h de antecedência.
                  {feePercent > 0 && ` Taxa de ${feePercent}% pode ser cobrada.`}
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2 text-[13px] text-[#DC2626]">
            {error}
          </p>
        )}

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
            disabled={loading}
            onClick={handleConfirm}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#DC2626]',
              !loading
                ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
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

// ─── Appointment Cards ────────────────────────────────────────────────────────

interface UpcomingCardProps {
  appt: PublicAppointmentItem
  idx: number
  onCancelRequest: (appt: PublicAppointmentItem) => void
  onReschedule: (appt: PublicAppointmentItem) => void
}

function UpcomingCard({ appt, idx, onCancelRequest, onReschedule }: UpcomingCardProps) {
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
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_COLOR[appt.status] ?? 'bg-[#F1F5F9] text-[#64748B]')}>
          {STATUS_LABEL[appt.status] ?? appt.status}
        </span>
        <span className="tabular-nums text-[14px] font-bold text-content-primary">
          {formatPrice(appt.service.price)}
        </span>
      </div>
      <p className="text-[16px] font-semibold text-content-primary">{appt.service.name}</p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <Calendar size={13} aria-hidden="true" />{formatApptDate(appt.startAt)}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-content-secondary">
          <User size={13} aria-hidden="true" />{appt.professional.name}
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
          className={cn(actionBtn, 'border-border text-[#DC2626] hover:border-[#DC2626]')}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function PastCard({ appt, idx }: { appt: PublicAppointmentItem; idx: number }) {
  return (
    <div
      className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_COLOR[appt.status] ?? 'bg-[#F1F5F9] text-[#64748B]')}>
          {STATUS_LABEL[appt.status] ?? appt.status}
        </span>
        <span className="tabular-nums text-[13px] font-semibold text-content-secondary">
          {formatPrice(appt.service.price)}
        </span>
      </div>
      <p className="text-[14px] font-medium text-content-primary">{appt.service.name} · {appt.professional.name}</p>
      <p className="mt-1 text-[12px] text-content-subtle">{formatApptDate(appt.startAt)}</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#F1F5F9]" />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeusAgendamentosPage() {
  const router = useRouter()
  const { client, setClient, clearClient, ready } = useBookingClient()
  const { tenant } = usePublicTenant()

  const [appointments, setAppointments] = useState<PublicAppointmentItem[]>([])
  const [loading, setLoading]           = useState(false)
  const [activeTab, setActiveTab]       = useState<Tab>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<PublicAppointmentItem | null>(null)

  const minHours   = tenant?.cancellationMinHours  ?? 24
  const feePercent = tenant?.cancellationFeePercent ?? 0

  const loadAppointments = useCallback(async (c: BookingClientInfo) => {
    setLoading(true)
    try {
      const { appointments: list } = await fetchPublicClientAppointments(TENANT_SLUG, c.phone)
      setAppointments(list)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (ready && client) loadAppointments(client)
  }, [ready, client, loadAppointments])

  function handleFound(c: BookingClientInfo) {
    setClient(c)
    loadAppointments(c)
  }

  function handleCancelConfirm(id: string) {
    setAppointments((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a),
    )
    setCancelTarget(null)
  }

  function handleReschedule(appt: PublicAppointmentItem) {
    sessionStorage.setItem('reschedule', JSON.stringify({ apptId: appt.id }))
    router.push('/booking/agendar')
  }

  if (!ready) return null
  if (!client) return <PhoneIdentify onFound={handleFound} tenant={tenant} />

  const upcoming = appointments.filter(isUpcoming)
  const history  = appointments.filter((a) => !isUpcoming(a))

  return (
    <div className="flex flex-col">
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          phone={client.phone}
          minHours={minHours}
          feePercent={feePercent}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-background-secondary px-5 pb-0 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-bold text-content-primary">Meus Agendamentos</h1>
            <p className="mt-0.5 text-[12px] text-content-subtle">{client.name}</p>
          </div>
          <button
            type="button"
            onClick={clearClient}
            aria-label="Sair da identificação"
            className="flex h-9 w-9 items-center justify-center rounded-full text-content-subtle transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>

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
              {tab === 'upcoming'
                ? `Próximos${loading ? '' : ` (${upcoming.length})`}`
                : `Histórico${loading ? '' : ` (${history.length})`}`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <Skeleton />
        ) : activeTab === 'upcoming' ? (
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
                <UpcomingCard
                  key={a.id}
                  appt={a}
                  idx={i}
                  onCancelRequest={setCancelTarget}
                  onReschedule={handleReschedule}
                />
              ))}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-body text-content-subtle">Nenhum histórico ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((a, i) => <PastCard key={a.id} appt={a} idx={i} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
