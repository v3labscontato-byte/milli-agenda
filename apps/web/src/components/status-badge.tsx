import {
  Clock,
  CheckCircle2,
  LogIn,
  Scissors,
  CreditCard,
  CheckCheck,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/lib/mock-data'

interface StatusConfig {
  className: string
  label: string
  // Lucide icon glyph per state — DESIGN.md: color + icon + label, never color alone
  icon: LucideIcon
}

const STATUS_MAP: Record<AppointmentStatus, StatusConfig> = {
  SCHEDULED:        { className: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#2563EB]', label: 'Agendado',       icon: Clock },
  CONFIRMED:        { className: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]', label: 'Confirmado',     icon: CheckCircle2 },
  CHECKED_IN:       { className: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]', label: 'Check-in',       icon: LogIn },
  IN_SERVICE:       { className: 'bg-[#F3E8FF] text-[#6B21A8] border-[#8B5CF6]', label: 'Em Atendimento', icon: Scissors },
  AWAITING_PAYMENT: { className: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]', label: 'Aguard. Pagto',  icon: CreditCard },
  COMPLETED:        { className: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]', label: 'Concluído',      icon: CheckCheck },
  NO_SHOW:          { className: 'bg-[#F1F5F9] text-[#475569] border-[#94A3B8]', label: 'Não Compareceu', icon: UserX },
  CANCELLED:        { className: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]', label: 'Cancelado',      icon: XCircle },
}

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        'rounded-sm border px-2 py-0.5',
        'text-[11px] font-medium leading-tight tracking-[0.06em] uppercase',
        config.className,
        className,
      )}
    >
      <Icon size={10} aria-hidden="true" className="shrink-0" />
      {config.label}
    </span>
  )
}
