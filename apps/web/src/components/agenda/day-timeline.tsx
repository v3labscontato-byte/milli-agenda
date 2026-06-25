'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { STATUS_STYLES, type CalendarAppointment } from '@/lib/calendar-utils'

interface DayTimelineProps {
  appointments: CalendarAppointment[]
  date: Date
  onNewAppointment?: (date: Date, hour: number) => void
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 06 às 22

export function DayTimeline({ appointments, date, onNewAppointment }: DayTimelineProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayAppts = appointments.filter(a => a.date === dateStr)

  function getApptsForHour(hour: number) {
    return dayAppts.filter(a => {
      const h = parseInt(a.startTime.split(':')[0], 10)
      return h === hour
    })
  }

  return (
    <div className="flex flex-col" role="grid" aria-label={`Agenda de ${format(date, "d 'de' MMMM", { locale: ptBR })}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center border-b border-[#E2E8F0] bg-white px-4 py-3">
        <p className="text-[14px] font-semibold text-[#0F172A]">
          {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        {dayAppts.length > 0 && (
          <span className="ml-2 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
            {dayAppts.length} agendamento{dayAppts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1">
        {HOURS.map(hour => {
          const appts = getApptsForHour(hour)
          return (
            <div
              key={hour}
              className="flex min-h-[64px] border-b border-[#F1F5F9] transition-colors duration-150 hover:bg-[#FAFAFA]"
            >
              {/* Hour label */}
              <div className="w-16 shrink-0 py-3 pr-3 text-right text-[12px] font-medium text-[#94A3B8]">
                {String(hour).padStart(2, '0')}:00
              </div>

              {/* Slot area */}
              <div className="relative flex-1 py-1 pl-2 pr-4">
                {appts.length === 0 ? (
                  <button
                    onClick={() => onNewAppointment?.(date, hour)}
                    className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]"
                    aria-label={`Agendar às ${String(hour).padStart(2, '0')}:00`}
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    {appts.map(appt => {
                      const colors = STATUS_STYLES[appt.status]
                      return (
                        <div
                          key={appt.id}
                          className={`rounded-md border px-2 py-1.5 text-[12px] ${colors.bg} ${colors.border} border`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: colors.text }}>
                              {appt.startTime}
                            </span>
                            <span className="font-semibold text-[#0F172A]">{appt.client}</span>
                          </div>
                          <p className="mt-0.5 text-[#475569]">{appt.service}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {dayAppts.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center py-8 text-center">
          <p className="text-[13px] text-[#94A3B8]">Clique em um horário para agendar</p>
        </div>
      )}
    </div>
  )
}
