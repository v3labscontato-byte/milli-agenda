'use client'

import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
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
  'placeholder:text-[#94A3B8]',
)

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
}

export default function NewAppointmentModal({ open, onClose }: NewAppointmentModalProps) {
  const [profId, setProfId] = useState<string>('')
  const [service, setService] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [client, setClient] = useState<string>('')

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => { setService('') }, [profId])

  if (!open) return null

  const services = profId ? (SERVICES_BY_PROF[profId] ?? []) : []
  const selectedProf: CalendarProfessional | undefined = CALENDAR_PROFESSIONALS.find((p) => p.id === profId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Wire to real API — mock only logs
    console.log('new appointment', { profId, service, date, time, client })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo agendamento"
    >
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Plus size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Agendamento</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
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
              onChange={(e) => setProfId(e.target.value)}
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
              className={cn(INPUT, !profId && 'opacity-50 cursor-not-allowed')}
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
              <label htmlFor="date" className={LABEL}>Data</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={INPUT}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="time" className={LABEL}>Horário</label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={INPUT}
              >
                <option value="" disabled>Horário…</option>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <label htmlFor="client" className={LABEL}>Cliente</label>
            <input
              id="client"
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
              placeholder="Nome do cliente…"
              autoComplete="off"
              className={INPUT}
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
              'flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] py-2.5',
              'text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
            )}
          >
            <Plus size={14} aria-hidden="true" />
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  )
}
