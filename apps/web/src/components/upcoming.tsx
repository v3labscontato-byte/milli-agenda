import { Clock } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import type { Appointment } from '@/lib/mock-data'

function UpcomingSkeleton() {
  return (
    <div className="space-y-px overflow-hidden rounded-lg border border-[#E2E8F0]" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 bg-white px-4 py-3">
          <div className="h-9 w-10 animate-pulse rounded bg-[#F1F5F9]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-[#F1F5F9]" />
            <div className="h-3 w-24 animate-pulse rounded bg-[#F1F5F9]" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded bg-[#F1F5F9]" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-[#E2E8F0] bg-white py-10 text-center"
      role="status"
      aria-label="Sem próximos horários"
    >
      <Clock size={20} className="mb-2 text-[#94A3B8]" aria-hidden="true" />
      <p className="text-[14px] font-medium text-[#64748B]">Sem horários nos próximos slots</p>
      <p className="mt-0.5 text-[12px] text-[#94A3B8]">Agendamentos confirmados aparecerão aqui</p>
    </div>
  )
}

interface UpcomingProps {
  appointments: Appointment[]
  isLoading?: boolean
}

export default function Upcoming({ appointments, isLoading = false }: UpcomingProps) {
  return (
    <section aria-labelledby="upcoming-heading">
      <h2
        id="upcoming-heading"
        className="mb-3 text-[16px] font-medium leading-[1.4] text-[#0F172A]"
      >
        Próximos Horários
      </h2>

      {isLoading ? (
        <UpcomingSkeleton />
      ) : appointments.length === 0 ? (
        <EmptyState />
      ) : (
        /* space-y-px creates 1px gaps filled by parent bg, acting as row dividers */
        <ul
          className="space-y-px overflow-hidden rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]"
          role="list"
          aria-label="Lista de próximos agendamentos"
        >
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
            >
              {/* Time block — fixed width for vertical alignment */}
              <div className="w-10 shrink-0">
                <p className="font-tabular text-[13px] font-semibold leading-tight text-[#0F172A]">
                  {appt.time}
                </p>
                <p className="text-[11px] leading-tight text-[#94A3B8]">{appt.duration}min</p>
              </div>

              {/* Client + service */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#0F172A]">{appt.client}</p>
                <p className="truncate text-[12px] text-[#64748B]">
                  {appt.service} · {appt.professional.split(' ')[0]}
                </p>
              </div>

              <StatusBadge status={appt.status} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
