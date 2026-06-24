// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type LoyaltyLevel     = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'
export type CouponType       = 'percent' | 'fixed'
export type AffiliateStatus  = 'completed' | 'pending'
export type PontosType       = 'earned' | 'redeemed'

export interface BookingService {
  id: string; name: string; emoji: string; category: string; durationMins: number; price: number
}
export interface BookingProfessional {
  id: string; name: string; initials: string; avatarBg: string
  role: string; rating: number; reviews: number; nextAvailable: string
}
export interface BookingAppointment {
  id: string; service: string; serviceEmoji: string; serviceId?: string
  professional: string; proId?: string
  dateLabel: string; date: Date; startTime: string; endTime: string
  price: number; status: AppointmentStatus; rated?: boolean
}
export interface SalonReview {
  id: string; clientName: string; service: string; rating: number; text: string
}
export interface BookingCoupon {
  id: string; code: string; label: string; description: string
  type: CouponType; value: number; expiresAt: string
}
export interface BookingPackage {
  id: string; name: string; emoji: string; services: string[]
  originalPrice: number; discountedPrice: number; validDays: number; highlight?: string
}
export interface ClientPackage {
  id: string; packageId: string; packageName: string; emoji: string
  totalSessions: number; usedSessions: number; expiresAt: string
}
export interface BookingAffiliate {
  id: string; friendName: string; service: string
  amount: number; date: string; status: AffiliateStatus; commission: number
}
export interface BookingNotification {
  id: string; icon: string; title: string; body: string
  timeLabel: string; group: 'HOJE' | 'ESTA SEMANA' | 'MAIS ANTIGAS'; read: boolean
}
export interface PontosHistorico {
  id: string; date: string; description: string; points: number; type: PontosType
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

export interface LoyaltyConfig {
  level: LoyaltyLevel; label: string; emoji: string; twColor: string
  min: number; max: number | null; nextMin: number | null; nextLabel: string | null
}
export function getLoyaltyConfig(points: number): LoyaltyConfig {
  if (points >= 2500) return { level: 'DIAMOND', label: 'DIAMOND', emoji: '💎', twColor: 'text-primary',         min: 2500, max: null, nextMin: null, nextLabel: null }
  if (points >= 1000) return { level: 'GOLD',    label: 'GOLD',    emoji: '🥇', twColor: 'text-warning',         min: 1000, max: 2499, nextMin: 2500, nextLabel: 'DIAMOND' }
  if (points >= 500)  return { level: 'SILVER',  label: 'SILVER',  emoji: '🥈', twColor: 'text-content-secondary', min: 500, max: 999,  nextMin: 1000, nextLabel: 'GOLD'    }
  return { level: 'BRONZE', label: 'BRONZE', emoji: '🥉', twColor: 'text-warning-medium', min: 0, max: 499, nextMin: 500, nextLabel: 'SILVER' }
}

export function applyCoupon(code: string, price: number): {
  valid: boolean; discount: number; label: string; coupon: BookingCoupon | null
} {
  const coupon = CUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase().trim())
  if (!coupon) return { valid: false, discount: 0, label: 'Cupom inválido ou expirado', coupon: null }
  const discount = coupon.type === 'percent' ? (price * coupon.value) / 100 : Math.min(coupon.value, price)
  return { valid: true, discount, label: coupon.description, coupon }
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
  pontos: 1240,
  nivel: 'GOLD' as LoyaltyLevel,
  creditoAfiliado: 45.00,
  pacotesAtivos: 2,
  refCode: 'MARIA',
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
export const POPULAR_SERVICES = [SERVICES[0], SERVICES[5], SERVICES[2]]

// ─── Professionals ────────────────────────────────────────────────────────────

export const PROFESSIONALS: BookingProfessional[] = [
  { id: 'pro-any', name: 'Sem preferência', initials: '✦', avatarBg: '#94A3B8', role: 'Próximo disponível', rating: 0,   reviews: 0,   nextAvailable: 'Hoje'        },
  { id: 'pro-1',   name: 'Lena Santos',     initials: 'LS', avatarBg: '#7C3AED', role: 'Colorista',         rating: 4.9, reviews: 312, nextAvailable: 'Amanhã 09:00'},
  { id: 'pro-2',   name: 'João Silva',      initials: 'JS', avatarBg: '#2563EB', role: 'Barbeiro',          rating: 4.8, reviews: 245, nextAvailable: 'Hoje 16:00'  },
  { id: 'pro-3',   name: 'Lisa Kim',        initials: 'LK', avatarBg: '#DB2777', role: 'Hair Stylist',      rating: 5.0, reviews: 28,  nextAvailable: 'Hoje 15:00'  },
  { id: 'pro-4',   name: 'Ana Costa',       initials: 'AC', avatarBg: '#16A34A', role: 'Manicure',          rating: 4.7, reviews: 89,  nextAvailable: 'Amanhã 10:00'},
]

// ─── Available slots ──────────────────────────────────────────────────────────

const ALL_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
export const AVAILABLE_SLOTS: Record<string, string[]> = (() => {
  const result: Record<string, string[]> = {}
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === 0) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (d.getDay() === 6) result[key] = ['09:00', '10:00', '11:00']
    else if (i % 4 === 0) result[key] = ['09:00', '11:00', '15:00', '17:00']
    else result[key] = ALL_SLOTS
  }
  return result
})()

// ─── Appointments ─────────────────────────────────────────────────────────────

export const UPCOMING_APPOINTMENTS: BookingAppointment[] = [
  { id: 'ba-1', service: 'Escova',         serviceEmoji: '💨', serviceId: 'svc-4', professional: 'Lena Santos', proId: 'pro-1',
    dateLabel: 'Amanhã · 10:00 – 10:45',       date: dayOffset(1), startTime: '10:00', endTime: '10:45', price: 80,  status: 'CONFIRMED' },
  { id: 'ba-2', service: 'Corte Feminino', serviceEmoji: '💇', serviceId: 'svc-2', professional: 'Lisa Kim',    proId: 'pro-3',
    dateLabel: 'Qui 25/06 · 09:00 – 10:00',    date: dayOffset(3), startTime: '09:00', endTime: '10:00', price: 65,  status: 'SCHEDULED' },
]
export const PAST_APPOINTMENTS: BookingAppointment[] = [
  { id: 'ba-p1', service: 'Coloração',      serviceEmoji: '🎨', professional: 'Lena Santos', dateLabel: '20/06/2026', date: dayOffset(-4),   startTime: '10:00', endTime: '12:00', price: 200, status: 'COMPLETED', rated: false },
  { id: 'ba-p2', service: 'Escova',         serviceEmoji: '💨', professional: 'Lena Santos', dateLabel: '05/06/2026', date: dayOffset(-19),  startTime: '14:00', endTime: '14:45', price: 80,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p3', service: 'Manicure',       serviceEmoji: '💅', professional: 'Ana Costa',   dateLabel: '28/05/2026', date: dayOffset(-27),  startTime: '11:00', endTime: '11:45', price: 40,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p4', service: 'Corte Feminino', serviceEmoji: '💇', professional: 'Lisa Kim',    dateLabel: '10/05/2026', date: dayOffset(-45),  startTime: '09:00', endTime: '10:00', price: 65,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p5', service: 'Hidratação',     serviceEmoji: '💧', professional: 'Lena Santos', dateLabel: '02/05/2026', date: dayOffset(-53),  startTime: '15:00', endTime: '16:00', price: 100, status: 'COMPLETED', rated: true  },
  { id: 'ba-p6', service: 'Escova',         serviceEmoji: '💨', professional: 'Lena Santos', dateLabel: '15/04/2026', date: dayOffset(-70),  startTime: '10:00', endTime: '10:45', price: 80,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p7', service: 'Manicure',       serviceEmoji: '💅', professional: 'Ana Costa',   dateLabel: '01/04/2026', date: dayOffset(-84),  startTime: '11:00', endTime: '11:45', price: 40,  status: 'COMPLETED', rated: true  },
  { id: 'ba-p8', service: 'Coloração',      serviceEmoji: '🎨', professional: 'Lena Santos', dateLabel: '15/03/2026', date: dayOffset(-101), startTime: '10:00', endTime: '12:00', price: 200, status: 'COMPLETED', rated: true  },
]

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const REVIEWS: SalonReview[] = [
  { id: 'rev-1', clientName: 'Ana Paula',   service: 'Escova com Lena',    rating: 5, text: 'Adorei o atendimento! Super profissional e atenciosa.' },
  { id: 'rev-2', clientName: 'Carlos M.',   service: 'Corte com João',      rating: 5, text: 'Melhor salão da região, já sou cliente há anos!' },
  { id: 'rev-3', clientName: 'Fernanda S.', service: 'Coloração com Lena',  rating: 5, text: 'Resultado incrível, amei a cor! Recomendo demais.' },
]

// ─── Cupons ───────────────────────────────────────────────────────────────────

export const CUPONS: BookingCoupon[] = [
  { id: 'cup-1', code: 'PRIMEIRA10',  label: '10% off',  description: '10% de desconto no primeiro agendamento', type: 'percent', value: 10, expiresAt: '30/06/2026' },
  { id: 'cup-2', code: 'VOLTA10',     label: '10% off',  description: '10% off no próximo agendamento',          type: 'percent', value: 10, expiresAt: '30/07/2026' },
  { id: 'cup-3', code: 'ANIVERSARIO', label: 'R$30 off', description: 'Presente de aniversário — R$30 de desconto', type: 'fixed', value: 30, expiresAt: '31/03/2026' },
]

// ─── Pacotes ──────────────────────────────────────────────────────────────────

export const PACOTES: BookingPackage[] = [
  { id: 'pac-1', name: 'Cabelo Completo', emoji: '💇', services: ['Corte', 'Escova', 'Hidratação'],       originalPrice: 245, discountedPrice: 199, validDays: 30, highlight: '19% off' },
  { id: 'pac-2', name: 'Noivas',          emoji: '💍', services: ['Manicure', 'Pedicure', 'Sobrancelha'], originalPrice: 115, discountedPrice: 89,  validDays: 30, highlight: '23% off' },
  { id: 'pac-3', name: 'Coloração Total', emoji: '🎨', services: ['Coloração', 'Escova', 'Hidratação'],   originalPrice: 360, discountedPrice: 299, validDays: 45, highlight: '17% off' },
]
export const CLIENT_PACOTES: ClientPackage[] = [
  { id: 'cp-1', packageId: 'pac-1', packageName: 'Cabelo Completo', emoji: '💇', totalSessions: 3, usedSessions: 2, expiresAt: '15/07/2026' },
  { id: 'cp-2', packageId: 'pac-2', packageName: 'Noivas',          emoji: '💍', totalSessions: 3, usedSessions: 0, expiresAt: '30/07/2026' },
]

// ─── Afiliados ────────────────────────────────────────────────────────────────

export const AFILIADOS: BookingAffiliate[] = [
  { id: 'af-1', friendName: 'Ana Paula Silva', service: 'Coloração', amount: 180, date: '20/06/2026', status: 'completed', commission: 9.00  },
  { id: 'af-2', friendName: 'Carlos Eduardo',  service: 'Corte',     amount: 45,  date: '18/06/2026', status: 'completed', commission: 2.25  },
  { id: 'af-3', friendName: 'Beatriz Mendes',  service: 'Manicure',  amount: 40,  date: 'Agendado',   status: 'pending',   commission: 2.00  },
]

// ─── Notificações ─────────────────────────────────────────────────────────────

export const NOTIFICACOES: BookingNotification[] = [
  { id: 'n-1', icon: '📅', title: 'Lembrete de agendamento',  body: 'Sua Escova com Lena é amanhã às 10:00. Não esqueça! 💇',                        timeLabel: 'há 2 horas', group: 'HOJE',        read: false },
  { id: 'n-2', icon: '🏆', title: 'Pontos creditados!',       body: 'Você ganhou 200 pontos pela Coloração de ontem. Saldo: 1.240 pts',               timeLabel: 'há 1 dia',   group: 'HOJE',        read: true  },
  { id: 'n-3', icon: '🎁', title: 'Cupom especial para você!', body: 'Use VOLTA10 e ganhe 10% off no próximo agendamento',                            timeLabel: 'há 3 dias',  group: 'ESTA SEMANA', read: true  },
  { id: 'n-4', icon: '👥', title: 'Sua amiga indicou você!',  body: 'Ana Paula usou seu link e agendou. Você ganhou R$15,00 em créditos de afiliado', timeLabel: 'há 5 dias',  group: 'ESTA SEMANA', read: true  },
  { id: 'n-5', icon: '✅', title: 'Agendamento confirmado!',  body: 'Corte Feminino com Lisa Kim · Qui 25/06 às 09:00 confirmado',                    timeLabel: 'há 6 dias',  group: 'ESTA SEMANA', read: true  },
  { id: 'n-6', icon: '⭐', title: 'Avalie seu atendimento',   body: 'Como foi a Coloração com Lena? Avalie e ganhe +50 pts 🏆',                       timeLabel: 'há 4 dias',  group: 'ESTA SEMANA', read: false },
]

// ─── Histórico de pontos ─────────────────────────────────────────────────────

export const HISTORICO_PONTOS: PontosHistorico[] = [
  { id: 'hp-1', date: '20/06', description: 'Coloração Completa',   points:  200, type: 'earned'   },
  { id: 'hp-2', date: '20/06', description: 'Bônus por avaliação',  points:   50, type: 'earned'   },
  { id: 'hp-3', date: '15/06', description: 'Escova',               points:   80, type: 'earned'   },
  { id: 'hp-4', date: '10/06', description: 'Resgate — desconto',   points: -100, type: 'redeemed' },
  { id: 'hp-5', date: '02/06', description: 'Manicure',             points:   40, type: 'earned'   },
  { id: 'hp-6', date: '28/05', description: 'Bônus indicação',      points:  900, type: 'earned'   },
  { id: 'hp-7', date: '15/05', description: 'Corte Feminino',       points:   65, type: 'earned'   },
  { id: 'hp-8', date: '01/05', description: 'Resgate — desconto',   points: -200, type: 'redeemed' },
]
