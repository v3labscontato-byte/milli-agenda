'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BookingService, type BookingProfessional } from '@/lib/booking-mock'
import { fetchPublicSlots, slotToTimeStr, TENANT_SLUG } from '@/lib/api/public-booking'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalendarDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
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
  const today    = new Date()
  const todayISO = toISO(today)

  const [viewYear, setViewYear]         = useState(today.getFullYear())
  const [viewMonth, setViewMonth]       = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots]               = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

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
    if (iso <= todayISO) return true
    // Use workDays from real API (0=Sun,1=Mon,...,6=Sat) if available
    const workDays = professional.workDays
    if (workDays && workDays.length > 0) return !workDays.includes(d.getDay())
    return d.getDay() === 0 // fallback: only disable Sunday
  }

  function handleDay(d: Date) {
    if (isDisabled(d)) return
    const iso = toISO(d)
    setSelectedDate(iso)
    setSelectedTime(null)
    setSlots([])
    setSlotsLoading(true)
    fetchPublicSlots(TENANT_SLUG, professional.id, iso, service.durationMins)
      .then((data) => setSlots(data.map((s) => slotToTimeStr(s.startAt))))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }

  const canContinue = Boolean(selectedDate && selectedTime)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{professional.name} · {service.name}</span>
      </button>

      <div className="px-4 pb-3">
        <h2 className="text-[18px] font-semibold text-content-primary">Escolha a data</h2>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mês anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-background-secondary active:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-[15px] font-semibold text-content-primary">
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Próximo mês"
          className="flex h-11 w-11 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-background-secondary active:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-semibold text-content-subtle">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 px-3 pb-1" role="grid" aria-label="Calendário">
        {calDays.map((d, idx) => {
          if (!d) return <div key={`pad-${idx}`} role="gridcell" />
          const iso      = toISO(d)
          const disabled = isDisabled(d)
          const selected = iso === selectedDate
          return (
            <div key={iso} role="gridcell">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleDay(d)}
                aria-label={`${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`}
                aria-pressed={selected}
                className={cn(
                  'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  selected
                    ? 'bg-primary font-semibold text-white'
                    : disabled
                      ? 'cursor-not-allowed text-content-disabled'
                      : 'cursor-pointer font-semibold text-content-primary hover:bg-primary-xlight active:bg-primary-light',
                )}
              >
                {d.getDate()}
              </button>
            </div>
          )
        })}
      </div>

      {!selectedDate && (
        <p className="mt-4 px-6 text-center text-[12px] text-content-subtle">
          Toque em uma data para ver os horários disponíveis
        </p>
      )}

      {selectedDate && (
        <div
          key={selectedDate}
          className="mt-5 animate-fade-in border-t border-background-secondary px-4 pt-4 motion-reduce:animate-none"
        >
          <p className="mb-3 text-[13px] font-semibold text-content-secondary">
            Horários — {formatDateHeader(selectedDate)}
          </p>
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-[#F1F5F9]" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-content-subtle">Sem horários disponíveis neste dia.</p>
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
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
                    selectedTime === t
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-content-primary hover:border-primary hover:text-primary',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 px-4 pb-4">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => { if (selectedDate && selectedTime) onSelect(selectedDate, selectedTime) }}
          className={cn(
            'w-full rounded-xl py-3.5 text-[15px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            canContinue
              ? 'bg-primary text-white hover:bg-primary-dark active:bg-primary-800'
              : 'cursor-not-allowed bg-background-secondary text-content-muted',
          )}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
