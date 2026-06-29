'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Clock, User, Scissors, CreditCard, CheckSquare, XCircle, CalendarClock, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_STYLES, type CalendarAppointment } from '@/lib/calendar-utils'
import type { AppointmentStatus } from '@/lib/mock-data'
import PaymentModal, { type PaymentResult } from '@/components/shared/payment-modal'
import { agendaApi } from '@/lib/api/agenda'

interface ProfItem { id: string; name: string; specialty?: string; workDays: number[]; workStart: string; workEnd: string }
interface ServItem { id: string; name: string; durationMin?: number; price?: number }

interface Action {
  label: string
  icon: React.ElementType
  variant: 'primary' | 'secondary' | 'danger' | 'success'
}

const REAGENDAR: Action = { label: 'Reagendar', icon: CalendarClock, variant: 'secondary' }

const ACTIONS: Partial<Record<AppointmentStatus, Action[]>> = {
  SCHEDULED:        [REAGENDAR, { label: 'Confirmar',    icon: CheckSquare, variant: 'primary'   }, { label: 'Cancelar',    icon: XCircle,   variant: 'danger'   }],
  CONFIRMED:        [REAGENDAR, { label: 'Finalizar',    icon: Receipt,     variant: 'success'   }, { label: 'Cancelar',    icon: XCircle,   variant: 'danger'   }],
  CHECKED_IN:       [REAGENDAR, { label: 'Iniciar',      icon: Scissors,    variant: 'primary'   }, { label: 'Cancelar',    icon: XCircle,   variant: 'danger'   }],
  IN_SERVICE:       [{ label: 'Finalizar',   icon: Receipt,     variant: 'success'   }, { label: 'Cobrar',      icon: CreditCard, variant: 'primary'  }],
  AWAITING_PAYMENT: [{ label: 'Cobrar Agora', icon: CreditCard, variant: 'primary'   }],
}

const BTN = {
  primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
  secondary: 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
  danger:    'border border-[#FEE2E2] text-[#991B1B] hover:bg-[#FEF2F2]',
  success:   'bg-[#16A34A] text-white hover:bg-[#15803D]',
}

const PAYMENT_ACTIONS = new Set(['Cobrar', 'Cobrar Agora', 'Finalizar'])

const SELECT_CLS = 'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]'

function getAuthToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
}

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
  const [paymentOpen, setPaymentOpen]               = useState(false)
  const [reagendando, setReagendando]               = useState(false)
  const [cancelMode, setCancelMode]                 = useState(false)
  const [motivo, setMotivo]                         = useState('')
  const [novaData, setNovaData]                     = useState('')
  const [novoHorario, setNovoHorario]               = useState('')
  const [selectedProfId, setSelectedProfId]         = useState('')
  const [selectedServId, setSelectedServId]         = useState('')
  const [profissionais, setProfissionais]           = useState<ProfItem[]>([])
  const [servicos, setServicos]                     = useState<ServItem[]>([])
  const [horariosDisponiveis, setHorariosDisp]      = useState<string[]>([])
  const [loadingHorarios, setLoadingHorarios]       = useState(false)
  const [saving, setSaving]                         = useState(false)
  const [paymentLoading, setPaymentLoading]         = useState(false)
  const paymentOpenRef = useRef(false)
  useEffect(() => { paymentOpenRef.current = paymentOpen }, [paymentOpen])

  // Reset transient state when appointment changes — but not while reagendando is active,
  // because handleAction sets the form fields and this effect would otherwise overwrite them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!appointment) return
    if (paymentOpenRef.current) return
    setPaymentOpen(false)
    setSaving(false)
    if (!reagendando) {
      setReagendando(false)
      setCancelMode(false)
      setMotivo('')
      setNovaData('')
      setNovoHorario('')
      setSelectedProfId('')
      setSelectedServId('')
      setHorariosDisp([])
    }
  }, [appointment?.id])

  // Fetch professionals + services — always when token exists
  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    const base = process.env.NEXT_PUBLIC_API_URL
    Promise.all([
      fetch(`${base}/api/v1/professionals`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${base}/api/v1/services`,      { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([profs, svcs]) => {
        setProfissionais(
          (profs.data ?? []).map((p: Record<string, unknown>) => ({
            id:        String(p.id ?? ''),
            name:      String(p.name ?? ''),
            specialty: p.specialty as string | undefined,
            workDays:  Array.isArray(p.workDays) ? (p.workDays as number[]) : [],
            workStart: String(p.workStart ?? '08:00'),
            workEnd:   String(p.workEnd   ?? '18:00'),
          }))
        )
        setServicos(svcs.data ?? [])
      })
      .catch(() => {})
  }, [])

  // Fetch available time slots when profissional + data change
  useEffect(() => {
    if (!selectedProfId || !novaData) { setHorariosDisp([]); return }
    const token = getAuthToken()
    setLoadingHorarios(true)
    const base = process.env.NEXT_PUBLIC_API_URL
    fetch(
      `${base}/api/v1/appointments?professionalId=${selectedProfId}&from=${novaData}&to=${novaData}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
      .then((r) => r.json())
      .then((r) => {
        const servico  = servicos.find((s) => s.id === selectedServId)
        const durMin   = servico?.durationMin ?? 60
        const profData = profissionais.find((p) => p.id === selectedProfId)

        const [startH = 8,  startM = 0] = (profData?.workStart ?? '08:00').split(':').map(Number)
        const [endH   = 18, endM   = 0] = (profData?.workEnd   ?? '18:00').split(':').map(Number)
        const windowStart = startH * 60 + startM
        const windowEnd   = endH   * 60 + endM

        const dayOfWeek = new Date(novaData + 'T12:00:00').getDay()
        const isFolga = profData?.workDays.length ? !profData.workDays.includes(dayOfWeek) : false

        const ocupados: { startTime: string; durMin: number }[] = (r.data ?? [])
          .filter((a: { startAt?: string; durationMin?: number; status?: string }) => a.status !== 'CANCELLED')
          .map((a: { startAt?: string; durationMin?: number }) => ({
            startTime: a.startAt?.slice(11, 16) ?? '',
            durMin:    a.durationMin ?? 60,
          }))

        const slots: string[] = []
        if (!isFolga) {
          for (let min = windowStart; min + durMin <= windowEnd; min += 30) {
            const h    = Math.floor(min / 60).toString().padStart(2, '0')
            const m    = (min % 60).toString().padStart(2, '0')
            const slot = `${h}:${m}`
            const slotEnd = min + durMin
            const conflito = ocupados.some((o) => {
              if (!o.startTime) return false
              const [oh, om] = o.startTime.split(':').map(Number)
              const oMin = oh * 60 + om
              return min < oMin + o.durMin && slotEnd > oMin
            })
            if (!conflito) slots.push(slot)
          }
        }
        setHorariosDisp(slots)
        if (slots.length > 0 && !slots.includes(novoHorario)) setNovoHorario(slots[0])
        else if (slots.length === 0) setNovoHorario('')
      })
      .catch(() => {})
      .finally(() => setLoadingHorarios(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfId, novaData, selectedServId, servicos, profissionais])

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
  const prof = profissionais.find((p) => p.id === appointment.professionalId)
  const actions = ACTIONS[appointment.status] ?? []

  const profFolga = (() => {
    if (!reagendando || !selectedProfId || !novaData) return false
    const pd = profissionais.find((p) => p.id === selectedProfId)
    if (!pd?.workDays.length) return false
    return !pd.workDays.includes(new Date(novaData + 'T12:00:00').getDay())
  })()
  const servicoSelecionado = servicos.find((s) => s.id === selectedServId)

  async function handleAction(label: string) {
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
    if (label === 'Confirmar') {
      setSaving(true)
      try {
        await agendaApi.update(appointment.id, { status: 'CONFIRMED' })
        onSuccess?.()
        onClose()
      } catch (e) {
        console.error('Confirmar erro:', e)
      } finally {
        setSaving(false)
      }
      return
    }
    if (label === 'Cancelar') setCancelMode(true)
  }

  async function handleReagendar() {
    if (!novaData || !novoHorario || !appointment) return
    setSaving(true)
    try {
      await agendaApi.update(appointment.id, {
        professionalId: selectedProfId || undefined,
        serviceId:      selectedServId || undefined,
        date:           novaData,
        startTime:      novoHorario,
      })
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
      await agendaApi.update(appointment.id, {
        status:       'CANCELLED',
        cancelReason: motivo || undefined,
      } as Parameters<typeof agendaApi.update>[1])
      onSuccess?.()
      onClose()
    } catch {
      setSaving(false)
    }
  }

  async function handlePaymentConfirm(result: PaymentResult) {
    if (!appointment) return
    const METHOD_MAP: Record<string, string> = {
      pix: 'PIX', dinheiro: 'CASH', debito: 'DEBIT_CARD',
      credito: 'CREDIT_CARD', voucher: 'VOUCHER', transferencia: 'BANK_TRANSFER',
    }
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const base = process.env.NEXT_PUBLIC_API_URL
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

      let commandId = appointment.commandId
      if (!commandId) {
        const cmdRes = await fetch(`${base}/api/v1/commands`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ clientId: appointment.clientId, appointmentId: appointment.id }),
        })
        const cmd = await cmdRes.json()
        commandId = cmd.data?.id
      }

      if (!commandId) throw new Error('Comanda não criada')

      const discountAmt = result.discount
        ? result.discount.type === 'percent'
          ? (result.total * result.discount.value) / 100
          : result.discount.value
        : 0

      if (discountAmt > 0) {
        await fetch(`${base}/api/v1/commands/${commandId}/discount`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ amount: discountAmt }),
        })
      }

      for (const m of result.methods ?? []) {
        await fetch(`${base}/api/v1/payments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            commandId,
            method: METHOD_MAP[m.method] ?? m.method.toUpperCase(),
            amount: m.amount,
          }),
        })
      }

      await fetch(`${base}/api/v1/commands/${commandId}/close`, { method: 'POST', headers })

      await fetch(`${base}/api/v1/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      onSuccess?.()
    } catch (e) {
      console.error('Erro ao confirmar pagamento:', e)
    } finally {
      setPaymentLoading(false)
      setPaymentOpen(false)
      onClose()
    }
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
        <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

        {/* Panel */}
        <div className="relative z-10 w-full max-w-sm overflow-y-auto rounded-xl bg-white shadow-xl" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className={cn('rounded-t-xl px-5 py-4', style.bg)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={cn('text-[16px] font-semibold leading-tight', style.text)}>{appointment.client}</p>
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
                <span>{prof.name}{prof.specialty ? <> · <span className="text-[#94A3B8]">{prof.specialty}</span></> : null}</span>
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

              <div>
                <label className="mb-1 block text-[12px] text-[#64748B]">Cliente</label>
                <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#475569]">
                  {appointment.client}
                  <span className="ml-2 text-[11px] text-[#94A3B8]">(bloqueado)</span>
                </div>
              </div>

              {profissionais.length > 0 && (
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

              {servicos.length > 0 && (
                <div>
                  <label className="mb-1 block text-[12px] text-[#64748B]">Serviço</label>
                  <select value={selectedServId} onChange={(e) => setSelectedServId(e.target.value)} className={SELECT_CLS}>
                    <option value="">Selecionar serviço…</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {servicoSelecionado && (
                    <div className="mt-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#64748B]">Duração</span>
                        <span className="font-medium text-[#0F172A]">{servicoSelecionado.durationMin ?? '—'} min</span>
                      </div>
                      {servicoSelecionado.price != null && (
                        <div className="mt-1 flex justify-between text-[12px]">
                          <span className="text-[#64748B]">Valor</span>
                          <span className="font-tabular font-medium text-[#0F172A]">
                            R$ {Number(servicoSelecionado.price).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                {profFolga && (
                  <p className="mt-1 text-[12px] text-[#DC2626]">
                    Este profissional não trabalha neste dia.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[12px] text-[#64748B]">Horário</label>
                <select
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  className={SELECT_CLS}
                  disabled={loadingHorarios || profFolga}
                >
                  <option value="">
                    {loadingHorarios
                      ? 'Carregando…'
                      : profFolga
                        ? 'Dia de folga'
                        : horariosDisponiveis.length === 0
                          ? 'Nenhum horário disponível'
                          : 'Selecionar horário…'}
                  </option>
                  {!loadingHorarios && !profFolga && horariosDisponiveis.map((h) => (
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
        loading={paymentLoading}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
        isCompleted={appointment.status === 'COMPLETED'}
        onReopen={async () => {
          const token = localStorage.getItem('accessToken')
          const base = process.env.NEXT_PUBLIC_API_URL
          await fetch(`${base}/api/v1/appointments/${appointment.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'CONFIRMED' }),
          })
          setPaymentOpen(false)
          onSuccess?.()
        }}
      />
    </>
  )
}
