'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  TIME_SLOTS,
  SLOT_HEIGHT,
  getSlotIndex,
  getDurationSlots,
  isTodayUtil,
  toDateString,
  type CalendarAppointment,
  type CalendarProfessional,
} from '@/lib/calendar-utils'
import AppointmentBlock from './appointment-block'

interface DayTimelineProps {
  appointments: CalendarAppointment[]
  professionals: CalendarProfessional[]
  date: Date
  onAppointmentClick?: (appt: CalendarAppointment) => void
  onSlotClick?: (professionalId: string, time: string, date: string) => void
}

export default function DayTimeline({
  appointments,
  professionals,
  date,
  onAppointmentClick,
  onSlotClick,
}: DayTimelineProps) {
  const isToday = isTodayUtil(date)
  const dateStr = toDateString(date)
  const theadRef = useRef<HTMLTableSectionElement>(null)
  const [theadH, setTheadH] = useState(56)

  useEffect(() => {
    if (theadRef.current) setTheadH(theadRef.current.getBoundingClientRect().height)
  }, [professionals.length])

  // Now-line top offset relative to tbody start (px)
  const nowTop = useMemo<number | null>(() => {
    if (!isToday) return null
    const now = new Date()
    const relMin = now.getHours() * 60 + now.getMinutes() - 8 * 60
    if (relMin < 0 || relMin > 12 * 60) return null
    return (relMin / 30) * SLOT_HEIGHT
  }, [isToday])

  // Map of slots covered by multi-slot appointments (rowspan skip)
  const coveredSlots = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const prof of professionals) {
      const covered = new Set<string>()
      for (const appt of appointments.filter((a) => a.professionalId === prof.id)) {
        const si = getSlotIndex(appt.startTime)
        if (si < 0) continue
        const spans = getDurationSlots(appt.durationMinutes)
        for (let i = 1; i < spans; i++) {
          const ci = si + i
          if (ci < TIME_SLOTS.length) covered.add(TIME_SLOTS[ci])
        }
      }
      map[prof.id] = covered
    }
    return map
  }, [appointments, professionals])

  const tableMinWidth = 80 + Math.max(professionals.length, 1) * 180
  const hasProfs = professionals.length > 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="relative">
          <table
            className="border-separate border-spacing-0"
            style={{ minWidth: `${tableMinWidth}px`, width: '100%' }}
            role="grid"
            aria-label="Agenda diária por profissional"
          >
            {/* ── Sticky header: professional columns ── */}
            <thead ref={theadRef} className="sticky top-0 z-20">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-30 w-20 border-b border-r border-[#E2E8F0] bg-white"
                  aria-label="Horário"
                />
                {hasProfs ? professionals.map((prof) => (
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
                )) : (
                  <th
                    scope="col"
                    className="border-b border-r border-[#E2E8F0] bg-white px-4 py-3 text-left font-normal"
                  >
                    <span className="text-[12px] text-[#94A3B8]">Nenhum profissional cadastrado</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* ── Time slots × professional columns ── */}
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

                  {hasProfs ? professionals.map((prof) => {
                    // Slot already covered by a previous appointment's rowspan
                    if (coveredSlots[prof.id]?.has(slot)) return null

                    const appt = appointments.find(
                      (a) => a.professionalId === prof.id && a.startTime === slot,
                    )
                    const rowSpan = appt ? getDurationSlots(appt.durationMinutes) : 1
                    const cellH = rowSpan * SLOT_HEIGHT

                    return (
                      <td
                        key={prof.id}
                        rowSpan={rowSpan}
                        onClick={!appt ? () => onSlotClick?.(prof.id, slot, dateStr) : undefined}
                        onKeyDown={
                          !appt
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  onSlotClick?.(prof.id, slot, dateStr)
                                }
                              }
                            : undefined
                        }
                        tabIndex={!appt ? 0 : undefined}
                        className={cn(
                          'border-b border-r border-[#F1F5F9] align-top group',
                          isToday ? 'bg-[#FAFCFF]' : 'bg-white',
                          !appt && 'cursor-pointer hover:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                          appt && 'p-0.5',
                        )}
                        style={{ height: `${cellH}px` }}
                      >
                        {appt ? (
                          <AppointmentBlock
                            appointment={appt}
                            onClick={() => onAppointmentClick?.(appt)}
                            heightPx={cellH - 4}
                          />
                        ) : (
                          <span
                            className="flex h-full items-center justify-center opacity-0 transition-opacity duration-100 group-hover:opacity-100 motion-reduce:transition-none"
                            aria-hidden="true"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold leading-none text-white">
                              +
                            </span>
                          </span>
                        )}
                      </td>
                    )
                  }) : (
                    <td
                      className="border-b border-r border-[#F1F5F9] bg-white"
                      style={{ height: `${SLOT_HEIGHT}px` }}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Now line (today only) ── */}
          {nowTop !== null && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
              style={{ top: `${theadH + nowTop}px` }}
            >
              <div className="flex w-20 shrink-0 justify-end pr-1">
                <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
              </div>
              <div className="h-[2px] flex-1 bg-[#DC2626]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
