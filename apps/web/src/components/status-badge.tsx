import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/lib/mock-data'

interface StatusConfig {
  className: string
  label: string
  dotColor: string
}

// Each status has unique bg/text/border — never color alone (WCAG requirement)
const STATUS_MAP: Record<AppointmentStatus, StatusConfig> = {
  SCHEDULED:        { className: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#2563EB]', label: 'Agendado',        dotColor: '#2563EB' },
  CONFIRMED:        { className: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]', label: 'Confirmado',      dotColor: '#10B981' },
  CHECKED_IN:       { className: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]', label: 'Check-in',        dotColor: '#F59E0B' },
  IN_SERVICE:       { className: 'bg-[#F3E8FF] text-[#6B21A8] border-[#8B5CF6]', label: 'Em Atendimento',  dotColor: '#8B5CF6' },
  AWAITING_PAYMENT: { className: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]', label: 'Aguard. Pagto',   dotColor: '#EF4444' },
  COMPLETED:        { className: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]', label: 'Concluído',       dotColor: '#10B981' },
  NO_SHOW:          { className: 'bg-[#F1F5F9] text-[#475569] border-[#94A3B8]', label: 'Não Compareceu',  dotColor: '#94A3B8' },
  CANCELLED:        { className: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]', label: 'Cancelado',       dotColor: '#EF4444' },
}

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        'rounded-sm border px-2 py-0.5',
        // Caption typography: 11px / 500 / uppercase / +0.06em
        'text-[11px] font-medium leading-tight tracking-[0.06em] uppercase',
        config.className,
        className,
      )}
    >
      {/* Colored dot provides redundant visual signal alongside text (WCAG) */}
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}
