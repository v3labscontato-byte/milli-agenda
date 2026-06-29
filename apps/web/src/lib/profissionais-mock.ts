// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfissionalRole =
  | 'Cabeleireira' | 'Cabeleireiro' | 'Colorista'
  | 'Barbeiro' | 'Manicure' | 'Nail Designer' | 'Esteticista'

export type ProfissionalStatus = 'active' | 'vacation' | 'inactive'

export interface ProfAgenda {
  id: string
  date: string     // YYYY-MM-DD
  time: string     // "HH:MM"
  clientName: string
  service: string
  duration: number // minutes
  value: number
}

export interface MonthlyData {
  month: string
  revenue: number
  commission?: number
  appointments: number
  totalAgendamentos?: number
  finalizados?: number
  pendentes?: number
  cancelados?: number
}

export interface Profissional {
  id: string
  name: string
  role: ProfissionalRole
  specialties: string[]
  email: string
  phone: string
  cpf: string
  birthDate: string   // YYYY-MM-DD
  vinculo?: string
  hireDate: string    // YYYY-MM-DD
  status: ProfissionalStatus
  bio: string
  workDays: number[]  // 0=Dom … 6=Sáb
  workStart: string
  workEnd: string
  commissionPct: number
  appointmentsToday: number
  appointmentsThisMonth: number
  revenueThisMonth: number
  appointmentsTotal: number
  revenueTotal: number
  avgTicket: number
  rating: number
  ratingCount: number
  monthlyData: MonthlyData[]
  upcoming: ProfAgenda[]
  enabledServices?: string[]
  totalAgendados?: number
  totalFinalizados?: number
  totalPendentes?: number
  totalCancelados?: number
  specialtyIds?: string[]
  allowSimultaneous?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function workDaysLabel(days: number[]): string {
  return days.map((d) => WEEK_DAYS[d]).join(', ')
}

export function formatBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(d: string | undefined | null): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return '—'
  return `${day}/${m}/${y}`
}

export function age(d: string | undefined | null): string {
  if (!d) return '—'
  const birth = new Date(d)
  if (isNaN(birth.getTime())) return '—'
  const diff = Date.now() - birth.getTime()
  return String(Math.floor(diff / (365.25 * 24 * 3600 * 1000)))
}

export function hireSince(iso: string): string {
  const hire = new Date(iso)
  const today = new Date()
  const months = (today.getFullYear() - hire.getFullYear()) * 12 + today.getMonth() - hire.getMonth()
  if (months < 12) return `${months} mes${months !== 1 ? 'es' : ''}`
  const years = Math.floor(months / 12)
  return `${years} ano${years !== 1 ? 's' : ''}`
}

export function kpiStats(profs: Profissional[]) {
  const todayDay = new Date().getDay()
  const ativos = profs.filter((p) => p.status === 'active')
  const ativosHoje = ativos.filter((p) => p.workDays.includes(todayDay))
  const faturamento = profs.reduce((s, p) => s + Number(p.revenueThisMonth ?? 0), 0)
  const totalRating = profs.reduce((s, p) => s + Number(p.rating ?? 0) * Number(p.ratingCount ?? 0), 0)
  const totalRatingCount = profs.reduce((s, p) => s + Number(p.ratingCount ?? 0), 0)
  return {
    total: profs.length,
    ativosHoje: ativosHoje.length,
    faturamentoMes: faturamento,
    avgRating: totalRatingCount > 0
      ? Math.round((totalRating / totalRatingCount) * 10) / 10
      : 0,
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_PROFISSIONAIS: Profissional[] = [
  {
    id: 'p1', name: 'Lena Santos', role: 'Cabeleireira',
    specialties: ['Corte Feminino', 'Escova Progressiva', 'Hidratação'],
    email: 'lena@millisalon.com.br', phone: '(11) 98765-4321',
    cpf: '123.456.789-01', birthDate: '1992-03-15', hireDate: '2020-01-10',
    status: 'active', workDays: [1,2,3,4,5,6], workStart: '09:00', workEnd: '18:00',
    commissionPct: 60, appointmentsToday: 6, appointmentsThisMonth: 44,
    revenueThisMonth: 4900, appointmentsTotal: 1240, revenueTotal: 128000,
    avgTicket: 111, rating: 4.9, ratingCount: 312,
    bio: 'Especialista em cortes femininos e progressivas. Formada pelo Instituto Beleza Natural com 6 anos de experiência no salão.',
    monthlyData: [
      { month: 'Jan', revenue: 4200, appointments: 38 },
      { month: 'Fev', revenue: 3800, appointments: 34 },
      { month: 'Mar', revenue: 4600, appointments: 42 },
      { month: 'Abr', revenue: 4100, appointments: 37 },
      { month: 'Mai', revenue: 4900, appointments: 44 },
      { month: 'Jun', revenue: 2800, appointments: 25 },
    ],
    upcoming: [
      { id: 'a1', date: '2026-06-24', time: '14:00', clientName: 'Maria Silva', service: 'Corte Feminino', duration: 60, value: 65 },
      { id: 'a2', date: '2026-06-24', time: '15:30', clientName: 'Fernanda Lima', service: 'Escova', duration: 45, value: 55 },
      { id: 'a3', date: '2026-06-25', time: '09:00', clientName: 'Patrícia Gomes', service: 'Hidratação Capilar', duration: 90, value: 90 },
      { id: 'a4', date: '2026-06-25', time: '11:00', clientName: 'Sandra Rocha', service: 'Corte + Escova', duration: 90, value: 120 },
    ],
  },
  {
    id: 'p2', name: 'João Ferreira', role: 'Barbeiro',
    specialties: ['Corte Masculino', 'Barba', 'Navalhado'],
    email: 'joao@millisalon.com.br', phone: '(11) 97654-3210',
    cpf: '234.567.890-12', birthDate: '1989-07-22', hireDate: '2021-03-01',
    status: 'active', workDays: [1,2,3,4,5,6], workStart: '08:00', workEnd: '17:00',
    commissionPct: 50, appointmentsToday: 5, appointmentsThisMonth: 38,
    revenueThisMonth: 1520, appointmentsTotal: 820, revenueTotal: 48000,
    avgTicket: 40, rating: 4.7, ratingCount: 198,
    bio: 'Especialista em cortes masculinos modernos e barba. 10 anos de experiência, referência em navalhado.',
    monthlyData: [
      { month: 'Jan', revenue: 1400, appointments: 35 },
      { month: 'Fev', revenue: 1200, appointments: 30 },
      { month: 'Mar', revenue: 1600, appointments: 40 },
      { month: 'Abr', revenue: 1350, appointments: 34 },
      { month: 'Mai', revenue: 1520, appointments: 38 },
      { month: 'Jun', revenue: 900, appointments: 22 },
    ],
    upcoming: [
      { id: 'a5', date: '2026-06-24', time: '14:30', clientName: 'Rafael Costa', service: 'Corte + Barba', duration: 60, value: 65 },
      { id: 'a6', date: '2026-06-24', time: '16:00', clientName: 'Thiago Lima', service: 'Corte Masculino', duration: 30, value: 45 },
      { id: 'a7', date: '2026-06-26', time: '10:00', clientName: 'Lucas Alves', service: 'Barba', duration: 30, value: 35 },
    ],
  },
  {
    id: 'p3', name: 'Lisa Kim', role: 'Colorista',
    specialties: ['Coloração', 'Mechas', 'Balayage', 'Ombré'],
    email: 'lisakim@millisalon.com.br', phone: '(11) 96543-2109',
    cpf: '345.678.901-23', birthDate: '1994-11-08', hireDate: '2019-06-15',
    status: 'active', workDays: [2,3,4,5,6], workStart: '10:00', workEnd: '19:00',
    commissionPct: 55, appointmentsToday: 4, appointmentsThisMonth: 28,
    revenueThisMonth: 5600, appointmentsTotal: 680, revenueTotal: 152000,
    avgTicket: 200, rating: 5.0, ratingCount: 156,
    bio: 'Colorista com formação internacional. Especializada em técnicas de iluminação e coloração moderna, como balayage e ombré.',
    monthlyData: [
      { month: 'Jan', revenue: 4800, appointments: 24 },
      { month: 'Fev', revenue: 5200, appointments: 26 },
      { month: 'Mar', revenue: 6000, appointments: 30 },
      { month: 'Abr', revenue: 5400, appointments: 27 },
      { month: 'Mai', revenue: 5800, appointments: 29 },
      { month: 'Jun', revenue: 3200, appointments: 16 },
    ],
    upcoming: [
      { id: 'a8', date: '2026-06-24', time: '13:00', clientName: 'Bianca Pereira', service: 'Balayage', duration: 180, value: 380 },
      { id: 'a9', date: '2026-06-25', time: '10:00', clientName: 'Camila Souza', service: 'Coloração Completa', duration: 120, value: 180 },
      { id: 'a10', date: '2026-06-26', time: '14:00', clientName: 'Juliana Dias', service: 'Mechas', duration: 150, value: 280 },
    ],
  },
  {
    id: 'p4', name: 'Ana Costa', role: 'Manicure',
    specialties: ['Manicure', 'Pedicure', 'Esmaltação em Gel'],
    email: 'ana.costa@millisalon.com.br', phone: '(11) 95432-1098',
    cpf: '456.789.012-34', birthDate: '1996-05-12', hireDate: '2022-02-01',
    status: 'active', workDays: [1,2,3,4,5], workStart: '09:00', workEnd: '18:00',
    commissionPct: 45, appointmentsToday: 8, appointmentsThisMonth: 72,
    revenueThisMonth: 2880, appointmentsTotal: 580, revenueTotal: 29000,
    avgTicket: 40, rating: 4.8, ratingCount: 245,
    bio: 'Especialista em nail art e esmaltação em gel. Atendimento cuidadoso e pontual, apaixonada por design de unhas.',
    monthlyData: [
      { month: 'Jan', revenue: 2400, appointments: 60 },
      { month: 'Fev', revenue: 2100, appointments: 52 },
      { month: 'Mar', revenue: 2600, appointments: 65 },
      { month: 'Abr', revenue: 2300, appointments: 57 },
      { month: 'Mai', revenue: 2880, appointments: 72 },
      { month: 'Jun', revenue: 1600, appointments: 40 },
    ],
    upcoming: [
      { id: 'a11', date: '2026-06-24', time: '14:00', clientName: 'Cláudia Menezes', service: 'Manicure + Pedicure', duration: 90, value: 85 },
      { id: 'a12', date: '2026-06-24', time: '16:00', clientName: 'Roberta Alves', service: 'Esmaltação Gel', duration: 60, value: 25 },
      { id: 'a13', date: '2026-06-25', time: '09:30', clientName: 'Denise Castro', service: 'Manicure', duration: 45, value: 40 },
    ],
  },
  {
    id: 'p5', name: 'Carlos Mendes', role: 'Cabeleireiro',
    specialties: ['Corte Feminino', 'Corte Masculino', 'Penteado para Noivas'],
    email: 'carlos@millisalon.com.br', phone: '(11) 94321-0987',
    cpf: '567.890.123-45', birthDate: '1987-09-30', hireDate: '2018-08-01',
    status: 'active', workDays: [1,2,3,4,5], workStart: '09:00', workEnd: '18:00',
    commissionPct: 55, appointmentsToday: 4, appointmentsThisMonth: 32,
    revenueThisMonth: 3200, appointmentsTotal: 2100, revenueTotal: 186000,
    avgTicket: 100, rating: 4.6, ratingCount: 421,
    bio: 'O profissional mais experiente do salão. 15 anos na área, especialista em penteados para noivas e eventos especiais.',
    monthlyData: [
      { month: 'Jan', revenue: 2800, appointments: 28 },
      { month: 'Fev', revenue: 3100, appointments: 31 },
      { month: 'Mar', revenue: 3400, appointments: 34 },
      { month: 'Abr', revenue: 2900, appointments: 29 },
      { month: 'Mai', revenue: 3200, appointments: 32 },
      { month: 'Jun', revenue: 1800, appointments: 18 },
    ],
    upcoming: [
      { id: 'a14', date: '2026-06-24', time: '15:00', clientName: 'Luíza Barbosa', service: 'Corte Feminino', duration: 60, value: 65 },
      { id: 'a15', date: '2026-06-25', time: '10:00', clientName: 'Paulo Silva', service: 'Corte Masculino', duration: 30, value: 45 },
    ],
  },
  {
    id: 'p6', name: 'Rafaela Oliveira', role: 'Esteticista',
    specialties: ['Limpeza de Pele', 'Design de Sobrancelha', 'Extensão de Cílios'],
    email: 'rafaela@millisalon.com.br', phone: '(11) 93210-9876',
    cpf: '678.901.234-56', birthDate: '1993-02-18', hireDate: '2021-10-15',
    status: 'vacation', workDays: [1,2,3,4,5], workStart: '09:00', workEnd: '17:00',
    commissionPct: 50, appointmentsToday: 0, appointmentsThisMonth: 8,
    revenueThisMonth: 560, appointmentsTotal: 420, revenueTotal: 42000,
    avgTicket: 70, rating: 4.7, ratingCount: 134,
    bio: 'Especialista em estética facial e design de sobrancelhas. Técnica certificada em extensão de cílios. Retorna em julho.',
    monthlyData: [
      { month: 'Jan', revenue: 1960, appointments: 28 },
      { month: 'Fev', revenue: 1680, appointments: 24 },
      { month: 'Mar', revenue: 2100, appointments: 30 },
      { month: 'Abr', revenue: 1820, appointments: 26 },
      { month: 'Mai', revenue: 700, appointments: 10 },
      { month: 'Jun', revenue: 560, appointments: 8 },
    ],
    upcoming: [],
  },
  {
    id: 'p7', name: 'Bruno Alves', role: 'Colorista',
    specialties: ['Coloração Masculina', 'Mechas Masculinas', 'Pigmentação'],
    email: 'bruno@millisalon.com.br', phone: '(11) 92109-8765',
    cpf: '789.012.345-67', birthDate: '1991-12-05', hireDate: '2023-01-16',
    status: 'active', workDays: [1,3,4,5,6], workStart: '10:00', workEnd: '18:00',
    commissionPct: 50, appointmentsToday: 3, appointmentsThisMonth: 22,
    revenueThisMonth: 2640, appointmentsTotal: 310, revenueTotal: 38000,
    avgTicket: 120, rating: 4.5, ratingCount: 78,
    bio: 'Colorista especializado no público masculino. Referência em pigmentação capilar e mechas, com abordagem moderna.',
    monthlyData: [
      { month: 'Jan', revenue: 2200, appointments: 18 },
      { month: 'Fev', revenue: 1900, appointments: 16 },
      { month: 'Mar', revenue: 2600, appointments: 22 },
      { month: 'Abr', revenue: 2300, appointments: 19 },
      { month: 'Mai', revenue: 2640, appointments: 22 },
      { month: 'Jun', revenue: 1440, appointments: 12 },
    ],
    upcoming: [
      { id: 'a16', date: '2026-06-24', time: '14:00', clientName: 'Diego Martins', service: 'Coloração Masculina', duration: 60, value: 120 },
      { id: 'a17', date: '2026-06-26', time: '11:00', clientName: 'Ricardo Souza', service: 'Pigmentação', duration: 90, value: 150 },
    ],
  },
  {
    id: 'p8', name: 'Mariana Ribeiro', role: 'Nail Designer',
    specialties: ['Nail Art', 'Encapsulamento', 'Alongamento em Gel'],
    email: 'mariana@millisalon.com.br', phone: '(11) 91098-7654',
    cpf: '890.123.456-78', birthDate: '1998-08-25', hireDate: '2023-07-01',
    status: 'inactive', workDays: [2,3,4,5,6], workStart: '09:00', workEnd: '17:00',
    commissionPct: 45, appointmentsToday: 0, appointmentsThisMonth: 0,
    revenueThisMonth: 0, appointmentsTotal: 185, revenueTotal: 22000,
    avgTicket: 119, rating: 4.4, ratingCount: 52,
    bio: 'Nail designer especialista em nail art e alongamento. Afastada temporariamente.',
    monthlyData: [
      { month: 'Jan', revenue: 1800, appointments: 15 },
      { month: 'Fev', revenue: 1400, appointments: 12 },
      { month: 'Mar', revenue: 2000, appointments: 17 },
      { month: 'Abr', revenue: 700, appointments: 6 },
      { month: 'Mai', revenue: 0, appointments: 0 },
      { month: 'Jun', revenue: 0, appointments: 0 },
    ],
    upcoming: [],
  },
]
