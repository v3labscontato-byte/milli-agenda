import { cn } from '@/lib/utils'
import { STATUS_STYLES, type CalendarAppointment } from '@/lib/calendar-utils'

interface AppointmentBlockProps {
  appointment: CalendarAppointment
  onClick: () => void
  heightPx: number
}

export default function AppointmentBlock({ appointment, onClick, heightPx }: AppointmentBlockProps) {
  const style = STATUS_STYLES[appointment.status]
  const compact = heightPx < 56

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${appointment.client} — ${appointment.service} às ${appointment.startTime}`}
      className={cn(
        'w-full h-full text-left rounded-md border-l-[3px] px-2 py-1 overflow-hidden',
        'transition-opacity hover:opacity-80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1',
        style.bg,
        style.border,
        style.text,
      )}
    >
      <p className={cn('truncate font-semibold leading-tight', compact ? 'text-[10px]' : 'text-[11px]')}>
        {appointment.client}
      </p>
      {!compact && (
        <p className="truncate text-[10px] opacity-75 leading-tight mt-0.5">
          {appointment.service}
        </p>
      )}
      {!compact && (
        <p className="text-[10px] opacity-60 leading-tight mt-0.5 font-tabular">
          {appointment.startTime}–{appointment.endTime}
        </p>
      )}
    </button>
  )
}
