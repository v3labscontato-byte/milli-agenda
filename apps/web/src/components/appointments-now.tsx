import { Clock, CreditCard, Eye } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import type { Appointment } from '@/lib/mock-data'

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]" aria-hidden="true">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-4 w-32 animate-pulse rounded bg-[#F1F5F9]" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-[#F1F5F9]" />
        </div>
        <div className="h-5 w-24 animate-pulse rounded bg-[#F1F5F9]" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-36 animate-pulse rounded bg-[#F1F5F9]" />
          <div className="h-3 w-20 animate-pulse rounded bg-[#F1F5F9]" />
        </div>
        <div className="h-4 w-14 animate-pulse rounded bg-[#F1F5F9]" />
      </div>
      <div className="mt-3 h-8 w-full animate-pulse rounded bg-[#F1F5F9]" />
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-[#E2E8F0] bg-white py-10 text-center"
      role="status"
      aria-label="Nenhum atendimento em andamento"
    >
      <Clock size={20} className="mb-2 text-[#94A3B8]" aria-hidden="true" />
      <p className="text-[14px] font-medium text-[#64748B]">Nenhum atendimento em andamento</p>
      <p className="mt-0.5 text-[12px] text-[#94A3B8]">Clientes em serviço aparecerão aqui</p>
    </div>
  )
}

interface AppointmentCardProps {
  appt: Appointment
}

function AppointmentCard({ appt }: AppointmentCardProps) {
  const isAwaiting = appt.status === 'AWAITING_PAYMENT'

  return (
    <article
      className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]"
      aria-label={`${appt.client} — ${appt.service}`}
    >
      {/* Header: name + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-tight text-[#0F172A]">{appt.client}</p>
          <p className="mt-0.5 text-[13px] text-[#64748B]">{appt.service}</p>
        </div>
        <StatusBadge status={appt.status} className="shrink-0" />
      </div>

      {/* Meta: professional, time range, elapsed */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] text-[#64748B]">
            {appt.professional.split(' ')[0]} · {appt.time}–{appt.endTime}
          </p>
          {appt.startedAt && (
            /* Elapsed time helps receptionist know how far into the service the client is */
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#94A3B8]">
              <Clock size={10} aria-hidden="true" />
              <span>Em andamento desde {appt.startedAt}</span>
            </p>
          )}
        </div>
        <p className="font-tabular text-[14px] font-semibold text-[#0F172A]">
          R$ {appt.amount}
        </p>
      </div>

      {/* Contextual action — only AWAITING_PAYMENT gets primary CTA */}
      {isAwaiting ? (
        <button
          type="button"
          className={[
            'flex w-full items-center justify-center gap-2 rounded-sm',
            'bg-[#2563EB] py-2 text-[13px] font-medium text-white',
            'transition-colors hover:bg-[#1D4ED8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          ].join(' ')}
          aria-label={`Cobrar agendamento de ${appt.client}`}
        >
          <CreditCard size={14} aria-hidden="true" />
          Cobrar Agora — R$ {appt.amount}
        </button>
      ) : (
        <button
          type="button"
          className={[
            'flex w-full items-center justify-center gap-2 rounded-sm',
            'border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#64748B]',
            'transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          ].join(' ')}
          aria-label={`Ver detalhes de ${appt.client}`}
        >
          <Eye size={14} aria-hidden="true" />
          Ver Detalhes
        </button>
      )}
    </article>
  )
}

interface AppointmentsNowProps {
  appointments: Appointment[]
  isLoading?: boolean
}

export default function AppointmentsNow({ appointments, isLoading = false }: AppointmentsNowProps) {
  return (
    <section aria-labelledby="now-heading">
      <div className="mb-3 flex items-center gap-2">
        <h2
          id="now-heading"
          className="text-[16px] font-medium leading-[1.4] text-[#0F172A]"
        >
          Em Atendimento Agora
        </h2>
        {appointments.length > 0 && (
          /* Count badge — Signal Blue communicates "live" status */
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-semibold text-white"
            aria-label={`${appointments.length} em atendimento`}
          >
            {appointments.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState />
      ) : (
        /* Cards are appropriate here: each is a distinct, actionable entity */
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
          {appointments.map((appt) => (
            <li key={appt.id}>
              <AppointmentCard appt={appt} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
