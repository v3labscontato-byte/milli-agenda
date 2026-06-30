import type { CalendarAppointment } from '@/lib/calendar-utils'

// Status → visual config (light tinted bg + accent bar)
const S: Record<string, { bg: string; border: string; accent: string; timeColor: string; dotColor: string; chipBg: string; chipText: string; chipBorder: string; label: string }> = {
  SCHEDULED:        { bg: '#F6F9FF', border: '#DBEAFE', accent: '#3B82F6', timeColor: '#2563EB', dotColor: '#3B82F6', chipBg: '#EFF6FF', chipText: '#1D4ED8', chipBorder: '#BFDBFE', label: 'Agendado'        },
  CONFIRMED:        { bg: '#F4FDF6', border: '#BBF7D0', accent: '#16A34A', timeColor: '#15803D', dotColor: '#22C55E', chipBg: '#F0FDF4', chipText: '#15803D', chipBorder: '#BBF7D0', label: 'Confirmado'       },
  COMPLETED:        { bg: '#F8F5FF', border: '#DDD6FE', accent: '#7C3AED', timeColor: '#6D28D9', dotColor: '#8B5CF6', chipBg: '#F5F3FF', chipText: '#6D28D9', chipBorder: '#DDD6FE', label: 'Pago'             },
  CANCELLED:        { bg: '#FFF5F5', border: '#FECACA', accent: '#EF4444', timeColor: '#DC2626', dotColor: '#EF4444', chipBg: '#FEF2F2', chipText: '#DC2626', chipBorder: '#FECACA', label: 'Cancelado'        },
  IN_SERVICE:       { bg: '#FFF8F0', border: '#FED7AA', accent: '#F97316', timeColor: '#C2410C', dotColor: '#F97316', chipBg: '#FFF7ED', chipText: '#C2410C', chipBorder: '#FED7AA', label: 'Em atendimento'  },
  AWAITING_PAYMENT: { bg: '#FFFCEB', border: '#FDE68A', accent: '#F59E0B', timeColor: '#92400E', dotColor: '#F59E0B', chipBg: '#FFFBEB', chipText: '#92400E', chipBorder: '#FDE68A', label: 'Aguard. Pagto'   },
  CHECKED_IN:       { bg: '#F8F5FF', border: '#C4B5FD', accent: '#7C3AED', timeColor: '#6B21A8', dotColor: '#8B5CF6', chipBg: '#F5F3FF', chipText: '#6D28D9', chipBorder: '#C4B5FD', label: 'Check-in'        },
  NO_SHOW:          { bg: '#F9FAFB', border: '#D1D5DB', accent: '#94A3B8', timeColor: '#64748B', dotColor: '#94A3B8', chipBg: '#F1F5F9', chipText: '#475569', chipBorder: '#CBD5E1', label: 'Não compareceu'  },
}
const DEFAULT_S = { bg: '#F9FAFB', border: '#E2E8F0', accent: '#94A3B8', timeColor: '#64748B', dotColor: '#94A3B8', chipBg: '#F1F5F9', chipText: '#475569', chipBorder: '#CBD5E1', label: '—' }

function fmtAmt(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

const SHADOW_REST  = '0 1px 3px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)'
const SHADOW_HOVER = '0 4px 16px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)'
const SHADOW_FOCUS = '0 0 0 2px #93C5FD'

interface AppointmentBlockProps {
  appointment: CalendarAppointment
  onClick: () => void
  heightPx: number
}

export default function AppointmentBlock({ appointment, onClick, heightPx }: AppointmentBlockProps) {
  const cfg        = S[appointment.status] ?? DEFAULT_S
  const compact    = heightPx < 58
  const tall       = heightPx >= 90
  const cancelled  = appointment.status === 'CANCELLED'
  const isPaid     = appointment.status === 'COMPLETED'
  const hasMoney   = !cancelled && appointment.amount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${appointment.client} — ${appointment.service} às ${appointment.startTime}`}
      style={{
        background: cfg.bg,
        border: `0.5px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.accent}`,
        borderRadius: 6,
        padding: compact ? '3px 6px' : '6px 9px',
        width: '100%', height: '100%',
        textAlign: 'left', overflow: 'hidden',
        opacity: cancelled ? 0.65 : 1,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        outline: 'none', boxSizing: 'border-box',
        boxShadow: SHADOW_REST,
        transition: 'box-shadow 140ms ease, transform 140ms ease',
      }}
      onMouseEnter={(e) => {
        if (cancelled) return
        e.currentTarget.style.boxShadow = SHADOW_HOVER
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOW_REST
        e.currentTarget.style.transform = ''
      }}
      onFocus={(e)  => { e.currentTarget.style.boxShadow = SHADOW_FOCUS }}
      onBlur={(e)   => { e.currentTarget.style.boxShadow = SHADOW_REST  }}
    >
      {/* ── Row 1: time range + payment indicator ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {!compact && (
            <p style={{
              fontSize: 10, fontWeight: 700, color: cfg.timeColor, margin: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '0.015em',
              textDecoration: cancelled ? 'line-through' : 'none',
            }}>
              {appointment.startTime} – {appointment.endTime}
            </p>
          )}

          {/* ── Client name ── */}
          <p style={{
            fontSize: compact ? 10 : 12,
            fontWeight: 600,
            color: cancelled ? '#94A3B8' : '#0F172A',
            margin: compact ? 0 : '2px 0 0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textDecoration: cancelled ? 'line-through' : 'none',
          }}>
            {appointment.client}
          </p>
        </div>

        {/* Payment $ indicator */}
        {!compact && hasMoney && (
          <span style={{
            fontSize: 13, fontWeight: 800, lineHeight: 1, flexShrink: 0,
            color: isPaid ? '#16A34A' : '#D97706',
            marginTop: 1,
          }}>
            $
          </span>
        )}
      </div>

      {/* ── Row 2: service · amount ── */}
      {!compact && (
        <p style={{
          fontSize: 11, color: '#64748B',
          margin: '3px 0 0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {appointment.service}
          {appointment.amount > 0 ? ` · ${fmtAmt(appointment.amount)}` : ''}
        </p>
      )}

      {/* ── Row 3: status chip (tall cards only) ── */}
      {tall && !cancelled && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 5, padding: '2px 7px',
          borderRadius: 20, fontSize: 10, fontWeight: 500,
          background: cfg.chipBg, color: cfg.chipText,
          border: `0.5px solid ${cfg.chipBorder}`,
          alignSelf: 'flex-start',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: cfg.dotColor, display: 'inline-block', flexShrink: 0,
          }} />
          {cfg.label}
        </span>
      )}
    </button>
  )
}
