// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientTag = 'VIP' | 'Novo' | 'Inativo' | 'Aniversário' | 'Fidelidade'
export type VisitStatus = 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
export type ApptStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface VisitHistory {
  id: string
  date: string
  service: string
  professional: string
  amount: number
  status: VisitStatus
  paymentMethod: string
}

export interface UpcomingAppt {
  id: string
  date: string
  time: string
  service: string
  professional: string
  status: ApptStatus
}

export interface ServiceFreq {
  service: string
  count: number
  totalSpent: number
}

export interface Cliente {
  id: string
  clientNumber?: number | null
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string        // YYYY-MM-DD
  clienteSince: string     // YYYY-MM-DD
  favoriteProfessional: string
  visitCount: number
  lastVisit: string | null
  lastVisitService: string
  lastVisitProfessional: string
  nextAppointment: string | null
  nextAppointmentTime: string
  nextAppointmentService: string
  nextAppointmentProfessional: string
  avgTicket: number
  totalSpent: number
  notes: string
  history: VisitHistory[]
  upcoming: UpcomingAppt[]
  serviceFreq: ServiceFreq[]
  tags: ClientTag[]
}

// ─── Tag calculation ──────────────────────────────────────────────────────────

const TODAY = new Date('2026-06-24')
const TODAY_STR = '2026-06-24'

export function calcTags(c: Omit<Cliente, 'tags'>): ClientTag[] {
  const tags: ClientTag[] = []

  if (c.visitCount >= 20) tags.push('VIP')
  if (c.visitCount < 3)   tags.push('Novo')

  const sinceMs = TODAY.getTime() - new Date(c.clienteSince).getTime()
  if (sinceMs > 365 * 24 * 60 * 60 * 1000) tags.push('Fidelidade')

  if (c.lastVisit) {
    const diffDays = (TODAY.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > 60) tags.push('Inativo')
  }

  const birthMonth = parseInt(c.birthDate.split('-')[1], 10)
  if (birthMonth === TODAY.getMonth() + 1) tags.push('Aniversário')

  return tags
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBRL(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function age(birthDate: string): number {
  const b = new Date(birthDate)
  let a = TODAY.getFullYear() - b.getFullYear()
  if (TODAY.getMonth() < b.getMonth() || (TODAY.getMonth() === b.getMonth() && TODAY.getDate() < b.getDate())) a--
  return a
}

export function clienteSinceLabel(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[d.getMonth()]}/${d.getFullYear()}`
}

// ─── Raw data ────────────────────────────────────────────────────────────────

function mk(c: Omit<Cliente, 'tags'>): Cliente {
  return { ...c, tags: calcTags(c) }
}

export const MOCK_CLIENTES: Cliente[] = [
  mk({
    id: 'c01', name: 'Maria Silva', email: 'maria.silva@email.com', phone: '(11) 99234-5678',
    cpf: '123.456.789-00', birthDate: '1990-06-10', clienteSince: '2024-01-15',
    favoriteProfessional: 'Lena', visitCount: 24,
    lastVisit: '2026-06-20', lastVisitService: 'Escova', lastVisitProfessional: 'Lena',
    nextAppointment: '2026-06-28', nextAppointmentTime: '10:00', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 185, totalSpent: 4440, notes: 'Alérgica a amônia. Prefere produtos naturais.',
    history: [
      { id: 'h01a', date: '2026-06-20', service: 'Escova', professional: 'Lena', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h01b', date: '2026-06-05', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h01c', date: '2026-05-22', service: 'Hidratação', professional: 'Lena', amount: 70, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h01d', date: '2026-05-10', service: 'Escova', professional: 'Lena', amount: 80, status: 'NO_SHOW', paymentMethod: '' },
      { id: 'h01e', date: '2026-04-28', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h01f', date: '2026-04-10', service: 'Escova', professional: 'Lena', amount: 80, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h01g', date: '2026-03-22', service: 'Hidratação', professional: 'Lena', amount: 70, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u01a', date: '2026-06-28', time: '10:00', service: 'Corte', professional: 'João', status: 'CONFIRMED' },
    ],
    serviceFreq: [
      { service: 'Escova', count: 12, totalSpent: 960 },
      { service: 'Coloração', count: 8, totalSpent: 1600 },
      { service: 'Hidratação', count: 4, totalSpent: 280 },
    ],
  }),

  mk({
    id: 'c02', name: 'Carlos Santos', email: 'carlos.santos@gmail.com', phone: '(11) 98876-4321',
    cpf: '987.654.321-11', birthDate: '1985-03-22', clienteSince: '2026-05-10',
    favoriteProfessional: 'João', visitCount: 2,
    lastVisit: '2026-06-15', lastVisitService: 'Barba', lastVisitProfessional: 'João',
    nextAppointment: null, nextAppointmentTime: '', nextAppointmentService: '', nextAppointmentProfessional: '',
    avgTicket: 55, totalSpent: 110, notes: '',
    history: [
      { id: 'h02a', date: '2026-06-15', service: 'Barba', professional: 'João', amount: 40, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h02b', date: '2026-05-20', service: 'Corte + Barba', professional: 'João', amount: 70, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [],
    serviceFreq: [
      { service: 'Barba', count: 1, totalSpent: 40 },
      { service: 'Corte + Barba', count: 1, totalSpent: 70 },
    ],
  }),

  mk({
    id: 'c03', name: 'Ana Beatriz Costa', email: 'anabeatriz@hotmail.com', phone: '(21) 97654-3210',
    cpf: '456.123.789-22', birthDate: '1995-09-05', clienteSince: '2023-03-01',
    favoriteProfessional: 'Lisa Kim', visitCount: 31,
    lastVisit: '2026-06-18', lastVisitService: 'Coloração', lastVisitProfessional: 'Lisa Kim',
    nextAppointment: '2026-07-05', nextAppointmentTime: '14:00', nextAppointmentService: 'Hidratação', nextAppointmentProfessional: 'Lisa Kim',
    avgTicket: 210, totalSpent: 6510, notes: 'Prefere tons de loiro frio. Sensível ao couro cabeludo.',
    history: [
      { id: 'h03a', date: '2026-06-18', service: 'Coloração', professional: 'Lisa Kim', amount: 220, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h03b', date: '2026-05-30', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h03c', date: '2026-05-05', service: 'Corte', professional: 'Lisa Kim', amount: 75, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h03d', date: '2026-04-15', service: 'Coloração', professional: 'Lisa Kim', amount: 220, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h03e', date: '2026-03-20', service: 'Escova', professional: 'Lisa Kim', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h03f', date: '2026-02-28', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h03g', date: '2026-01-15', service: 'Coloração', professional: 'Lisa Kim', amount: 220, status: 'COMPLETED', paymentMethod: 'Crédito' },
    ],
    upcoming: [
      { id: 'u03a', date: '2026-07-05', time: '14:00', service: 'Hidratação', professional: 'Lisa Kim', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Coloração', count: 14, totalSpent: 3080 },
      { service: 'Hidratação', count: 9, totalSpent: 810 },
      { service: 'Escova', count: 5, totalSpent: 400 },
      { service: 'Corte', count: 3, totalSpent: 225 },
    ],
  }),

  mk({
    id: 'c04', name: 'Rafael Mendes', email: 'rafa.mendes@empresa.com.br', phone: '(11) 95432-1098',
    cpf: '321.654.987-33', birthDate: '1992-11-18', clienteSince: '2024-07-20',
    favoriteProfessional: 'João', visitCount: 15,
    lastVisit: '2026-06-10', lastVisitService: 'Corte + Barba', lastVisitProfessional: 'João',
    nextAppointment: '2026-07-10', nextAppointmentTime: '09:00', nextAppointmentService: 'Corte + Barba', nextAppointmentProfessional: 'João',
    avgTicket: 95, totalSpent: 1425, notes: 'Vem sempre quinzenal. Gosta de fade alto.',
    history: [
      { id: 'h04a', date: '2026-06-10', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h04b', date: '2026-05-27', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h04c', date: '2026-05-13', service: 'Barba', professional: 'João', amount: 40, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h04d', date: '2026-04-29', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h04e', date: '2026-04-15', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h04f', date: '2026-04-01', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'CANCELLED', paymentMethod: '' },
    ],
    upcoming: [
      { id: 'u04a', date: '2026-07-10', time: '09:00', service: 'Corte + Barba', professional: 'João', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Corte + Barba', count: 11, totalSpent: 1100 },
      { service: 'Barba', count: 4, totalSpent: 160 },
    ],
  }),

  mk({
    id: 'c05', name: 'Juliana Ferreira', email: 'ju.ferreira@outlook.com', phone: '(31) 99876-5432',
    cpf: '654.321.098-44', birthDate: '1988-06-24', clienteSince: '2023-09-12',
    favoriteProfessional: 'Ana Costa', visitCount: 22,
    lastVisit: '2026-06-22', lastVisitService: 'Manicure + Pedicure', lastVisitProfessional: 'Ana Costa',
    nextAppointment: '2026-07-08', nextAppointmentTime: '15:00', nextAppointmentService: 'Manicure', nextAppointmentProfessional: 'Ana Costa',
    avgTicket: 75, totalSpent: 1650, notes: 'Aniversário hoje! Prefere esmaltes escuros. Alérgica a acetona comum.',
    history: [
      { id: 'h05a', date: '2026-06-22', service: 'Manicure + Pedicure', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h05b', date: '2026-06-08', service: 'Manicure', professional: 'Ana Costa', amount: 45, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h05c', date: '2026-05-25', service: 'Manicure + Pedicure', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h05d', date: '2026-05-11', service: 'Gel', professional: 'Ana Costa', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h05e', date: '2026-04-27', service: 'Manicure', professional: 'Ana Costa', amount: 45, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u05a', date: '2026-07-08', time: '15:00', service: 'Manicure', professional: 'Ana Costa', status: 'CONFIRMED' },
    ],
    serviceFreq: [
      { service: 'Manicure + Pedicure', count: 10, totalSpent: 900 },
      { service: 'Manicure', count: 9, totalSpent: 405 },
      { service: 'Gel', count: 3, totalSpent: 240 },
    ],
  }),

  mk({
    id: 'c06', name: 'Fernanda Oliveira', email: 'fernanda.o@icloud.com', phone: '(41) 98765-4321',
    cpf: '789.012.345-55', birthDate: '2000-02-14', clienteSince: '2025-11-05',
    favoriteProfessional: 'Lena', visitCount: 6,
    lastVisit: '2026-06-01', lastVisitService: 'Mechas', lastVisitProfessional: 'Lena',
    nextAppointment: '2026-07-15', nextAppointmentTime: '11:00', nextAppointmentService: 'Coloração', nextAppointmentProfessional: 'Lena',
    avgTicket: 165, totalSpent: 990, notes: 'Cabelo fino e frágil. Evitar descoloração forte.',
    history: [
      { id: 'h06a', date: '2026-06-01', service: 'Mechas', professional: 'Lena', amount: 180, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h06b', date: '2026-04-20', service: 'Hidratação', professional: 'Lena', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h06c', date: '2026-03-05', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h06d', date: '2026-01-18', service: 'Escova', professional: 'Lena', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h06e', date: '2025-12-10', service: 'Mechas', professional: 'Lena', amount: 180, status: 'COMPLETED', paymentMethod: 'Crédito' },
    ],
    upcoming: [
      { id: 'u06a', date: '2026-07-15', time: '11:00', service: 'Coloração', professional: 'Lena', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Mechas', count: 2, totalSpent: 360 },
      { service: 'Coloração', count: 2, totalSpent: 400 },
      { service: 'Hidratação', count: 1, totalSpent: 90 },
      { service: 'Escova', count: 1, totalSpent: 80 },
    ],
  }),

  mk({
    id: 'c07', name: 'Pedro Almeida', email: 'pedro.almeida@yahoo.com', phone: '(51) 97654-8765',
    cpf: '012.345.678-66', birthDate: '1978-08-30', clienteSince: '2023-06-01',
    favoriteProfessional: 'João', visitCount: 35,
    lastVisit: '2026-06-20', lastVisitService: 'Corte', lastVisitProfessional: 'João',
    nextAppointment: '2026-07-04', nextAppointmentTime: '08:30', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 65, totalSpent: 2275, notes: 'Cabelo crespo. Prefere tesoura, não máquina.',
    history: [
      { id: 'h07a', date: '2026-06-20', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h07b', date: '2026-06-06', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h07c', date: '2026-05-23', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h07d', date: '2026-05-09', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h07e', date: '2026-04-25', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h07f', date: '2026-04-11', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [
      { id: 'u07a', date: '2026-07-04', time: '08:30', service: 'Corte', professional: 'João', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Corte', count: 35, totalSpent: 2275 },
    ],
  }),

  mk({
    id: 'c08', name: 'Beatriz Rocha', email: 'bia.rocha@gmail.com', phone: '(11) 96543-2109',
    cpf: '234.567.890-77', birthDate: '1998-12-05', clienteSince: '2025-01-20',
    favoriteProfessional: 'Lisa Kim', visitCount: 9,
    lastVisit: '2026-05-15', lastVisitService: 'Alisamento', lastVisitProfessional: 'Lisa Kim',
    nextAppointment: null, nextAppointmentTime: '', nextAppointmentService: '', nextAppointmentProfessional: '',
    avgTicket: 195, totalSpent: 1755, notes: 'Alisamento progressivo a cada 4 meses.',
    history: [
      { id: 'h08a', date: '2026-05-15', service: 'Alisamento', professional: 'Lisa Kim', amount: 280, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h08b', date: '2026-03-10', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h08c', date: '2026-01-20', service: 'Alisamento', professional: 'Lisa Kim', amount: 280, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h08d', date: '2025-09-12', service: 'Escova', professional: 'Lisa Kim', amount: 80, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h08e', date: '2025-06-05', service: 'Alisamento', professional: 'Lisa Kim', amount: 280, status: 'COMPLETED', paymentMethod: 'Crédito' },
    ],
    upcoming: [],
    serviceFreq: [
      { service: 'Alisamento', count: 5, totalSpent: 1400 },
      { service: 'Hidratação', count: 3, totalSpent: 270 },
      { service: 'Escova', count: 1, totalSpent: 80 },
    ],
  }),

  mk({
    id: 'c09', name: 'Lucas Gomes', email: 'lucas.gomes@protonmail.com', phone: '(21) 95678-1234',
    cpf: '345.678.901-88', birthDate: '2004-04-12', clienteSince: '2026-03-01',
    favoriteProfessional: 'João', visitCount: 3,
    lastVisit: '2026-06-05', lastVisitService: 'Corte', lastVisitProfessional: 'João',
    nextAppointment: '2026-07-02', nextAppointmentTime: '10:30', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 65, totalSpent: 195, notes: '',
    history: [
      { id: 'h09a', date: '2026-06-05', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h09b', date: '2026-04-22', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h09c', date: '2026-03-10', service: 'Barba', professional: 'João', amount: 40, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u09a', date: '2026-07-02', time: '10:30', service: 'Corte', professional: 'João', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Corte', count: 2, totalSpent: 130 },
      { service: 'Barba', count: 1, totalSpent: 40 },
    ],
  }),

  mk({
    id: 'c10', name: 'Isabela Nunes', email: 'isabela.n@terra.com.br', phone: '(11) 94321-0987',
    cpf: '567.890.123-99', birthDate: '1993-07-20', clienteSince: '2023-11-08',
    favoriteProfessional: 'Ana Costa', visitCount: 18,
    lastVisit: '2026-06-12', lastVisitService: 'Fibra', lastVisitProfessional: 'Ana Costa',
    nextAppointment: '2026-07-03', nextAppointmentTime: '13:00', nextAppointmentService: 'Manicure + Pedicure', nextAppointmentProfessional: 'Ana Costa',
    avgTicket: 80, totalSpent: 1440, notes: 'Prefere sempre gel ou fibra. Não faz esmalte comum.',
    history: [
      { id: 'h10a', date: '2026-06-12', service: 'Fibra', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h10b', date: '2026-05-29', service: 'Manicure + Pedicure', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h10c', date: '2026-05-15', service: 'Gel', professional: 'Ana Costa', amount: 80, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h10d', date: '2026-05-01', service: 'Fibra', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h10e', date: '2026-04-17', service: 'Manicure', professional: 'Ana Costa', amount: 45, status: 'COMPLETED', paymentMethod: 'Débito' },
    ],
    upcoming: [
      { id: 'u10a', date: '2026-07-03', time: '13:00', service: 'Manicure + Pedicure', professional: 'Ana Costa', status: 'CONFIRMED' },
    ],
    serviceFreq: [
      { service: 'Fibra', count: 7, totalSpent: 630 },
      { service: 'Manicure + Pedicure', count: 6, totalSpent: 540 },
      { service: 'Gel', count: 4, totalSpent: 320 },
      { service: 'Manicure', count: 1, totalSpent: 45 },
    ],
  }),

  mk({
    id: 'c11', name: 'Thiago Barbosa', email: 'thiago.barb@gmail.com', phone: '(11) 93210-9876',
    cpf: '678.901.234-10', birthDate: '1987-01-09', clienteSince: '2024-02-14',
    favoriteProfessional: 'João', visitCount: 20,
    lastVisit: '2026-04-01', lastVisitService: 'Corte + Barba', lastVisitProfessional: 'João',
    nextAppointment: null, nextAppointmentTime: '', nextAppointmentService: '', nextAppointmentProfessional: '',
    avgTicket: 85, totalSpent: 1700, notes: 'Veio menos frequente após mudança de bairro.',
    history: [
      { id: 'h11a', date: '2026-04-01', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h11b', date: '2026-02-10', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h11c', date: '2025-12-20', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h11d', date: '2025-10-15', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h11e', date: '2025-08-05', service: 'Barba', professional: 'João', amount: 40, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [],
    serviceFreq: [
      { service: 'Corte + Barba', count: 17, totalSpent: 1700 },
      { service: 'Barba', count: 3, totalSpent: 120 },
    ],
  }),

  mk({
    id: 'c12', name: 'Camila Rezende', email: 'camila.rezende@uol.com.br', phone: '(61) 92109-8765',
    cpf: '890.123.456-21', birthDate: '1996-10-28', clienteSince: '2025-04-10',
    favoriteProfessional: 'Lena', visitCount: 8,
    lastVisit: '2026-06-14', lastVisitService: 'Ombré', lastVisitProfessional: 'Lena',
    nextAppointment: '2026-08-10', nextAppointmentTime: '14:30', nextAppointmentService: 'Coloração', nextAppointmentProfessional: 'Lena',
    avgTicket: 190, totalSpent: 1520, notes: 'Técnica ombré. Sempre pede hidratação inclusa.',
    history: [
      { id: 'h12a', date: '2026-06-14', service: 'Ombré', professional: 'Lena', amount: 240, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h12b', date: '2026-04-18', service: 'Hidratação', professional: 'Lena', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h12c', date: '2026-02-20', service: 'Ombré', professional: 'Lena', amount: 240, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h12d', date: '2025-12-05', service: 'Escova', professional: 'Lena', amount: 80, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h12e', date: '2025-10-01', service: 'Ombré', professional: 'Lena', amount: 240, status: 'COMPLETED', paymentMethod: 'Crédito' },
    ],
    upcoming: [
      { id: 'u12a', date: '2026-08-10', time: '14:30', service: 'Coloração', professional: 'Lena', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Ombré', count: 4, totalSpent: 960 },
      { service: 'Hidratação', count: 3, totalSpent: 270 },
      { service: 'Escova', count: 1, totalSpent: 80 },
    ],
  }),

  mk({
    id: 'c13', name: 'Gabriela Lima', email: 'gabi.lima@gmail.com', phone: '(11) 91098-7654',
    cpf: '901.234.567-32', birthDate: '2001-05-17', clienteSince: '2026-06-01',
    favoriteProfessional: 'Ana Costa', visitCount: 1,
    lastVisit: '2026-06-10', lastVisitService: 'Manicure', lastVisitProfessional: 'Ana Costa',
    nextAppointment: '2026-06-28', nextAppointmentTime: '16:00', nextAppointmentService: 'Pedicure', nextAppointmentProfessional: 'Ana Costa',
    avgTicket: 45, totalSpent: 45, notes: 'Primeira vez. Indicada pela Maria Silva.',
    history: [
      { id: 'h13a', date: '2026-06-10', service: 'Manicure', professional: 'Ana Costa', amount: 45, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u13a', date: '2026-06-28', time: '16:00', service: 'Pedicure', professional: 'Ana Costa', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Manicure', count: 1, totalSpent: 45 },
    ],
  }),

  mk({
    id: 'c14', name: 'Marcelo Vieira', email: 'marcelo.v@outlook.com', phone: '(11) 90987-6543',
    cpf: '012.345.678-43', birthDate: '1980-09-03', clienteSince: '2023-01-10',
    favoriteProfessional: 'João', visitCount: 28,
    lastVisit: '2026-06-19', lastVisitService: 'Corte', lastVisitProfessional: 'João',
    nextAppointment: '2026-07-03', nextAppointmentTime: '09:30', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 65, totalSpent: 1820, notes: 'Pontual. Tem cartão de fidelidade antigo.',
    history: [
      { id: 'h14a', date: '2026-06-19', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h14b', date: '2026-06-05', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h14c', date: '2026-05-22', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h14d', date: '2026-05-08', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h14e', date: '2026-04-24', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h14f', date: '2026-04-10', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u14a', date: '2026-07-03', time: '09:30', service: 'Corte', professional: 'João', status: 'CONFIRMED' },
    ],
    serviceFreq: [
      { service: 'Corte', count: 24, totalSpent: 1560 },
      { service: 'Corte + Barba', count: 4, totalSpent: 400 },
    ],
  }),

  mk({
    id: 'c15', name: 'Patrícia Souza', email: 'patricia.s@bol.com.br', phone: '(19) 99876-0123',
    cpf: '123.456.789-54', birthDate: '1975-03-08', clienteSince: '2024-05-20',
    favoriteProfessional: 'Lisa Kim', visitCount: 12,
    lastVisit: '2026-03-10', lastVisitService: 'Coloração', lastVisitProfessional: 'Lisa Kim',
    nextAppointment: null, nextAppointmentTime: '', nextAppointmentService: '', nextAppointmentProfessional: '',
    avgTicket: 180, totalSpent: 2160, notes: 'Tingimento castanho acobreado. Alergias não mapeadas.',
    history: [
      { id: 'h15a', date: '2026-03-10', service: 'Coloração', professional: 'Lisa Kim', amount: 200, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h15b', date: '2025-12-18', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h15c', date: '2025-10-05', service: 'Coloração', professional: 'Lisa Kim', amount: 200, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h15d', date: '2025-07-22', service: 'Escova', professional: 'Lisa Kim', amount: 80, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h15e', date: '2025-05-10', service: 'Coloração', professional: 'Lisa Kim', amount: 200, status: 'COMPLETED', paymentMethod: 'Crédito' },
    ],
    upcoming: [],
    serviceFreq: [
      { service: 'Coloração', count: 7, totalSpent: 1400 },
      { service: 'Hidratação', count: 3, totalSpent: 270 },
      { service: 'Escova', count: 2, totalSpent: 160 },
    ],
  }),

  mk({
    id: 'c16', name: 'Diego Carvalho', email: 'diego.c@hotmail.com', phone: '(11) 98765-1234',
    cpf: '234.567.890-65', birthDate: '1991-08-15', clienteSince: '2025-08-01',
    favoriteProfessional: 'João', visitCount: 5,
    lastVisit: '2026-06-08', lastVisitService: 'Barba', lastVisitProfessional: 'João',
    nextAppointment: '2026-06-29', nextAppointmentTime: '11:00', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 60, totalSpent: 300, notes: '',
    history: [
      { id: 'h16a', date: '2026-06-08', service: 'Barba', professional: 'João', amount: 40, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h16b', date: '2026-05-18', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h16c', date: '2026-04-05', service: 'Corte + Barba', professional: 'João', amount: 100, status: 'COMPLETED', paymentMethod: 'Crédito' },
      { id: 'h16d', date: '2026-02-28', service: 'Barba', professional: 'João', amount: 40, status: 'NO_SHOW', paymentMethod: '' },
      { id: 'h16e', date: '2025-12-15', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [
      { id: 'u16a', date: '2026-06-29', time: '11:00', service: 'Corte', professional: 'João', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Corte', count: 2, totalSpent: 130 },
      { service: 'Barba', count: 2, totalSpent: 80 },
      { service: 'Corte + Barba', count: 1, totalSpent: 100 },
    ],
  }),

  mk({
    id: 'c17', name: 'Renata Campos', email: 'renata.campos@gmail.com', phone: '(31) 97654-9876',
    cpf: '345.678.901-76', birthDate: '1983-11-30', clienteSince: '2023-05-15',
    favoriteProfessional: 'Lena', visitCount: 25,
    lastVisit: '2026-06-17', lastVisitService: 'Coloração', lastVisitProfessional: 'Lena',
    nextAppointment: '2026-07-20', nextAppointmentTime: '10:00', nextAppointmentService: 'Coloração', nextAppointmentProfessional: 'Lena',
    avgTicket: 175, totalSpent: 4375, notes: 'Cabelo grisalho. Cobertura total dos fios brancos. Faz a cada 45 dias.',
    history: [
      { id: 'h17a', date: '2026-06-17', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h17b', date: '2026-05-03', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h17c', date: '2026-03-20', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h17d', date: '2026-02-05', service: 'Hidratação', professional: 'Lena', amount: 90, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h17e', date: '2026-01-10', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h17f', date: '2025-11-28', service: 'Coloração', professional: 'Lena', amount: 200, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u17a', date: '2026-07-20', time: '10:00', service: 'Coloração', professional: 'Lena', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Coloração', count: 20, totalSpent: 4000 },
      { service: 'Hidratação', count: 5, totalSpent: 450 },
    ],
  }),

  mk({
    id: 'c18', name: 'Amanda Torres', email: 'amanda.t@usp.br', phone: '(11) 96789-0123',
    cpf: '456.789.012-87', birthDate: '2003-02-28', clienteSince: '2026-02-10',
    favoriteProfessional: 'Ana Costa', visitCount: 4,
    lastVisit: '2026-06-20', lastVisitService: 'Gel', lastVisitProfessional: 'Ana Costa',
    nextAppointment: '2026-07-18', nextAppointmentTime: '12:00', nextAppointmentService: 'Gel', nextAppointmentProfessional: 'Ana Costa',
    avgTicket: 80, totalSpent: 320, notes: 'Estudante universitária. Prefere sábados.',
    history: [
      { id: 'h18a', date: '2026-06-20', service: 'Gel', professional: 'Ana Costa', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h18b', date: '2026-05-09', service: 'Manicure + Pedicure', professional: 'Ana Costa', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h18c', date: '2026-03-28', service: 'Gel', professional: 'Ana Costa', amount: 80, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h18d', date: '2026-02-15', service: 'Manicure', professional: 'Ana Costa', amount: 45, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [
      { id: 'u18a', date: '2026-07-18', time: '12:00', service: 'Gel', professional: 'Ana Costa', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Gel', count: 2, totalSpent: 160 },
      { service: 'Manicure + Pedicure', count: 1, totalSpent: 90 },
      { service: 'Manicure', count: 1, totalSpent: 45 },
    ],
  }),

  mk({
    id: 'c19', name: 'Roberto Fonseca', email: 'roberto.f@empresa.net', phone: '(41) 95432-1987',
    cpf: '567.890.123-98', birthDate: '1968-06-07', clienteSince: '2023-08-05',
    favoriteProfessional: 'João', visitCount: 30,
    lastVisit: '2026-06-21', lastVisitService: 'Corte', lastVisitProfessional: 'João',
    nextAppointment: '2026-07-05', nextAppointmentTime: '08:00', nextAppointmentService: 'Corte', nextAppointmentProfessional: 'João',
    avgTicket: 65, totalSpent: 1950, notes: 'Aposentado. Sempre às terças de manhã. Conta muitas histórias.',
    history: [
      { id: 'h19a', date: '2026-06-21', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h19b', date: '2026-06-07', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h19c', date: '2026-05-24', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h19d', date: '2026-05-10', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h19e', date: '2026-04-26', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
      { id: 'h19f', date: '2026-04-12', service: 'Corte', professional: 'João', amount: 65, status: 'COMPLETED', paymentMethod: 'Dinheiro' },
    ],
    upcoming: [
      { id: 'u19a', date: '2026-07-05', time: '08:00', service: 'Corte', professional: 'João', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Corte', count: 30, totalSpent: 1950 },
    ],
  }),

  mk({
    id: 'c20', name: 'Larissa Pinto', email: 'larissa.p@ig.com.br', phone: '(11) 94567-8901',
    cpf: '678.901.234-09', birthDate: '1997-08-22', clienteSince: '2024-09-03',
    favoriteProfessional: 'Lisa Kim', visitCount: 11,
    lastVisit: '2026-06-16', lastVisitService: 'Escova', lastVisitProfessional: 'Lisa Kim',
    nextAppointment: '2026-07-14', nextAppointmentTime: '11:30', nextAppointmentService: 'Hidratação', nextAppointmentProfessional: 'Lisa Kim',
    avgTicket: 120, totalSpent: 1320, notes: 'Cabelo muito volumoso. Escova israelense funciona bem.',
    history: [
      { id: 'h20a', date: '2026-06-16', service: 'Escova', professional: 'Lisa Kim', amount: 120, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h20b', date: '2026-05-26', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h20c', date: '2026-05-05', service: 'Escova', professional: 'Lisa Kim', amount: 120, status: 'COMPLETED', paymentMethod: 'Débito' },
      { id: 'h20d', date: '2026-04-14', service: 'Corte', professional: 'Lisa Kim', amount: 75, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h20e', date: '2026-03-25', service: 'Escova', professional: 'Lisa Kim', amount: 120, status: 'COMPLETED', paymentMethod: 'PIX' },
      { id: 'h20f', date: '2026-03-04', service: 'Hidratação', professional: 'Lisa Kim', amount: 90, status: 'COMPLETED', paymentMethod: 'PIX' },
    ],
    upcoming: [
      { id: 'u20a', date: '2026-07-14', time: '11:30', service: 'Hidratação', professional: 'Lisa Kim', status: 'SCHEDULED' },
    ],
    serviceFreq: [
      { service: 'Escova', count: 5, totalSpent: 600 },
      { service: 'Hidratação', count: 4, totalSpent: 360 },
      { service: 'Corte', count: 2, totalSpent: 150 },
    ],
  }),
]

// ─── KPI helpers ─────────────────────────────────────────────────────────────

export function kpiStats(clientes: Cliente[]) {
  const total      = clientes.length
  const thirtyAgo  = new Date(TODAY); thirtyAgo.setDate(thirtyAgo.getDate() - 30)
  const novos      = clientes.filter((c) => new Date(c.clienteSince) >= thirtyAgo).length
  const returners  = clientes.filter((c) => c.visitCount > 1).length
  const retorno    = total > 0 ? Math.round((returners / total) * 100) : 0
  const avgTicket  = total > 0 ? Math.round(clientes.reduce((s, c) => s + c.avgTicket, 0) / total) : 0
  return { total, novos, retorno, avgTicket }
}
