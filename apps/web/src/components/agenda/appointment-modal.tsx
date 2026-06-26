'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Clock, User, Scissors, CreditCard, CheckSquare, UserCheck, XCircle, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_STYLES, CALENDAR_PROFESSIONALS, type CalendarAppointment } from '@/lib/calendar-utils'
import type { AppointmentStatus } from '@/lib/mock-data'
import PaymentModal from '@/components/shared/payment-modal'
import { agendaApi } from '@/lib/api/agenda'
import { api } from '@/lib/api/client'
import { FEATURES } from '@/lib/features'

interface ProfItem { id: string; name: string; specialty?: string }
interface ServItem { id: string; name: string; durationMin?: number }

interface Action {
  label: string
  icon: React.ElementType
  variant: 'primary' | 'secondary' | 'danger'
}

const REAGENDAR: Action = { label: 'Reagendar', icon: CalendarClock, variant: 'secondary' }

const ACTIONS: Partial<Record<AppointmentStatus, Action[]>> = {
  SCHEDULED:        [REAGENDAR, { label: 'Confirmar',    icon: CheckSquare, variant: 'primary'   }, { label: 'Cancelar', icon: XCircle,   variant: 'danger'    }],
  CONFIRMED:        [REAGENDAR, { label: 'Check-in',     icon: UserCheck,   variant: 'primary'   }, { label: 'Cancelar', icon: XCircle,   variant: 'danger'    }],
  CHECKED_IN:       [REAGENDAR, { label: 'Iniciar',      icon: Scissors,    variant: 'primary'   }, { label: 'Cancelar', icon: XCircle,   variant: 'danger'    }],
  IN_SERVICE:       [{ label: 'Finalizar',   icon: CheckSquare, variant: 'secondary' }, { label: 'Cobrar',      icon: CreditCard, variant: 'primary'   }],
  AWAITING_PAYMENT: [{ label: 'Cobrar Agora', icon: CreditCard, variant: 'primary'   }],
}

const BTN = {
  primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
  secondary: 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
  danger:    'border border-[#FEE2E2] text-[#991B1B] hover:bg-[#FEF2F2]',
}

const PAYMENT_ACTIONS = new Set(['Cobrar', 'Cobrar Agora', 'Finalizar'])

const HORARIOS = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00',
]

const SELECT_CLS = 'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]'

interface AppointmentModalProps {
  appointment: CalendarAppointment | null
  onClose: () => void
  onSuccess?: () => void
  onReschedule?: (appt: CalendarAppointment) => void
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function AppointmentModal({ appointment, onClose, onSuccess, onReschedule: _onReschedule }: AppointmentModalProps) {
  const [paymentOpen, setPaymentOpen]         = useState(false)
  const [reagendando, setReagendando]         = useState(false)
  const [cancelMode, setCancelMode]           = useState(false)
  const [motivo, setMotivo]                   = useState('')
  const [novaData, setNovaData]               = useState('')
  const [novoHorario, setNovoHorario]         = useState('')
  const [selectedProfId, setSelectedProfId]   = useState('')
  const [selectedServId, setSelectedServId]   = useState('')
  const [profissionais, setProfissionais]     = useState<ProfItem[]>([])
  const [servicos, setServicos]               = useState<ServItem[]>([])
  const [saving, setSaving]                   = useState(false)
  const paymentOpenRef = useRef(false)
  useEffect(() => { paymentOpenRef.current = paymentOpen }, [paymentOpen])

  // Reset all transient state when appointment changes
  useEffect(() => {
    setPaymentOpen(false)
    setReagendando(false)
    setCancelMode(false)
    setMotivo('')
    setNovaData('')
    setNovoHorario('')
    setSelectedProfId('')
    setSelectedServId('')
    setSaving(false)
  }, [appointment?.id])

  // Fetch professionals from real API
  useEffect(() => {
    if (!FEATURES.realAgenda) return
    ;(api as any).get('/api/v1/professionals')
      .then((r: unknown) => {
        const arr = Array.isArray(r) ? r : []
        setProfissionais(arr as ProfItem[])
      })
      .catch(() => {})
  }, [])

  // Fetch services from real API
  useEffect(() => {
    if (!FEATURES.realAgenda) return
    ;(api as any).get('/api/v1/services')
      .then((r: unknown) => {
        const arr = Array.isArray(r) ? r : []
        setServicos(arr as ServItem[])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!appointment) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (paymentOpenRef.current) { setPaymentOpen(false); return }
      if (reagendando)             { setReagendando(false); return }
      if (cancelMode)              { setCancelMode(false);  return }
      onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [appointment, onClose, reagendando, cancelMode])

  if (!appointment) return null

  const style = STATUS_STYLES[appointment.status]
  const prof = CALENDAR_PROFESSIONALS.find((p) => p.id === appointment.professionalId)
  const actions = ACTIONS[appointment.status] ?? []

  function handleAction(label: string) {
    if (!appointment) return
    if (PAYMENT_ACTIONS.has(label)) { setPaymentOpen(true); return }
    if (label === 'Reagendar') {
      setNovaData(appointment.date)
      setNovoHorario(appointment.startTime)
      setSelectedProfId(appointment.professionalId)
      setSelectedServId(appointment.serviceId ?? '')
      setReagendando(true)
      return
    }
    if (label === 'Cancelar') {
      setCancelMode(true)
    }
  }

  async function handleReagendar() {
    if (!novaData || !novoHorario || !appointment) return
    setSaving(true)
    try {
      if (FEATURES.realAgenda) {
        await agendaApi.update(appointment.id, {
          professionalId: selectedProfId || undefined,
          serviceId:      selectedServId || undefined,
          date:           novaData,
          startTime:      novoHorario,
        })
      }
      onSuccess?.()
      onClose()
    } catch {
      setSaving(false)
    }
  }

  async function handleCancelar() {
    if (!appointment) return
    setSaving(true)
    try {
      if (FEATURES.realAgenda) {
        await agendaApi.update(appointment.id, {
          status:       'CANCELLED',
          cancelReason: motivo || undefined,
        } as Parameters<typeof agendaApi.update>[1])
      }
      onSuccess?.()
      onClose()
    } catch {
      setSaving(false)
    }
  }

  function handlePaymentConfirm() {
    setPaymentOpen(false)
    onClose()
  }

  const showActions = !reagendando && !cancelMode && actions.length > 0

  return (
    <>
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

          {/* Inline reagendar form */}
          {reagendando && (
            <div className="space-y-3 border-t border-[#F1F5F9] px-5 py-4">
              <p className="text-[12px] font-medium text-[#475569]">Reagendar</p>

              {FEATURES.realAgenda && profissionais.length > 0 && (
                <div>
                  <label className="mb-1 block text-[12px] text-[#64748B]">Profissional</label>
                  <select value={selectedProfId} onChange={(e) => setSelectedProfId(e.target.value)} className={SELECT_CLS}>
                    <option value="">Selecionar profissional…</option>
                    {profissionais.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}{p.specialty ? ` — ${p.specialty}` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {FEATURES.realAgenda && servicos.length > 0 && (
                <div>
                  <label className="mb-1 block text-[12px] text-[#64748B]">Serviço</label>
                  <select value={selectedServId} onChange={(e) => setSelectedServId(e.target.value)} className={SELECT_CLS}>
                    <option value="">Selecionar serviço…</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-[12px] text-[#64748B]">Data</label>
                <input
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className={SELECT_CLS}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-[#64748B]">Horário</label>
                <select value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} className={SELECT_CLS}>
                  {HORARIOS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReagendando(false)}
                  className={cn('flex-1 rounded-lg border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569]', 'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]')}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleReagendar}
                  disabled={saving || !novaData || !novoHorario}
                  className={cn('flex-1 rounded-lg bg-[#2563EB] py-2 text-[13px] font-medium text-white', 'transition-colors hover:bg-[#1D4ED8] disabled:opacity-50', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]')}
                >
                  {saving ? 'Salvando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {/* Cancel form */}
          {cancelMode && (
            <div className="space-y-4 border-t border-[#F1F5F9] px-5 py-4">
              <p className="text-[12px] font-medium text-[#475569]">Motivo do cancelamento (opcional)</p>
              <textarea
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex.: cliente solicitou, conflito de agenda…"
                className={cn('w-full resize-none rounded-md border border-[#E2E8F0] px-3 py-2', 'text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]', 'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]')}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelMode(false)}
                  className={cn('flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569]', 'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]')}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={saving}
                  className={cn('flex-1 rounded-md bg-[#DC2626] py-2 text-[13px] font-medium text-white', 'transition-colors hover:bg-[#B91C1C] disabled:opacity-50', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]')}
                >
                  {saving ? 'Cancelando…' : 'Confirmar cancelamento'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 border-t border-[#F1F5F9] px-5 py-4">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleAction(action.label)}
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

      <PaymentModal
        open={paymentOpen}
        clientName={appointment.client}
        professionalName={prof?.name ?? ''}
        serviceName={appointment.service}
        date={formatDateDisplay(appointment.date)}
        startTime={appointment.startTime}
        endTime={appointment.endTime}
        items={
          appointment.services?.length
            ? appointment.services
            : [{ name: appointment.service, quantity: 1, unitPrice: appointment.amount }]
        }
        deposit={appointment.deposit}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
      />
    </>
  )
}
