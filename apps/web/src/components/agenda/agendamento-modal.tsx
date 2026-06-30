'use client'

import { useEffect } from 'react'
import { X, Clock, User, Scissors, Phone, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agendamento, AgendaStatus } from '@/lib/agenda-mock'
import { formatBRL, formatDateLong, endTime } from '@/lib/agenda-mock'
import { StatusBadge, STATUS_CONFIG } from './agenda-badge'
import { ProfissionalAvatar } from '@/components/profissionais/profissional-card'

// ─── Status action buttons ────────────────────────────────────────────────────

const STATUS_ACTIONS: {
  status: AgendaStatus
  label: string
  icon: React.ElementType
  className: string
  showWhen: AgendaStatus[]
}[] = [
  {
    status: 'completed',
    label: 'Marcar concluído',
    icon: CheckCircle2,
    className: 'border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]',
    showWhen: ['confirmed', 'pending'],
  },
  {
    status: 'confirmed',
    label: 'Confirmar',
    icon: CheckCircle2,
    className: 'border-[#BFDBFE] bg-[#DBEAFE] text-[#2563EB] hover:bg-[#BFDBFE]',
    showWhen: ['pending'],
  },
  {
    status: 'no-show',
    label: 'Não compareceu',
    icon: AlertCircle,
    className: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]',
    showWhen: ['confirmed', 'pending'],
  },
  {
    status: 'cancelled',
    label: 'Cancelar',
    icon: XCircle,
    className: 'border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]',
    showWhen: ['confirmed', 'pending'],
  },
]

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F8FAFC]">
        <Icon size={13} className="text-[#64748B]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#94A3B8]">{label}</p>
        <p className="text-[13px] font-medium text-[#0F172A]">{value}</p>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface AgendamentoModalProps {
  agendamento: Agendamento | null
  onClose: () => void
  onStatusChange?: (id: string, status: AgendaStatus) => void
}

export default function AgendamentoModal({ agendamento, onClose, onStatusChange }: AgendamentoModalProps) {
  useEffect(() => {
    if (!agendamento) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [agendamento, onClose])

  if (!agendamento) return null
  const a = agendamento
  const cfg = STATUS_CONFIG[a.status]

  const visibleActions = STATUS_ACTIONS.filter((act) => act.showWhen.includes(a.status))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Agendamento: ${a.clientName}`}
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Colored header strip */}
        <div
          className="flex items-start justify-between rounded-t-xl px-5 py-4"
          style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">{a.clientName}</h2>
              <StatusBadge status={a.status} />
            </div>
            <p className="mt-0.5 font-tabular text-[13px] font-semibold" style={{ color: cfg.text }}>
              {a.time} – {endTime(a.time, a.serviceDuration)} · {formatDateLong(a.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          {/* Professional */}
          <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
            <ProfissionalAvatar name={a.professionalName} size={32} />
            <div>
              <p className="text-[10px] text-[#94A3B8]">Profissional</p>
              <p className="text-[13px] font-semibold text-[#0F172A]">{a.professionalName}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={Scissors} label="Serviço"   value={a.service} />
            <InfoRow icon={Clock}    label="Duração"   value={`${a.serviceDuration} min`} />
            <InfoRow icon={User}     label="Valor"     value={formatBRL(a.serviceValue)} />
            {a.clientPhone && (
              <InfoRow icon={Phone} label="Telefone" value={a.clientPhone} />
            )}
          </div>

          {/* Notes */}
          {a.notes && (
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F8FAFC]">
                <FileText size={13} className="text-[#64748B]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8]">Observações</p>
                <p className="text-[13px] text-[#475569]">{a.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status actions */}
        {visibleActions.length > 0 && onStatusChange && (
          <div className="flex flex-wrap gap-2 border-t border-[#F1F5F9] px-5 py-4">
            {visibleActions.map((act) => (
              <button
                key={act.status}
                type="button"
                onClick={() => { onStatusChange(a.id, act.status); onClose() }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  act.className,
                )}
              >
                <act.icon size={13} aria-hidden="true" />
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
