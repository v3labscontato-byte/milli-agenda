'use client'

import type { AgendaStatus } from '@/lib/agenda-mock'

export const STATUS_CONFIG: Record<AgendaStatus, {
  bg: string; text: string; border: string; dot: string; label: string
}> = {
  confirmed:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', dot: '#2563EB', label: 'Confirmado'  },
  pending:    { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', dot: '#D97706', label: 'Pendente'    },
  completed:  { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', dot: '#16A34A', label: 'Concluído'   },
  cancelled:  { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0', dot: '#94A3B8', label: 'Cancelado'   },
  'no-show':  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#EF4444', label: 'Não veio'    },
}

export function StatusBadge({ status }: { status: AgendaStatus }) {
  const s = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function StatusDot({ status }: { status: AgendaStatus }) {
  const s = STATUS_CONFIG[status]
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ backgroundColor: s.dot }}
      aria-label={s.label}
    />
  )
}
