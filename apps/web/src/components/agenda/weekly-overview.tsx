'use client'

import { useState, useMemo } from 'react'
import { addDays, format, isToday as dfIsToday, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CALENDAR_PROFESSIONALS } from '@/lib/calendar-utils'

// ─── Work schedule (0=Sun … 6=Sat) ──────────────────────────────────────────

const WORK_DAYS: Record<string, ReadonlySet<number>> = {
  lisa: new Set([1, 2, 3, 4, 5]),
  joao: new Set([1, 2, 3, 4, 5, 6]),
  ana:  new Set([2, 3, 4, 5, 6]),
  lena: new Set([1, 2, 3, 4, 5]),
}

const CAPACITY: Record<string, number> = {
  lisa: 10, joao: 12, ana: 10, lena: 8,
}

// ─── Mock availability (deterministic by prof + date) ────────────────────────

type DayState = 'folga' | 'esgotado' | 'disponivel'

interface DayAvailability {
  state: DayState
  booked: number
  total: number
}

function getMockAvailability(profId: string, date: Date): DayAvailability {
  const dow = getDay(date)
  const total = CAPACITY[profId] ?? 10

  if (!WORK_DAYS[profId]?.has(dow)) {
    return { state: 'folga', booked: 0, total }
  }

  // Deterministic: prof initial code × date fields → 0-9
  const seed = ((date.getDate() * 7 + dow) * ((profId.charCodeAt(0) % 5) + 1)) % 10

  if (seed < 3) return { state: 'esgotado', booked: total, total }

  const booked = Math.min(Math.max(1, Math.round(total * (0.2 + seed * 0.08))), total - 1)
  return { state: 'disponivel', booked, total }
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
}

function DayCell({ avail, onClick }: DayCellProps) {
  const { state, booked, total } = avail
  const pct = total > 0 ? Math.round((booked / total) * 100) : 0

  if (state === 'folga') {
    return (
      <td
        className="relative border-b border-r border-[#F1F5F9] px-3 py-3 text-center align-middle"
        style={{
          background:
            'repeating-linear-gradient(-45deg,#F8FAFC,#F8FAFC 4px,#F1F5F9 4px,#F1F5F9 8px)',
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
      <td className="relative border-b border-r border-[#FEE2E2] bg-[#FEF2F2] align-top">
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

  // disponivel
  const free = total - booked
  const color = occupancyColor(pct)

  return (
    <td className="relative border-b border-r border-[#F1F5F9] bg-white align-top transition-colors hover:bg-[#EFF6FF]">
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col items-start px-3 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        aria-label={`${booked} agendados, ${free} livres`}
      >
        <span className="text-[12px] font-medium text-[#0F172A]">{booked} agend.</span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#059669]">
          {free} livres
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
        </span>
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b bg-[#F1F5F9]" aria-hidden="true">
        <div className="h-full rounded-b" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </td>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface WeeklyOverviewProps {
  weekStart: Date
  onDaySelect: (professionalId: string, date: Date) => void
}

export default function WeeklyOverview({ weekStart, onDaySelect }: WeeklyOverviewProps) {
  const [selectedProfs, setSelectedProfs] = useState<Set<string>>(new Set())

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
      ? CALENDAR_PROFESSIONALS
      : CALENDAR_PROFESSIONALS.filter((p) => selectedProfs.has(p.id))

  return (
    <div className="flex h-full flex-col overflow-hidden">
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

        {CALENDAR_PROFESSIONALS.map((prof) => {
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
              style={
                active
                  ? { backgroundColor: prof.color, borderColor: prof.color }
                  : { color: prof.color }
              }
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
          {visibleProfs.length} de {CALENDAR_PROFESSIONALS.length} profissionais
        </span>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto">
        <table
          className="border-separate border-spacing-0"
          style={{ minWidth: '900px', width: '100%' }}
          role="grid"
          aria-label="Visão semanal por profissional"
        >
          <thead className="sticky top-0 z-20">
            <tr>
              {/* Corner */}
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
                    <p
                      className={cn(
                        'text-[11px] uppercase tracking-[0.06em]',
                        isT ? 'font-semibold text-[#2563EB]' : 'text-[#475569]',
                      )}
                    >
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p
                      className={cn(
                        'font-tabular text-[13px]',
                        isT ? 'font-bold text-[#2563EB]' : 'font-medium text-[#0F172A]',
                      )}
                    >
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
                {/* Professional sticky cell */}
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
                  const avail = getMockAvailability(prof.id, day)
                  return (
                    <DayCell
                      key={day.toISOString()}
                      avail={avail}
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
    </div>
  )
}
