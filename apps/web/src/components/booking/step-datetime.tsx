'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AVAILABLE_SLOTS, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

const SLOT_ANIM = `
  @keyframes bkSlotIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bk-slots { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalendarDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Array<Date | null> = []
  const startPad = (firstDay.getDay() + 6) % 7 // Monday-first
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

function formatDateHeader(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

interface StepDatetimeProps {
  service: BookingService
  professional: BookingProfessional
  onSelect: (date: string, time: string) => void
  onBack: () => void
}

export default function StepDatetime({ service, professional, onSelect, onBack }: StepDatetimeProps) {
  const today = new Date()
  const todayISO = toISO(today)

  const [viewYear, setViewYear]         = useState(today.getFullYear())
  const [viewMonth, setViewMonth]       = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const calDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  function isDisabled(d: Date): boolean {
    const iso = toISO(d)
    return iso <= todayISO || d.getDay() === 0 || !AVAILABLE_SLOTS[iso]
  }

  function handleDay(d: Date) {
    if (isDisabled(d)) return
    const iso = toISO(d)
    setSelectedDate(iso)
    setSelectedTime(null)
  }

  const slots = selectedDate ? (AVAILABLE_SLOTS[selectedDate] ?? []) : []
  const canContinue = Boolean(selectedDate && selectedTime)

  return (
    <div className="flex flex-col">
      <style>{SLOT_ANIM}</style>

      {/* Back header */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 text-[14px] text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE] rounded-lg"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{professional.name} · {service.name}</span>
      </button>

      <div className="px-4 pb-3">
        <h2 className="text-[18px] font-semibold text-[#0F172A]">Escolha a data</h2>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mês anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#F1F5F9] active:bg-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-[15px] font-semibold text-[#0F172A]">
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Próximo mês"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#F1F5F9] active:bg-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-semibold text-[#64748B]">{d}</div>
        ))}
      </div>

      {/* Calendar grid — each gridcell spans full column (~51px on 360px), giving adequate touch area */}
      <div className="grid grid-cols-7 gap-y-1 px-3 pb-1" role="grid" aria-label="Calendário">
        {calDays.map((d, idx) => {
          if (!d) return <div key={`pad-${idx}`} role="gridcell" />
          const iso = toISO(d)
          const disabled = isDisabled(d)
          const selected = iso === selectedDate
          const hasSlots = Boolean(AVAILABLE_SLOTS[iso])
          return (
            <div key={iso} role="gridcell">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleDay(d)}
                aria-label={`${d.getDate()} de ${MONTHS_PT[d.getMonth()]}${hasSlots && !disabled ? ', disponível' : ''}`}
                aria-pressed={selected}
                className={cn(
                  'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
                  selected
                    ? 'bg-[#2563EB] font-semibold text-white'
                    : disabled
                      ? 'cursor-not-allowed text-[#CBD5E1]'
                      : hasSlots
                        ? 'cursor-pointer font-semibold text-[#0F172A] hover:bg-[#EFF6FF] active:bg-[#DBEAFE]'
                        : 'cursor-not-allowed text-[#CBD5E1]',
                )}
              >
                {d.getDate()}
                {/* Availability dot — hidden when selected (bg would obscure) */}
                {hasSlots && !disabled && !selected && (
                  <span
                    className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2563EB]"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Time slots — key forces remount → entrance animation on each date change */}
      {selectedDate && (
        <div
          key={selectedDate}
          className="bk-slots mt-5 border-t border-[#F1F5F9] px-4 pt-4"
          style={{ animation: 'bkSlotIn 200ms cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <p className="mb-3 text-[13px] font-semibold text-[#475569]">
            Horários — {formatDateHeader(selectedDate)}
          </p>
          {slots.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-[#64748B]">Sem horários disponíveis neste dia.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  aria-pressed={selectedTime === t}
                  className={cn(
                    'h-11 rounded-xl border text-[14px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    selectedTime === t
                      ? 'border-[#2563EB] bg-[#2563EB] text-white'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue */}
      <div className="mt-6 px-4 pb-4">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => { if (selectedDate && selectedTime) onSelect(selectedDate, selectedTime) }}
          className={cn(
            'w-full rounded-xl py-3.5 text-[15px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]',
            canContinue
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]'
              : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
          )}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
