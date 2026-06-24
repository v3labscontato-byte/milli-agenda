// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface BookingService {
  id: string
  name: string
  emoji: string
  category: string
  durationMins: number
  price: number
}

export interface BookingProfessional {
  id: string
  name: string
  initials: string
  avatarBg: string
  role: string
  rating: number
  reviews: number
  nextAvailable: string
}

export interface BookingAppointment {
  id: string
  service: string
  serviceEmoji: string
  professional: string
  dateLabel: string
  date: Date
  startTime: string
  endTime: string
  price: number
  status: AppointmentStatus
  rated?: boolean
}

export interface SalonReview {
  id: string
  clientName: string
  service: string
  rating: number
  text: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h${m}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

function dayOffset(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

// ─── Salon ────────────────────────────────────────────────────────────────────

export const SALON = {
  emoji: '🌸',
  name: 'Salão Bella Vista',
  address: 'Rua das Flores, 123 — SP',
  rating: 4.8,
  reviewCount: 312,
}

// ─── Client ───────────────────────────────────────────────────────────────────

export const CLIENT = {
  name: 'Maria Silva',
  initials: 'MS',
  avatarBg: '#7C3AED',
  email: 'maria@email.com',
  phone: '(11) 99999-9999',
  since: 'Jan/2025',
  visits: 12,
  totalSpent: 1240,
}

// ─── Services ─────────────────────────────────────────────────────────────────

export const SERVICES: BookingService[] = [
  { id: 'svc-1', name: 'Corte Masculino',       emoji: '✂️',  category: 'CABELO',   durationMins: 30,  price: 45  },
  { id: 'svc-2', name: 'Corte Feminino',         emoji: '💇',  category: 'CABELO',   durationMins: 60,  price: 65  },
  { id: 'svc-3', name: 'Coloração Completa',     emoji: '🎨',  category: 'CABELO',   durationMins: 120, price: 180 },
  { id: 'svc-4', name: 'Escova',                emoji: '💨',  category: 'CABELO',   durationMins: 45,  price: 80  },
  { id: 'svc-5', name: 'Hidratação Capilar',    emoji: '💧',  category: 'CABELO',   durationMins: 60,  price: 100 },
  { id: 'svc-6', name: 'Manicure',              emoji: '💅',  category: 'UNHAS',    durationMins: 45,  price: 40  },
  { id: 'svc-7', name: 'Pedicure',              emoji: '🦶',  category: 'UNHAS',    durationMins: 45,  price: 40  },
  { id: 'svc-8', name: 'Design de Sobrancelha', emoji: '✨',  category: 'ESTÉTICA', durationMins: 30,  price: 35  },
]

export const POPULAR_SERVICES = [SERVICES[0], SERVICES[5], SERVICES[2]] // Corte Masc, Manicure, Coloração

// ─── Professionals ────────────────────────────────────────────────────────────

export const PROFESSIONALS: BookingProfessional[] = [
  { id: 'pro-any', name: 'Sem preferência', initials: '✦', avatarBg: '#94A3B8', role: 'Próximo disponível', rating: 0, reviews: 0, nextAvailable: 'Hoje' },
  { id: 'pro-1',   name: 'Lena Santos',     initials: 'LS', avatarBg: '#7C3AED', role: 'Colorista',     rating: 4.9, reviews: 312, nextAvailable: 'Amanhã 09:00' },
  { id: 'pro-2',   name: 'João Silva',      initials: 'JS', avatarBg: '#2563EB', role: 'Barbeiro',      rating: 4.8, reviews: 245, nextAvailable: 'Hoje 16:00'  },
  { id: 'pro-3',   name: 'Lisa Kim',        initials: 'LK', avatarBg: '#DB2777', role: 'Hair Stylist',  rating: 5.0, reviews: 28,  nextAvailable: 'Hoje 15:00'  },
  { id: 'pro-4',   name: 'Ana Costa',       initials: 'AC', avatarBg: '#16A34A', role: 'Manicure',      rating: 4.7, reviews: 89,  nextAvailable: 'Amanhã 10:00'},
]

// ─── Available slots (next 14 days) ──────────────────────────────────────────

const ALL_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

export const AVAILABLE_SLOTS: Record<string, string[]> = (() => {
  const result: Record<string, string[]> = {}
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === 0) continue // Sunday closed
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (d.getDay() === 6) {
      result[key] = ['09:00', '10:00', '11:00']
    } else if (i % 4 === 0) {
      result[key] = ['09:00', '11:00', '15:00', '17:00']
    } else {
      result[key] = ALL_SLOTS
    }
  }
  return result
})()

// ─── Appointments ─────────────────────────────────────────────────────────────

export const UPCOMING_APPOINTMENTS: BookingAppointment[] = [
  {
    id: 'ba-1',
    service: 'Escova',
    serviceEmoji: '💨',
    professional: 'Lena Santos',
    dateLabel: 'Amanhã · 10:00 – 10:45',
    date: dayOffset(1),
    startTime: '10:00',
    endTime: '10:45',
    price: 80,
    status: 'CONFIRMED',
  },
  {
    id: 'ba-2',
    service: 'Corte Feminino',
    serviceEmoji: '💇',
    professional: 'Lisa Kim',
    dateLabel: 'Qui 25/06 · 09:00 – 10:00',
    date: dayOffset(3),
    startTime: '09:00',
    endTime: '10:00',
    price: 65,
    status: 'SCHEDULED',
  },
]

export const PAST_APPOINTMENTS: BookingAppointment[] = [
  { id: 'ba-p1', service: 'Coloração',       serviceEmoji: '🎨', professional: 'Lena Santos', dateLabel: '20/06/2026', date: dayOffset(-4),   startTime: '10:00', endTime: '12:00', price: 200, status: 'COMPLETED', rated: false },
  { id: 'ba-p2', service: 'Escova',          serviceEmoji: '💨', professional: 'Lena Santos', dateLabel: '05/06/2026', date: dayOffset(-19),  startTime: '14:00', endTime: '14:45', price: 80,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p3', service: 'Manicure',        serviceEmoji: '💅', professional: 'Ana Costa',   dateLabel: '28/05/2026', date: dayOffset(-27),  startTime: '11:00', endTime: '11:45', price: 40,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p4', service: 'Corte Feminino',  serviceEmoji: '💇', professional: 'Lisa Kim',    dateLabel: '10/05/2026', date: dayOffset(-45),  startTime: '09:00', endTime: '10:00', price: 65,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p5', service: 'Hidratação',      serviceEmoji: '💧', professional: 'Lena Santos', dateLabel: '02/05/2026', date: dayOffset(-53),  startTime: '15:00', endTime: '16:00', price: 100, status: 'COMPLETED', rated: true  },
  { id: 'ba-p6', service: 'Escova',          serviceEmoji: '💨', professional: 'Lena Santos', dateLabel: '15/04/2026', date: dayOffset(-70),  startTime: '10:00', endTime: '10:45', price: 80,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p7', service: 'Manicure',        serviceEmoji: '💅', professional: 'Ana Costa',   dateLabel: '01/04/2026', date: dayOffset(-84),  startTime: '11:00', endTime: '11:45', price: 40,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p8', service: 'Coloração',       serviceEmoji: '🎨', professional: 'Lena Santos', dateLabel: '15/03/2026', date: dayOffset(-101), startTime: '10:00', endTime: '12:00', price: 200, status: 'COMPLETED', rated: true  },
]

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const REVIEWS: SalonReview[] = [
  { id: 'rev-1', clientName: 'Ana Paula',   service: 'Escova com Lena',         rating: 5, text: 'Adorei o atendimento! Super profissional e atenciosa.' },
  { id: 'rev-2', clientName: 'Carlos M.',   service: 'Corte com João',           rating: 5, text: 'Melhor salão da região, já sou cliente há anos!' },
  { id: 'rev-3', clientName: 'Fernanda S.', service: 'Coloração com Lena',       rating: 5, text: 'Resultado incrível, amei a cor! Recomendo demais.' },
]
