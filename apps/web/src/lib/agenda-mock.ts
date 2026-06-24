// ─── Types ────────────────────────────────────────────────────────────────────

export type AgendaStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show'

export interface Agendamento {
  id: string
  clientName: string
  clientPhone?: string
  service: string
  serviceDuration: number   // minutos
  serviceValue: number      // R$
  professionalName: string
  date: string              // 'YYYY-MM-DD'
  time: string              // 'HH:MM'
  status: AgendaStatus
  notes?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDateLong(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().slice(0, 10)
}

export function timeToMinutes(time: string): number {
  const [h, min] = time.split(':').map(Number)
  return h * 60 + min
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function endTime(start: string, duration: number): string {
  return minutesToTime(timeToMinutes(start) + duration)
}

export function kpiStats(date: string, agendamentos: Agendamento[]) {
  const day = agendamentos.filter((a) => a.date === date)
  const confirmed  = day.filter((a) => a.status === 'confirmed').length
  const pending    = day.filter((a) => a.status === 'pending').length
  const completed  = day.filter((a) => a.status === 'completed').length
  const cancelled  = day.filter((a) => a.status === 'cancelled' || a.status === 'no-show').length
  const revenue    = day
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((acc, a) => acc + a.serviceValue, 0)
  return { total: day.length, confirmed, pending, completed, cancelled, revenue }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function mk(
  id: string, date: string, time: string,
  clientName: string, clientPhone: string,
  service: string, serviceDuration: number, serviceValue: number,
  professionalName: string, status: AgendaStatus, notes?: string,
): Agendamento {
  return { id, date, time, clientName, clientPhone, service, serviceDuration, serviceValue, professionalName, status, notes }
}

export const MOCK_AGENDAMENTOS: Agendamento[] = [
  // ── 2026-06-23 (ontem) ───────────────────────────────────────────────────
  mk('a001','2026-06-23','09:00','Camila Torres',   '(11) 98765-1234','Corte Feminino',   60, 65, 'Lena Santos',      'completed'),
  mk('a002','2026-06-23','10:15','Fernanda Lima',   '(11) 97654-2345','Escova',            45, 55, 'Lena Santos',      'completed'),
  mk('a003','2026-06-23','09:00','Diego Santos',    '(11) 96543-3456','Corte + Barba',     60, 65, 'João Ferreira',    'completed'),
  mk('a004','2026-06-23','10:30','Bruno Costa',     '(11) 95432-4567','Barba',             30, 35, 'João Ferreira',    'completed'),
  mk('a005','2026-06-23','09:00','Isabela Nunes',   '(11) 94321-5678','Coloração Completa',120,180,'Lisa Kim',         'completed'),
  mk('a006','2026-06-23','11:30','Juliana Castro',  '(11) 93210-6789','Hidratação Capilar',60, 90, 'Lisa Kim',         'completed'),
  mk('a007','2026-06-23','09:00','Patricia Alves',  '(11) 92109-7890','Manicure',          45, 40, 'Ana Costa',        'completed'),
  mk('a008','2026-06-23','10:00','Amanda Ribeiro',  '(11) 91098-8901','Pedicure',          45, 45, 'Ana Costa',        'completed'),
  mk('a009','2026-06-23','14:00','Thiago Pereira',  '(11) 90987-9012','Limpeza de Pele',   60,120, 'Rafaela Oliveira', 'completed'),

  // ── 2026-06-24 (hoje) ────────────────────────────────────────────────────
  mk('b001','2026-06-24','09:00','Camila Torres',   '(11) 98765-1234','Corte Feminino',    60, 65, 'Lena Santos',      'completed'),
  mk('b002','2026-06-24','10:15','Fernanda Lima',   '(11) 97654-2345','Escova',            45, 55, 'Lena Santos',      'completed'),
  mk('b003','2026-06-24','11:15','Isabela Nunes',   '(11) 94321-5678','Hidratação Capilar',60, 90, 'Lena Santos',      'completed'),
  mk('b004','2026-06-24','13:30','Patricia Alves',  '(11) 92109-7890','Corte Feminino',    60, 65, 'Lena Santos',      'confirmed'),
  mk('b005','2026-06-24','15:00','Juliana Castro',  '(11) 93210-6789','Escova',            45, 55, 'Lena Santos',      'confirmed'),

  mk('b006','2026-06-24','09:00','Diego Santos',    '(11) 96543-3456','Corte + Barba',     60, 65, 'João Ferreira',    'completed'),
  mk('b007','2026-06-24','10:30','Bruno Costa',     '(11) 95432-4567','Barba',             30, 35, 'João Ferreira',    'completed'),
  mk('b008','2026-06-24','11:15','Marcos Oliveira', '(11) 89876-0123','Corte Masculino',   30, 45, 'João Ferreira',    'completed'),
  mk('b009','2026-06-24','14:00','Rodrigo Ferreira','(11) 88765-1234','Corte + Barba',     60, 65, 'João Ferreira',    'confirmed'),
  mk('b010','2026-06-24','15:30','Thiago Pereira',  '(11) 90987-9012','Barba',             30, 35, 'João Ferreira',    'confirmed'),
  mk('b011','2026-06-24','16:15','Diego Santos',    '(11) 96543-3456','Corte Masculino',   30, 45, 'João Ferreira',    'pending'),

  mk('b012','2026-06-24','09:00','Amanda Ribeiro',  '(11) 91098-8901','Mechas / Balayage',150,280, 'Lisa Kim',         'completed'),
  mk('b013','2026-06-24','14:00','Camila Torres',   '(11) 98765-1234','Coloração Completa',120,180,'Lisa Kim',         'confirmed'),
  mk('b014','2026-06-24','17:00','Fernanda Lima',   '(11) 97654-2345','Hidratação Capilar', 60, 90,'Lisa Kim',         'confirmed'),

  mk('b015','2026-06-24','09:00','Juliana Castro',  '(11) 93210-6789','Manicure',          45, 40, 'Ana Costa',        'completed'),
  mk('b016','2026-06-24','10:00','Patricia Alves',  '(11) 92109-7890','Pedicure',          45, 45, 'Ana Costa',        'completed'),
  mk('b017','2026-06-24','11:00','Isabela Nunes',   '(11) 94321-5678','Manicure',          45, 40, 'Ana Costa',        'completed'),
  mk('b018','2026-06-24','14:00','Amanda Ribeiro',  '(11) 91098-8901','Manicure',          45, 40, 'Ana Costa',        'confirmed'),
  mk('b019','2026-06-24','15:00','Thiago Pereira',  '(11) 90987-9012','Pedicure',          45, 45, 'Ana Costa',        'confirmed'),
  mk('b020','2026-06-24','16:00','Marcos Oliveira', '(11) 89876-0123','Manicure',          45, 40, 'Ana Costa',        'pending'),

  mk('b021','2026-06-24','09:30','Rafael Gomes',    '(11) 99654-0001','Corte Masculino',   30, 45, 'Carlos Mendes',    'completed'),
  mk('b022','2026-06-24','10:15','Bruno Costa',     '(11) 95432-4567','Corte Feminino',    60, 65, 'Carlos Mendes',    'completed'),
  mk('b023','2026-06-24','14:00','Rodrigo Ferreira','(11) 88765-1234','Corte Feminino',    60, 65, 'Carlos Mendes',    'confirmed'),
  mk('b024','2026-06-24','15:30','Rafael Gomes',    '(11) 99654-0001','Hidratação Capilar',60, 90, 'Carlos Mendes',    'confirmed'),

  mk('b025','2026-06-24','10:00','Camila Torres',   '(11) 98765-1234','Limpeza de Pele',   60,120, 'Rafaela Oliveira', 'completed'),
  mk('b026','2026-06-24','13:00','Fernanda Lima',   '(11) 97654-2345','Design de Sobrancelha',30,30,'Rafaela Oliveira','cancelled', 'Cliente cancelou por telefone'),
  mk('b027','2026-06-24','14:30','Isabela Nunes',   '(11) 94321-5678','Design de Sobrancelha',30,30,'Rafaela Oliveira','confirmed'),
  mk('b028','2026-06-24','15:30','Patricia Alves',  '(11) 92109-7890','Limpeza de Pele',   60,120, 'Rafaela Oliveira', 'confirmed'),

  // ── 2026-06-25 (amanhã) ──────────────────────────────────────────────────
  mk('c001','2026-06-25','09:00','Camila Torres',   '(11) 98765-1234','Escova Progressiva',180,220,'Lena Santos',      'confirmed'),
  mk('c002','2026-06-25','09:00','Diego Santos',    '(11) 96543-3456','Corte + Barba',     60, 65, 'João Ferreira',    'confirmed'),
  mk('c003','2026-06-25','10:30','Rafael Gomes',    '(11) 99654-0001','Corte Masculino',   30, 45, 'João Ferreira',    'pending'),
  mk('c004','2026-06-25','09:00','Amanda Ribeiro',  '(11) 91098-8901','Coloração Completa',120,180,'Lisa Kim',         'confirmed'),
  mk('c005','2026-06-25','09:00','Juliana Castro',  '(11) 93210-6789','Manicure',          45, 40, 'Ana Costa',        'confirmed'),
  mk('c006','2026-06-25','10:00','Patricia Alves',  '(11) 92109-7890','Pedicure',          45, 45, 'Ana Costa',        'pending'),
  mk('c007','2026-06-25','14:00','Thiago Pereira',  '(11) 90987-9012','Limpeza de Pele',   60,120, 'Rafaela Oliveira', 'confirmed'),

  // ── 2026-06-26 (sexta) ───────────────────────────────────────────────────
  mk('d001','2026-06-26','09:00','Fernanda Lima',   '(11) 97654-2345','Mechas / Balayage',150,280, 'Lisa Kim',         'confirmed'),
  mk('d002','2026-06-26','09:00','Bruno Costa',     '(11) 95432-4567','Corte + Barba',     60, 65, 'João Ferreira',    'confirmed'),
  mk('d003','2026-06-26','10:30','Marcos Oliveira', '(11) 89876-0123','Barba',             30, 35, 'João Ferreira',    'pending'),
  mk('d004','2026-06-26','09:00','Isabela Nunes',   '(11) 94321-5678','Manicure',          45, 40, 'Ana Costa',        'confirmed'),
  mk('d005','2026-06-26','10:00','Camila Torres',   '(11) 98765-1234','Pedicure',          45, 45, 'Ana Costa',        'confirmed'),

  // ── 2026-06-27 (sábado) ──────────────────────────────────────────────────
  mk('e001','2026-06-27','09:30','Rafael Gomes',    '(11) 99654-0001','Corte Masculino',   30, 45, 'Carlos Mendes',    'confirmed'),
  mk('e002','2026-06-27','10:30','Diego Santos',    '(11) 96543-3456','Corte + Barba',     60, 65, 'João Ferreira',    'confirmed'),
  mk('e003','2026-06-27','09:00','Juliana Castro',  '(11) 93210-6789','Escova',            45, 55, 'Lena Santos',      'pending'),
  mk('e004','2026-06-27','10:30','Amanda Ribeiro',  '(11) 91098-8901','Hidratação Capilar',60, 90, 'Lena Santos',      'pending'),
]
