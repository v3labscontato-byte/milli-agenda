'use client'

import { useState, useMemo, type MouseEvent } from 'react'
import { addDays, format, parseISO, isToday as dfIsToday, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { type CalendarAppointment, type CalendarProfessional } from '@/lib/calendar-utils'

const TOOLTIP_HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

// ─── Availability ────────────────────────────────────────────────────────────

type DayState = 'folga' | 'esgotado' | 'disponivel'

interface DayAvailability {
  state: DayState
  booked: number
  total: number
}

function getRealAvailability(profId: string, date: Date, appointments: CalendarAppointment[]): DayAvailability {
  const dateStr = format(date, 'yyyy-MM-dd')
  const booked = appointments.filter((a) => a.professionalId === profId && a.date === dateStr).length
  const total = Math.max(booked, 10)
  return { state: booked >= total ? 'esgotado' : 'disponivel', booked, total }
}

function occupancyColor(pct: number): string {
  if (pct >= 80) return '#F97316'
  if (pct >= 50) return '#D97706'
  return '#10B981'
}

// ─── Day cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  avail: DayAvailability
  onClick?: () => void
  isPast?: boolean
  onMouseEnter?: (e: MouseEvent<HTMLTableCellElement>) => void
  onMouseLeave?: (e: MouseEvent<HTMLTableCellElement>) => void
}

function DayCell({ avail, onClick, isPast, onMouseEnter, onMouseLeave }: DayCellProps) {
  const { state, booked, total } = avail
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0

  if (state === 'folga') {
    return (
      <td
        className="relative border-b border-r border-[#F1F5F9] px-3 py-3 text-center align-middle"
        style={{
          background: 'repeating-linear-gradient(-45deg,#F8FAFC,#F8FAFC 4px,#F1F5F9 4px,#F1F5F9 8px)',
          cursor: 'not-allowed',
        }}
        aria-label="Folga"
      >
        <span className="select-none text-[11px] text-[#94A3B8]">Folga</span>
      </td>
    )
  }

  if (state === 'esgotado') {
    return (
      <td
        className="relative border-b border-r border-[#FEE2E2] bg-[#FEF2F2] align-top"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex h-full w-full flex-col items-start px-3 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          aria-label={`Esgotado — ${booked} agendamentos`}
        >
          <span className="text-[12px] font-semibold text-[#991B1B]">Esgotado</span>
          <span className="mt-0.5 text-[11px] text-[#475569]">{booked} agendamentos</span>
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b bg-[#EF4444]" aria-hidden="true" />
      </td>
    )
  }

  const free = total - booked
  const color = occupancyColor(pct)

  if (isPast) {
    return (
      <td
        className="relative border-b border-r border-[#F1F5F9] bg-[#F8FAFC] align-top transition-colors hover:bg-[#F1F5F9]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex h-full w-full flex-col items-start px-3 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          aria-label={`${booked} agendamentos`}
        >
          <span className="text-[12px] text-[#94A3B8]">{booked} agend.</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#94A3B8]">
            {free} livres
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" aria-hidden="true" />
          </span>
        </button>
      </td>
    )
  }

  return (
    <td
      className="relative border-b border-r border-[#F1F5F9] bg-white align-top transition-colors hover:bg-[#EFF6FF]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col items-start px-3 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        aria-label={`${booked} agendados, ${free} livres`}
      >
        <span className="text-[12px] font-medium text-[#0F172A]">{booked} agend.</span>
        <span
          className="mt-0.5 flex items-center gap-1 text-[11px] font-medium"
          style={{ color: free <= 2 ? '#D97706' : '#059669' }}
        >
          {free} livres
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: free <= 2 ? '#D97706' : '#10B981' }}
            aria-hidden="true"
          />
        </span>
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b bg-[#F1F5F9]" aria-hidden="true">
        <div className="h-full rounded-b" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </td>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipState {
  profName: string
  date: string
  appts: CalendarAppointment[]
  x: number
  y: number
}

function formatTooltipDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

function DayTooltip({ tooltip, onMouseLeave }: { tooltip: TooltipState; onMouseLeave: () => void }) {
  return (
    <div
      className="fixed z-50 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      style={{ left: tooltip.x, top: tooltip.y, width: 300 }}
      onMouseLeave={onMouseLeave}
    >
      <p className="mb-2 text-[12px] font-semibold text-[#0F172A]">
        {tooltip.profName} · {format(parseISO(tooltip.date), "d 'de' MMM", { locale: ptBR })}
      </p>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className="w-12 pb-1.5 text-left font-medium text-[#94A3B8]">Hora</th>
            <th className="pb-1.5 text-left font-medium text-[#94A3B8]">Cliente</th>
            <th className="pb-1.5 text-left font-medium text-[#94A3B8]">Serviço</th>
          </tr>
        </thead>
        <tbody>
          {TOOLTIP_HOURS.map((hour) => {
            const appt = tooltip.appts.filter((a) => a.status !== 'CANCELLED').find((a) => a.startTime.startsWith(hour.slice(0, 2)))
            return (
              <tr key={hour} className="border-b border-[#F8FAFC] last:border-0">
                <td className="py-1 font-tabular text-[#94A3B8]">{hour}</td>
                <td className="py-1">
                  {appt ? (
                    <span className="font-medium text-[#0F172A]">{appt.client}</span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-[#15803D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden="true" />
                      Livre
                    </span>
                  )}
                </td>
                <td className="py-1 text-[#475569]">{appt?.service ?? ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface WeeklyOverviewProps {
  weekStart: Date
  onDaySelect: (professionalId: string, date: Date) => void
  professionals: CalendarProfessional[]
  appointments: CalendarAppointment[]
}

export default function WeeklyOverview({ weekStart, onDaySelect, professionals, appointments }: WeeklyOverviewProps) {
  const [selectedProfs, setSelectedProfs] = useState<Set<string>>(new Set())
  const [tooltip, setTooltip]             = useState<TooltipState | null>(null)

  const allProfs = professionals

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  function toggleProf(profId: string) {
    setSelectedProfs((prev) => {
      const next = new Set(prev)
      if (next.has(profId)) next.delete(profId)
      else next.add(profId)
      return next
    })
  }

  function isWeekend(date: Date): boolean {
    const d = getDay(date)
    return d === 0 || d === 6
  }

  const visibleProfs =
    selectedProfs.size === 0
      ? allProfs
      : allProfs.filter((p) => selectedProfs.has(p.id))

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[14px] font-medium text-[#0F172A]">Nenhum profissional cadastrado.</p>
        <p className="mt-1 text-[13px] text-[#475569]">Adicione profissionais para ver a agenda semanal.</p>
      </div>
    )
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return (
    <div className="flex flex-col">
      {/* ── Filter pills ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] bg-white px-6 py-3">
        <button
          type="button"
          onClick={() => setSelectedProfs(new Set())}
          aria-pressed={selectedProfs.size === 0}
          className={cn(
            'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            selectedProfs.size === 0
              ? 'border-[#2563EB] bg-[#2563EB] text-white'
              : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
          )}
        >
          Todos
        </button>

        {allProfs.map((prof) => {
          const active = selectedProfs.has(prof.id)
          return (
            <button
              key={prof.id}
              type="button"
              onClick={() => toggleProf(prof.id)}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                active ? 'border-transparent text-white' : 'border-[#E2E8F0] hover:border-current',
              )}
              style={active ? { backgroundColor: prof.color, borderColor: prof.color } : { color: prof.color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : prof.color }}
                aria-hidden="true"
              />
              {prof.name.split(' ')[0]}
            </button>
          )
        })}

        <span className="ml-auto text-[11px] text-[#475569]">
          {visibleProfs.length} de {allProfs.length} profissionais
        </span>
      </div>

      {/* ── Grid ── */}
      <div className="overflow-x-auto">
        <table
          className="border-separate border-spacing-0"
          style={{ minWidth: '900px', width: '100%' }}
          role="grid"
          aria-label="Visão semanal por profissional"
        >
          <thead className="sticky top-0 z-20">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-30 w-[180px] border-b border-r border-[#E2E8F0] bg-white px-4 py-3 text-left font-normal"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569]">
                  Profissional
                </span>
              </th>

              {weekDays.map((day) => {
                const isT = dfIsToday(day)
                const wknd = isWeekend(day)
                return (
                  <th
                    key={day.toISOString()}
                    scope="col"
                    className={cn(
                      'border-b border-r border-[#E2E8F0] px-3 py-3 text-center font-normal',
                      isT ? 'bg-[#EFF6FF]' : wknd ? 'bg-[#F8FAFC]' : 'bg-white',
                    )}
                  >
                    <p className={cn('text-[11px] uppercase tracking-[0.06em]', isT ? 'font-semibold text-[#2563EB]' : 'text-[#475569]')}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p className={cn('font-tabular text-[13px]', isT ? 'font-bold text-[#2563EB]' : 'font-medium text-[#0F172A]')}>
                      {format(day, 'dd/MM')}
                    </p>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {visibleProfs.map((prof) => (
              <tr key={prof.id}>
                <td className="sticky left-0 z-10 w-[180px] border-b border-r border-[#E2E8F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ backgroundColor: prof.color }}
                      aria-hidden="true"
                    >
                      {prof.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#0F172A]">{prof.name}</p>
                      <p className="truncate text-[11px] text-[#475569]">{prof.role}</p>
                    </div>
                  </div>
                </td>

                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const avail = getRealAvailability(prof.id, day, appointments)
                  const dayAppts = appointments.filter(
                    (a) => a.professionalId === prof.id && a.date === dateStr,
                  )

                  const handleMouseEnter = avail.state !== 'folga'
                    ? (e: MouseEvent<HTMLTableCellElement>) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const TOOLTIP_W = 300
                        const TOOLTIP_H = 340
                        let x = rect.left
                        let y = rect.bottom + 8
                        if (x + TOOLTIP_W > window.innerWidth - 16) x = Math.max(16, rect.right - TOOLTIP_W)
                        if (y + TOOLTIP_H > window.innerHeight - 16) y = rect.top - TOOLTIP_H - 8
                        if (y < 16) y = 16
                        setTooltip({ profName: prof.name, date: dateStr, appts: dayAppts, x, y })
                      }
                    : undefined

                  return (
                    <DayCell
                      key={day.toISOString()}
                      avail={avail}
                      isPast={day < todayStart}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={avail.state !== 'folga' ? () => setTooltip(null) : undefined}
                      onClick={
                        avail.state !== 'folga'
                          ? () => onDaySelect(prof.id, day)
                          : undefined
                      }
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Tooltip ── */}
      {tooltip && (
        <DayTooltip tooltip={tooltip} onMouseLeave={() => setTooltip(null)} />
      )}
    </div>
  )
}
