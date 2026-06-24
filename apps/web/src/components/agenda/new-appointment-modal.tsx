'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CALENDAR_PROFESSIONALS, type CalendarProfessional } from '@/lib/calendar-utils'

const SERVICES_BY_PROF: Record<string, string[]> = {
  lisa:  ['Corte', 'Escova', 'Coloração', 'Hidratação', 'Alisamento'],
  joao:  ['Corte', 'Barba', 'Corte + Barba', 'Nevou', 'Pigmentação'],
  ana:   ['Manicure', 'Pedicure', 'Manicure + Pedicure', 'Gel', 'Fibra'],
  lena:  ['Coloração', 'Hidratação', 'Escova', 'Mechas', 'Ombré'],
}

const TIME_OPTIONS: string[] = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB]',
  'placeholder:text-[#64748B]',
)
const INPUT_HIGHLIGHT = cn(
  'w-full rounded-md border-2 border-[#2563EB] bg-[#EFF6FF] px-3 py-2 text-[13px] text-[#0F172A]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
  initialProfessionalId?: string
  initialDate?: string
  initialTime?: string
  initialService?: string
  isReschedule?: boolean
  rescheduleClientName?: string
}

export default function NewAppointmentModal({
  open,
  onClose,
  initialProfessionalId,
  initialDate,
  initialTime,
  initialService,
  isReschedule = false,
  rescheduleClientName,
}: NewAppointmentModalProps) {
  const [profId, setProfId]   = useState<string>('')
  const [service, setService] = useState<string>('')
  const [date, setDate]       = useState<string>('')
  const [time, setTime]       = useState<string>('')
  const [client, setClient]   = useState<string>('')

  useEffect(() => {
    if (!open) return
    setProfId(initialProfessionalId ?? '')
    setService(initialService ?? '')
    setDate(initialDate ?? '')
    setTime(initialTime ?? '')
    setClient(rescheduleClientName ?? '')
  }, [open, initialProfessionalId, initialService, initialDate, initialTime, rescheduleClientName])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const services = profId ? (SERVICES_BY_PROF[profId] ?? []) : []
  const selectedProf: CalendarProfessional | undefined = CALENDAR_PROFESSIONALS.find((p) => p.id === profId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(isReschedule ? 'reschedule' : 'new appointment', { profId, service, date, time, client })
    onClose()
  }

  const title       = isReschedule ? `Reagendar — ${rescheduleClientName}` : 'Novo Agendamento'
  const submitLabel = isReschedule ? 'Confirmar Reagendamento' : 'Confirmar Agendamento'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', isReschedule ? 'bg-[#FFFBEB]' : 'bg-[#EFF6FF]')}>
              {isReschedule
                ? <Calendar size={14} className="text-[#D97706]" aria-hidden="true" />
                : <Plus size={14} className="text-[#2563EB]" aria-hidden="true" />
              }
            </div>
            <h2 className="truncate text-[15px] font-semibold text-[#0F172A]">{title}</h2>
            {isReschedule && (
              <span className="shrink-0 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
                Reagendamento
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">

          {/* Profissional */}
          <div className="space-y-1.5">
            <label htmlFor="prof" className={LABEL}>Profissional</label>
            <select
              id="prof"
              value={profId}
              onChange={(e) => { setProfId(e.target.value); setService('') }}
              required
              className={INPUT}
            >
              <option value="" disabled>Selecionar profissional…</option>
              {CALENDAR_PROFESSIONALS.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div className="space-y-1.5">
            <label htmlFor="service" className={LABEL}>Serviço</label>
            <select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              disabled={!profId}
              className={cn(INPUT, !profId && 'cursor-not-allowed opacity-50')}
            >
              <option value="" disabled>
                {profId ? 'Selecionar serviço…' : 'Selecione o profissional primeiro'}
              </option>
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Data + Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="date" className={cn(LABEL, isReschedule && 'font-semibold text-[#2563EB]')}>
                Data
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={isReschedule ? INPUT_HIGHLIGHT : INPUT}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="time" className={cn(LABEL, isReschedule && 'font-semibold text-[#2563EB]')}>
                Horário
              </label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={isReschedule ? INPUT_HIGHLIGHT : INPUT}
              >
                <option value="" disabled>Horário…</option>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <label htmlFor="client" className={LABEL}>
              Cliente
              {isReschedule && <span className="ml-1.5 text-[11px] text-[#94A3B8]">(bloqueado)</span>}
            </label>
            <input
              id="client"
              type="text"
              value={client}
              onChange={(e) => { if (!isReschedule) setClient(e.target.value) }}
              required
              placeholder="Nome do cliente…"
              autoComplete="off"
              readOnly={isReschedule}
              className={cn(INPUT, isReschedule && 'cursor-not-allowed bg-[#F8FAFC] text-[#94A3B8]')}
            />
          </div>

          {/* Professional preview */}
          {selectedProf && (
            <div className="flex items-center gap-2.5 rounded-lg bg-[#F8FAFC] px-3 py-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: selectedProf.color }}
                aria-hidden="true"
              >
                {selectedProf.initials}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#0F172A]">{selectedProf.name}</p>
                <p className="text-[11px] text-[#475569]">{selectedProf.role}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-md py-2.5',
              'text-[14px] font-medium text-white transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              isReschedule
                ? 'bg-[#D97706] hover:bg-[#B45309]'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]',
            )}
          >
            {isReschedule
              ? <Calendar size={14} aria-hidden="true" />
              : <Plus size={14} aria-hidden="true" />
            }
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
