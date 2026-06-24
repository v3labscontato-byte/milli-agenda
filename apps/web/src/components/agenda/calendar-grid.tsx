'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  TIME_SLOTS,
  SLOT_HEIGHT,
  CALENDAR_PROFESSIONALS,
  getSlotIndex,
  getDurationSlots,
  isTodayUtil,
  type CalendarAppointment,
} from '@/lib/calendar-utils'
import AppointmentBlock from './appointment-block'

const LEGEND = [
  { label: 'Agendado',        color: '#94A3B8' },
  { label: 'Confirmado',      color: '#2563EB' },
  { label: 'Check-in',        color: '#7C3AED' },
  { label: 'Em Atendimento',  color: '#059669' },
  { label: 'Aguard. Pagto',   color: '#D97706' },
  { label: 'Concluído',       color: '#10B981' },
  { label: 'Cancelado',       color: '#EF4444' },
] as const

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="h-full overflow-auto" aria-hidden="true">
      <div className="flex">
        <div className="sticky left-0 z-10 w-20 shrink-0 border-r border-[#E2E8F0] bg-white">
          {TIME_SLOTS.slice(0, 8).map((s) => (
            <div key={s} className="h-[52px] border-b border-[#F1F5F9]" />
          ))}
        </div>
        {CALENDAR_PROFESSIONALS.map((p) => (
          <div key={p.id} className="min-w-[180px] flex-1 border-r border-[#E2E8F0] p-2 pt-14">
            <div className="h-12 animate-pulse motion-reduce:animate-none rounded-md bg-[#F1F5F9]" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main grid ────────────────────────────────────────────────────────────────

interface CalendarGridProps {
  appointments: CalendarAppointment[]
  selectedDate: Date
  isLoading?: boolean
  onAppointmentClick: (appt: CalendarAppointment) => void
}

export default function CalendarGrid({
  appointments,
  selectedDate,
  isLoading = false,
  onAppointmentClick,
}: CalendarGridProps) {
  if (isLoading) return <GridSkeleton />

  const today = isTodayUtil(selectedDate)
  const tableMinWidth = 80 + CALENDAR_PROFESSIONALS.length * 180

  // Pre-compute which slots are "covered" by a multi-slot appointment's rowspan
  const coveredSlots = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const prof of CALENDAR_PROFESSIONALS) {
      const covered = new Set<string>()
      const profAppts = appointments.filter((a) => a.professionalId === prof.id)
      for (const appt of profAppts) {
        const startIdx = getSlotIndex(appt.startTime)
        if (startIdx < 0) continue
        const spans = getDurationSlots(appt.durationMinutes)
        for (let i = 1; i < spans; i++) {
          const coverIdx = startIdx + i
          if (coverIdx < TIME_SLOTS.length) covered.add(TIME_SLOTS[coverIdx])
        }
      }
      map[prof.id] = covered
    }
    return map
  }, [appointments])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Scroll container — single overflow:auto handles both axes; enables sticky in both directions */}
      <div className="flex-1 overflow-auto">
        <table
          className="border-separate border-spacing-0"
          style={{ minWidth: `${tableMinWidth}px` }}
          role="grid"
          aria-label="Agenda diária por profissional"
        >
          {/* ── Sticky professional header ── */}
          <thead className="sticky top-0 z-20">
            <tr>
              {/* Corner: sticky both left and top */}
              <th
                scope="col"
                className="sticky left-0 z-30 w-20 border-b border-r border-[#E2E8F0] bg-white"
                aria-label="Horário"
              />
              {CALENDAR_PROFESSIONALS.map((prof) => (
                <th
                  key={prof.id}
                  scope="col"
                  className="w-[180px] min-w-[180px] border-b border-r border-[#E2E8F0] bg-white px-3 py-3 text-left font-normal"
                >
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
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Time slots × professional cells ── */}
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                {/* Sticky time label */}
                <td
                  className="sticky left-0 z-10 w-20 border-b border-r border-[#E2E8F0] bg-white align-top"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  <span className="block select-none pr-3 pt-1 text-right font-tabular text-[11px] text-[#94A3B8]">
                    {slot}
                  </span>
                </td>

                {/* Professional columns */}
                {CALENDAR_PROFESSIONALS.map((prof) => {
                  // This slot is already covered by a previous appointment's rowspan — skip
                  if (coveredSlots[prof.id]?.has(slot)) return null

                  const appt = appointments.find(
                    (a) => a.professionalId === prof.id && a.startTime === slot,
                  )
                  const rowSpan = appt ? getDurationSlots(appt.durationMinutes) : 1
                  const cellHeight = rowSpan * SLOT_HEIGHT

                  return (
                    <td
                      key={prof.id}
                      rowSpan={rowSpan}
                      className={cn(
                        'border-b border-r border-[#F1F5F9] align-top',
                        today ? 'bg-[#FAFCFF]' : 'bg-white',
                        !appt && 'hover:bg-[#F8FAFC]',
                        appt && 'p-0.5',
                      )}
                      style={{ height: `${cellHeight}px` }}
                    >
                      {appt && (
                        <AppointmentBlock
                          appointment={appt}
                          onClick={() => onAppointmentClick(appt)}
                          heightPx={cellHeight - 4}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Legend strip ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#E2E8F0] bg-white px-6 py-3">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-[#475569]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
