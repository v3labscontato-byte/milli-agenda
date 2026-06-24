import { format, addDays, subDays, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AppointmentStatus } from './mock-data'

// ─── Time slots ───────────────────────────────────────────────────────────────

export const TIME_SLOTS: string[] = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
}) // '08:00' … '20:00'

export const SLOT_HEIGHT = 52 // px per 30-min slot

/** Index of a time string within TIME_SLOTS (0 = 08:00). Returns -1 if out of range. */
export function getSlotIndex(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const idx = (h - 8) * 2 + (m >= 30 ? 1 : 0)
  return idx >= 0 && idx < TIME_SLOTS.length ? idx : -1
}

export function getDurationSlots(minutes: number): number {
  return Math.max(1, Math.ceil(minutes / 30))
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function isSameDayUtil(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}

export function isTodayUtil(date: Date): boolean {
  return isToday(date)
}

export function nextDay(date: Date): Date {
  return addDays(date, 1)
}

export function prevDay(date: Date): Date {
  return subDays(date, 1)
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDayLong(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDayShort(date: Date): string {
  return format(date, "EEE', 'd' de 'MMM", { locale: ptBR })
}

// ─── Professionals ────────────────────────────────────────────────────────────

export interface CalendarProfessional {
  id: string
  name: string
  role: string
  initials: string
  color: string
}

export const CALENDAR_PROFESSIONALS: CalendarProfessional[] = [
  { id: 'lisa',  name: 'Lisa Kim',    role: 'Hair Stylist', initials: 'LK', color: '#7C3AED' },
  { id: 'joao',  name: 'João Silva',  role: 'Barbeiro',     initials: 'JS', color: '#2563EB' },
  { id: 'ana',   name: 'Ana Costa',   role: 'Nail Tech',    initials: 'AC', color: '#DB2777' },
  { id: 'lena',  name: 'Lena',        role: 'Colorista',    initials: 'LE', color: '#059669' },
]

// ─── Calendar appointment type ────────────────────────────────────────────────

export interface CalendarAppointment {
  id: string
  date: string        // 'YYYY-MM-DD'
  startTime: string   // 'HH:MM'
  endTime: string     // 'HH:MM'
  durationMinutes: number
  client: string
  service: string
  professionalId: string
  amount: number
  status: AppointmentStatus
}

// ─── Status colours ───────────────────────────────────────────────────────────

export interface StatusStyle {
  bg: string
  border: string   // left-border colour
  text: string
  label: string
}

export const STATUS_STYLES: Record<AppointmentStatus, StatusStyle> = {
  SCHEDULED:        { bg: 'bg-[#F8FAFC]',  border: 'border-l-[#94A3B8]', text: 'text-[#475569]', label: 'Agendado'        },
  CONFIRMED:        { bg: 'bg-[#EFF6FF]',  border: 'border-l-[#2563EB]', text: 'text-[#1D4ED8]', label: 'Confirmado'      },
  CHECKED_IN:       { bg: 'bg-[#F3E8FF]',  border: 'border-l-[#7C3AED]', text: 'text-[#6B21A8]', label: 'Check-in'        },
  IN_SERVICE:       { bg: 'bg-[#D1FAE5]',  border: 'border-l-[#059669]', text: 'text-[#065F46]', label: 'Em Atend.'       },
  AWAITING_PAYMENT: { bg: 'bg-[#FEF3C7]',  border: 'border-l-[#D97706]', text: 'text-[#B45309]', label: 'Aguard. Pagto'   },
  COMPLETED:        { bg: 'bg-[#F0FDF4]',  border: 'border-l-[#10B981]', text: 'text-[#065F46]', label: 'Concluído'       },
  NO_SHOW:          { bg: 'bg-[#F1F5F9]',  border: 'border-l-[#94A3B8]', text: 'text-[#64748B]', label: 'Não Compareceu'  },
  CANCELLED:        { bg: 'bg-[#FEF2F2]',  border: 'border-l-[#EF4444]', text: 'text-[#991B1B]', label: 'Cancelado'       },
}

// ─── Mock data (dates relative to today so navigation always shows data) ──────

function d(offset: number): string {
  return toDateString(addDays(new Date(), offset))
}

export const MOCK_CALENDAR_APPOINTMENTS: CalendarAppointment[] = [
  // ── Yesterday ──────────────────────────────────────────────────────────────
  { id: 'y1',  date: d(-1), startTime: '09:00', endTime: '10:00', durationMinutes: 60,  client: 'Fernanda Alves',   service: 'Corte',              professionalId: 'lisa', amount: 75,  status: 'COMPLETED'        },
  { id: 'y2',  date: d(-1), startTime: '10:00', endTime: '10:30', durationMinutes: 30,  client: 'Lucas Pereira',    service: 'Barba',              professionalId: 'joao', amount: 40,  status: 'COMPLETED'        },
  { id: 'y3',  date: d(-1), startTime: '15:00', endTime: '16:00', durationMinutes: 60,  client: 'Pedro Lima',       service: 'Corte',              professionalId: 'joao', amount: 65,  status: 'COMPLETED'        },
  { id: 'y4',  date: d(-1), startTime: '11:00', endTime: '12:30', durationMinutes: 90,  client: 'Larissa Mendes',   service: 'Manicure + Pedicure', professionalId: 'ana',  amount: 90,  status: 'COMPLETED'        },
  { id: 'y5',  date: d(-1), startTime: '14:00', endTime: '16:00', durationMinutes: 120, client: 'Clara Santos',     service: 'Coloração',          professionalId: 'lena', amount: 220, status: 'COMPLETED'        },

  // ── Today ──────────────────────────────────────────────────────────────────
  { id: 't1',  date: d(0),  startTime: '08:30', endTime: '10:00', durationMinutes: 90,  client: 'Ana Clara Borges', service: 'Coloração',          professionalId: 'lisa', amount: 200, status: 'CONFIRMED'        },
  { id: 't2',  date: d(0),  startTime: '11:00', endTime: '12:00', durationMinutes: 60,  client: 'Patrícia Mendes',  service: 'Escova',             professionalId: 'lisa', amount: 80,  status: 'IN_SERVICE'       },
  { id: 't3',  date: d(0),  startTime: '14:00', endTime: '14:45', durationMinutes: 45,  client: 'Rafaela Costa',    service: 'Corte',              professionalId: 'lisa', amount: 75,  status: 'SCHEDULED'        },
  { id: 't4',  date: d(0),  startTime: '09:00', endTime: '09:30', durationMinutes: 30,  client: 'Diego Santos',     service: 'Barba',              professionalId: 'joao', amount: 40,  status: 'COMPLETED'        },
  { id: 't5',  date: d(0),  startTime: '10:30', endTime: '11:15', durationMinutes: 45,  client: 'Bruno Almeida',    service: 'Corte',              professionalId: 'joao', amount: 65,  status: 'CONFIRMED'        },
  { id: 't6',  date: d(0),  startTime: '14:30', endTime: '15:30', durationMinutes: 60,  client: 'Felipe Rodrigues', service: 'Corte + Barba',      professionalId: 'joao', amount: 100, status: 'SCHEDULED'        },
  { id: 't7',  date: d(0),  startTime: '09:00', endTime: '09:45', durationMinutes: 45,  client: 'Mariana Lima',     service: 'Manicure',           professionalId: 'ana',  amount: 45,  status: 'CHECKED_IN'       },
  { id: 't8',  date: d(0),  startTime: '10:00', endTime: '11:00', durationMinutes: 60,  client: 'Camila Ferreira',  service: 'Pedicure',           professionalId: 'ana',  amount: 55,  status: 'AWAITING_PAYMENT' },
  { id: 't9',  date: d(0),  startTime: '13:30', endTime: '14:15', durationMinutes: 45,  client: 'Isabela Santos',   service: 'Manicure',           professionalId: 'ana',  amount: 45,  status: 'SCHEDULED'        },
  { id: 't10', date: d(0),  startTime: '08:00', endTime: '10:00', durationMinutes: 120, client: 'Beatriz Oliveira', service: 'Coloração',          professionalId: 'lena', amount: 220, status: 'COMPLETED'        },
  { id: 't11', date: d(0),  startTime: '10:30', endTime: '11:30', durationMinutes: 60,  client: 'Juliana Costa',    service: 'Hidratação',         professionalId: 'lena', amount: 90,  status: 'IN_SERVICE'       },
  { id: 't12', date: d(0),  startTime: '14:00', endTime: '15:00', durationMinutes: 60,  client: 'Amanda Rocha',     service: 'Escova',             professionalId: 'lena', amount: 80,  status: 'SCHEDULED'        },

  // ── Tomorrow ────────────────────────────────────────────────────────────────
  { id: 'n1',  date: d(1),  startTime: '10:00', endTime: '11:00', durationMinutes: 60,  client: 'Thais Rodrigues',  service: 'Escova',             professionalId: 'lisa', amount: 80,  status: 'SCHEDULED'        },
  { id: 'n2',  date: d(1),  startTime: '13:00', endTime: '15:00', durationMinutes: 120, client: 'Giovanna Alves',   service: 'Coloração',          professionalId: 'lisa', amount: 200, status: 'CONFIRMED'        },
  { id: 'n3',  date: d(1),  startTime: '09:30', endTime: '10:15', durationMinutes: 45,  client: 'Rafael Alves',     service: 'Corte',              professionalId: 'joao', amount: 65,  status: 'CONFIRMED'        },
  { id: 'n4',  date: d(1),  startTime: '11:00', endTime: '11:30', durationMinutes: 30,  client: 'Mateus Souza',     service: 'Barba',              professionalId: 'joao', amount: 40,  status: 'SCHEDULED'        },
  { id: 'n5',  date: d(1),  startTime: '14:00', endTime: '15:00', durationMinutes: 60,  client: 'Natalia Costa',    service: 'Pedicure',           professionalId: 'ana',  amount: 55,  status: 'SCHEDULED'        },
  { id: 'n6',  date: d(1),  startTime: '11:00', endTime: '12:30', durationMinutes: 90,  client: 'Gabi Santos',      service: 'Coloração',          professionalId: 'lena', amount: 180, status: 'CONFIRMED'        },
]

export function getAppointmentsForDate(
  date: Date,
  appointments: CalendarAppointment[] = MOCK_CALENDAR_APPOINTMENTS,
): CalendarAppointment[] {
  const ds = toDateString(date)
  return appointments.filter((a) => a.date === ds)
}
