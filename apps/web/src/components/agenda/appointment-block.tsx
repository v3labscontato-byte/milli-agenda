import type { CalendarAppointment } from '@/lib/calendar-utils'

const CARD_STYLES: Record<string, { bg: string; border: string; accent: string; text: string; subtext: string }> = {
  SCHEDULED:        { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', text: '#1D4ED8', subtext: '#3B82F6' },
  CONFIRMED:        { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', text: '#15803D', subtext: '#16A34A' },
  COMPLETED:        { bg: '#F5F3FF', border: '#DDD6FE', accent: '#7C3AED', text: '#7C3AED', subtext: '#8B5CF6' },
  CANCELLED:        { bg: '#FEF2F2', border: '#FECACA', accent: '#DC2626', text: '#DC2626', subtext: '#EF4444' },
  IN_SERVICE:       { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', text: '#C2410C', subtext: '#F97316' },
  AWAITING_PAYMENT: { bg: '#FFFBEB', border: '#FDE68A', accent: '#D97706', text: '#92400E', subtext: '#D97706' },
  CHECKED_IN:       { bg: '#F3E8FF', border: '#C4B5FD', accent: '#7C3AED', text: '#6B21A8', subtext: '#8B5CF6' },
  NO_SHOW:          { bg: '#F1F5F9', border: '#CBD5E1', accent: '#94A3B8', text: '#475569', subtext: '#64748B' },
}

const DEFAULT_STYLE = { bg: '#F8FAFC', border: '#E2E8F0', accent: '#94A3B8', text: '#475569', subtext: '#94A3B8' }

function getPaymentLabel(appt: CalendarAppointment): string | null {
  if (appt.status === 'CANCELLED') return null
  if (appt.status === 'COMPLETED') return 'Pago'
  return 'Pgto pendente'
}

function PaymentDot({ appt }: { appt: CalendarAppointment }) {
  if (appt.status === 'CANCELLED') return null
  const paid = appt.status === 'COMPLETED' && !!appt.commandId
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 9, color: paid ? '#15803D' : '#92400E', lineHeight: 1 }}>$</span>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: paid ? '#22C55E' : '#F59E0B', display: 'inline-block' }} />
    </div>
  )
}

interface AppointmentBlockProps {
  appointment: CalendarAppointment
  onClick: () => void
  heightPx: number
}

export default function AppointmentBlock({ appointment, onClick, heightPx }: AppointmentBlockProps) {
  const style = CARD_STYLES[appointment.status] ?? DEFAULT_STYLE
  const compact = heightPx < 56
  const cancelled = appointment.status === 'CANCELLED'
  const paymentLabel = !compact ? getPaymentLabel(appointment) : null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${appointment.client} — ${appointment.service} às ${appointment.startTime}`}
      style={{
        background: style.bg,
        border: `0.5px solid ${style.border}`,
        borderLeft: `3px solid ${style.accent}`,
        borderRadius: 4,
        padding: compact ? '2px 4px' : '4px 6px',
        width: '100%',
        height: '100%',
        textAlign: 'left',
        overflow: 'hidden',
        opacity: cancelled ? 0.75 : 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #DBEAFE' }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {!compact && (
            <p style={{ fontSize: 11, fontWeight: 500, color: style.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: cancelled ? 'line-through' : 'none' }}>
              {appointment.startTime} → {appointment.endTime}
            </p>
          )}
          <p style={{ fontSize: compact ? 10 : 11, color: style.text, margin: compact ? 0 : '1px 0 0', fontWeight: compact ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: cancelled ? 'line-through' : 'none' }}>
            {appointment.client}
          </p>
        </div>
        {!compact && <PaymentDot appt={appointment} />}
      </div>
      {!compact && (
        <p style={{ fontSize: 10, color: style.subtext, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {appointment.service}{appointment.amount > 0 ? ` · R$ ${appointment.amount}` : ''}
        </p>
      )}
      {paymentLabel && (
        <p style={{ fontSize: 9, margin: '2px 0 0', color: paymentLabel === 'Pago' ? '#15803D' : '#92400E', fontWeight: 500 }}>
          {paymentLabel}
        </p>
      )}
    </button>
  )
}
