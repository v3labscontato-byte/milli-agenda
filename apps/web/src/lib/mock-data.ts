export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_SERVICE'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'

export interface Appointment {
  id: string
  time: string
  endTime: string
  duration: number
  client: string
  clientInitials: string
  service: string
  professional: string
  status: AppointmentStatus
  amount: number
  startedAt?: string
  clientId?: string
  date?: string
}

export interface KpiData {
  label: string
  value: string
  trend: string
  trendUp: boolean | null
}

export const PROFESSIONALS = ['Todos', 'João Silva', 'Lena Costa', 'Ana Paula'] as const
export type Professional = (typeof PROFESSIONALS)[number]

export const mockKpis: KpiData[] = [
  { label: 'Agendamentos Hoje', value: '11',      trend: '+2 vs ontem',     trendUp: true  },
  { label: 'Clientes Atendidos', value: '3',       trend: '27% concluído',   trendUp: null  },
  { label: 'Receita do Dia',     value: 'R$ 680',  trend: '+R$ 120 vs ontem', trendUp: true  },
  { label: 'Ocupação',           value: '73%',     trend: '↑ 8% vs ontem',  trendUp: true  },
]

export const mockAppointments: Appointment[] = [
  {
    id: '1', time: '08:00', endTime: '09:00', duration: 60,
    client: 'Maria Silva', clientInitials: 'MS',
    service: 'Escova', professional: 'Lena Costa',
    status: 'COMPLETED', amount: 80,
  },
  {
    id: '2', time: '08:30', endTime: '09:00', duration: 30,
    client: 'Carlos Santos', clientInitials: 'CS',
    service: 'Barba', professional: 'João Silva',
    status: 'COMPLETED', amount: 40,
  },
  {
    id: '3', time: '09:00', endTime: '09:45', duration: 45,
    client: 'Ana Costa', clientInitials: 'AC',
    service: 'Manicure', professional: 'Ana Paula',
    status: 'COMPLETED', amount: 40,
  },
  {
    id: '4', time: '09:30', endTime: '11:30', duration: 120,
    client: 'Paula Mendes', clientInitials: 'PM',
    service: 'Coloração', professional: 'Lena Costa',
    status: 'IN_SERVICE', amount: 200, startedAt: '09:35',
  },
  {
    id: '5', time: '10:00', endTime: '10:45', duration: 45,
    client: 'Roberto Lima', clientInitials: 'RL',
    service: 'Corte', professional: 'João Silva',
    status: 'AWAITING_PAYMENT', amount: 65,
  },
  {
    id: '6', time: '10:30', endTime: '11:30', duration: 60,
    client: 'Juliana Ferreira', clientInitials: 'JF',
    service: 'Hidratação', professional: 'Lena Costa',
    status: 'CONFIRMED', amount: 100,
  },
  {
    id: '7', time: '11:00', endTime: '11:30', duration: 30,
    client: 'Marcos Oliveira', clientInitials: 'MO',
    service: 'Barba', professional: 'João Silva',
    status: 'CONFIRMED', amount: 40,
  },
  {
    id: '8', time: '11:30', endTime: '12:30', duration: 60,
    client: 'Fernanda Souza', clientInitials: 'FS',
    service: 'Pedicure', professional: 'Ana Paula',
    status: 'SCHEDULED', amount: 50,
  },
  {
    id: '9', time: '12:00', endTime: '12:45', duration: 45,
    client: 'Lucas Pereira', clientInitials: 'LP',
    service: 'Corte', professional: 'João Silva',
    status: 'SCHEDULED', amount: 65,
  },
  {
    id: '10', time: '13:00', endTime: '14:00', duration: 60,
    client: 'Beatriz Santos', clientInitials: 'BS',
    service: 'Escova', professional: 'Lena Costa',
    status: 'SCHEDULED', amount: 80,
  },
  {
    id: '11', time: '14:00', endTime: '15:00', duration: 60,
    client: 'Rodrigo Alves', clientInitials: 'RA',
    service: 'Corte + Barba', professional: 'João Silva',
    status: 'SCHEDULED', amount: 100,
  },
]
