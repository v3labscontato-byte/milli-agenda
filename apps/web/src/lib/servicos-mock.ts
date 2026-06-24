// ─── Types ────────────────────────────────────────────────────────────────────

export type ServicoCategory = 'Cabelo' | 'Barba' | 'Unhas' | 'Estética' | 'Sobrancelha'
export type ServicoStatus = 'active' | 'inactive'

export interface MonthlyBooking {
  month: string
  bookings: number
  revenue: number
}

export interface Servico {
  id: string
  name: string
  category: ServicoCategory
  description: string
  duration: number          // minutos
  price: number             // R$
  status: ServicoStatus
  professionals: string[]   // nomes
  bookingsThisMonth: number
  bookingsTotal: number
  revenueThisMonth: number
  revenueTotal: number
  monthlyData: MonthlyBooking[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

export function formatBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function kpiStats(servicos: Servico[]) {
  const ativos = servicos.filter((s) => s.status === 'active')
  const precos = ativos.map((s) => s.price)
  const avgPrice = precos.length > 0 ? precos.reduce((a, b) => a + b, 0) / precos.length : 0
  const top = [...servicos].sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth)[0]
  return {
    total: servicos.length,
    ativos: ativos.length,
    avgPrice: Math.round(avgPrice * 100) / 100,
    topServico: top ?? null,
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_SERVICOS: Servico[] = [
  {
    id: 's1', name: 'Corte Feminino', category: 'Cabelo',
    description: 'Corte e finalização para cabelos femininos de qualquer comprimento e tipo.',
    duration: 60, price: 65, status: 'active',
    professionals: ['Lena Santos', 'Carlos Mendes'],
    bookingsThisMonth: 44, bookingsTotal: 820, revenueThisMonth: 2860, revenueTotal: 53300,
    monthlyData: [
      { month: 'Jan', bookings: 38, revenue: 2470 },
      { month: 'Fev', bookings: 34, revenue: 2210 },
      { month: 'Mar', bookings: 42, revenue: 2730 },
      { month: 'Abr', bookings: 39, revenue: 2535 },
      { month: 'Mai', bookings: 44, revenue: 2860 },
      { month: 'Jun', bookings: 24, revenue: 1560 },
    ],
  },
  {
    id: 's2', name: 'Corte Masculino', category: 'Cabelo',
    description: 'Corte masculino moderno com acabamento à navalha.',
    duration: 30, price: 45, status: 'active',
    professionals: ['João Ferreira', 'Carlos Mendes'],
    bookingsThisMonth: 38, bookingsTotal: 610, revenueThisMonth: 1710, revenueTotal: 27450,
    monthlyData: [
      { month: 'Jan', bookings: 32, revenue: 1440 },
      { month: 'Fev', bookings: 28, revenue: 1260 },
      { month: 'Mar', bookings: 40, revenue: 1800 },
      { month: 'Abr', bookings: 35, revenue: 1575 },
      { month: 'Mai', bookings: 38, revenue: 1710 },
      { month: 'Jun', bookings: 20, revenue: 900 },
    ],
  },
  {
    id: 's3', name: 'Escova', category: 'Cabelo',
    description: 'Escova modeladora com secagem profissional e finalização com produtos premium.',
    duration: 45, price: 55, status: 'active',
    professionals: ['Lena Santos', 'Carlos Mendes'],
    bookingsThisMonth: 28, bookingsTotal: 510, revenueThisMonth: 1540, revenueTotal: 28050,
    monthlyData: [
      { month: 'Jan', bookings: 24, revenue: 1320 },
      { month: 'Fev', bookings: 20, revenue: 1100 },
      { month: 'Mar', bookings: 30, revenue: 1650 },
      { month: 'Abr', bookings: 26, revenue: 1430 },
      { month: 'Mai', bookings: 28, revenue: 1540 },
      { month: 'Jun', bookings: 14, revenue: 770 },
    ],
  },
  {
    id: 's4', name: 'Escova Progressiva', category: 'Cabelo',
    description: 'Alisamento progressivo com fórmula livre de formol. Durabilidade de até 4 meses.',
    duration: 180, price: 220, status: 'active',
    professionals: ['Lena Santos', 'Carlos Mendes'],
    bookingsThisMonth: 12, bookingsTotal: 195, revenueThisMonth: 2640, revenueTotal: 42900,
    monthlyData: [
      { month: 'Jan', bookings: 10, revenue: 2200 },
      { month: 'Fev', bookings: 9, revenue: 1980 },
      { month: 'Mar', bookings: 14, revenue: 3080 },
      { month: 'Abr', bookings: 11, revenue: 2420 },
      { month: 'Mai', bookings: 12, revenue: 2640 },
      { month: 'Jun', bookings: 7, revenue: 1540 },
    ],
  },
  {
    id: 's5', name: 'Coloração Completa', category: 'Cabelo',
    description: 'Coloração total dos fios com tintas profissionais, cobrindo raiz até pontas.',
    duration: 120, price: 180, status: 'active',
    professionals: ['Lisa Kim', 'Bruno Alves'],
    bookingsThisMonth: 18, bookingsTotal: 280, revenueThisMonth: 3240, revenueTotal: 50400,
    monthlyData: [
      { month: 'Jan', bookings: 15, revenue: 2700 },
      { month: 'Fev', bookings: 16, revenue: 2880 },
      { month: 'Mar', bookings: 20, revenue: 3600 },
      { month: 'Abr', bookings: 17, revenue: 3060 },
      { month: 'Mai', bookings: 18, revenue: 3240 },
      { month: 'Jun', bookings: 10, revenue: 1800 },
    ],
  },
  {
    id: 's6', name: 'Mechas / Balayage', category: 'Cabelo',
    description: 'Técnica de iluminação manual para efeito natural e degradê. Mechas tradicionais ou balayage.',
    duration: 150, price: 280, status: 'active',
    professionals: ['Lisa Kim'],
    bookingsThisMonth: 14, bookingsTotal: 198, revenueThisMonth: 3920, revenueTotal: 55440,
    monthlyData: [
      { month: 'Jan', bookings: 12, revenue: 3360 },
      { month: 'Fev', bookings: 13, revenue: 3640 },
      { month: 'Mar', bookings: 16, revenue: 4480 },
      { month: 'Abr', bookings: 14, revenue: 3920 },
      { month: 'Mai', bookings: 14, revenue: 3920 },
      { month: 'Jun', bookings: 8, revenue: 2240 },
    ],
  },
  {
    id: 's7', name: 'Hidratação Capilar', category: 'Cabelo',
    description: 'Tratamento intensivo com máscara de hidratação profissional e selagem dos fios.',
    duration: 60, price: 90, status: 'active',
    professionals: ['Lena Santos', 'Lisa Kim', 'Carlos Mendes'],
    bookingsThisMonth: 22, bookingsTotal: 380, revenueThisMonth: 1980, revenueTotal: 34200,
    monthlyData: [
      { month: 'Jan', bookings: 18, revenue: 1620 },
      { month: 'Fev', bookings: 15, revenue: 1350 },
      { month: 'Mar', bookings: 24, revenue: 2160 },
      { month: 'Abr', bookings: 20, revenue: 1800 },
      { month: 'Mai', bookings: 22, revenue: 1980 },
      { month: 'Jun', bookings: 12, revenue: 1080 },
    ],
  },
  {
    id: 's8', name: 'Barba', category: 'Barba',
    description: 'Aparar e modelar a barba com tesoura e navalha, com finalização com produtos específicos.',
    duration: 30, price: 35, status: 'active',
    professionals: ['João Ferreira'],
    bookingsThisMonth: 32, bookingsTotal: 520, revenueThisMonth: 1120, revenueTotal: 18200,
    monthlyData: [
      { month: 'Jan', bookings: 28, revenue: 980 },
      { month: 'Fev', bookings: 24, revenue: 840 },
      { month: 'Mar', bookings: 35, revenue: 1225 },
      { month: 'Abr', bookings: 30, revenue: 1050 },
      { month: 'Mai', bookings: 32, revenue: 1120 },
      { month: 'Jun', bookings: 18, revenue: 630 },
    ],
  },
  {
    id: 's9', name: 'Corte + Barba', category: 'Barba',
    description: 'Combo completo: corte masculino e modelagem da barba com navalha.',
    duration: 60, price: 65, status: 'active',
    professionals: ['João Ferreira'],
    bookingsThisMonth: 20, bookingsTotal: 310, revenueThisMonth: 1300, revenueTotal: 20150,
    monthlyData: [
      { month: 'Jan', bookings: 17, revenue: 1105 },
      { month: 'Fev', bookings: 14, revenue: 910 },
      { month: 'Mar', bookings: 22, revenue: 1430 },
      { month: 'Abr', bookings: 18, revenue: 1170 },
      { month: 'Mai', bookings: 20, revenue: 1300 },
      { month: 'Jun', bookings: 11, revenue: 715 },
    ],
  },
  {
    id: 's10', name: 'Manicure', category: 'Unhas',
    description: 'Cuidado completo das unhas das mãos com lixamento, cutícula e esmaltação.',
    duration: 45, price: 40, status: 'active',
    professionals: ['Ana Costa'],
    bookingsThisMonth: 48, bookingsTotal: 740, revenueThisMonth: 1920, revenueTotal: 29600,
    monthlyData: [
      { month: 'Jan', bookings: 40, revenue: 1600 },
      { month: 'Fev', bookings: 36, revenue: 1440 },
      { month: 'Mar', bookings: 52, revenue: 2080 },
      { month: 'Abr', bookings: 44, revenue: 1760 },
      { month: 'Mai', bookings: 48, revenue: 1920 },
      { month: 'Jun', bookings: 26, revenue: 1040 },
    ],
  },
  {
    id: 's11', name: 'Pedicure', category: 'Unhas',
    description: 'Tratamento completo para os pés, incluindo calosidade, cutícula e esmaltação.',
    duration: 45, price: 45, status: 'active',
    professionals: ['Ana Costa'],
    bookingsThisMonth: 30, bookingsTotal: 490, revenueThisMonth: 1350, revenueTotal: 22050,
    monthlyData: [
      { month: 'Jan', bookings: 26, revenue: 1170 },
      { month: 'Fev', bookings: 22, revenue: 990 },
      { month: 'Mar', bookings: 32, revenue: 1440 },
      { month: 'Abr', bookings: 28, revenue: 1260 },
      { month: 'Mai', bookings: 30, revenue: 1350 },
      { month: 'Jun', bookings: 16, revenue: 720 },
    ],
  },
  {
    id: 's12', name: 'Esmaltação em Gel', category: 'Unhas',
    description: 'Aplicação de esmalte em gel com durabilidade de até 3 semanas.',
    duration: 60, price: 25, status: 'active',
    professionals: ['Ana Costa', 'Mariana Ribeiro'],
    bookingsThisMonth: 35, bookingsTotal: 480, revenueThisMonth: 875, revenueTotal: 12000,
    monthlyData: [
      { month: 'Jan', bookings: 30, revenue: 750 },
      { month: 'Fev', bookings: 26, revenue: 650 },
      { month: 'Mar', bookings: 38, revenue: 950 },
      { month: 'Abr', bookings: 32, revenue: 800 },
      { month: 'Mai', bookings: 35, revenue: 875 },
      { month: 'Jun', bookings: 18, revenue: 450 },
    ],
  },
  {
    id: 's13', name: 'Limpeza de Pele', category: 'Estética',
    description: 'Limpeza facial profunda com extração de cravos e hidratação intensiva.',
    duration: 60, price: 120, status: 'active',
    professionals: ['Rafaela Oliveira'],
    bookingsThisMonth: 8, bookingsTotal: 195, revenueThisMonth: 960, revenueTotal: 23400,
    monthlyData: [
      { month: 'Jan', bookings: 22, revenue: 2640 },
      { month: 'Fev', bookings: 18, revenue: 2160 },
      { month: 'Mar', bookings: 25, revenue: 3000 },
      { month: 'Abr', bookings: 20, revenue: 2400 },
      { month: 'Mai', bookings: 10, revenue: 1200 },
      { month: 'Jun', bookings: 8, revenue: 960 },
    ],
  },
  {
    id: 's14', name: 'Design de Sobrancelha', category: 'Sobrancelha',
    description: 'Modelagem e design personalizado de sobrancelha com pinça e linha.',
    duration: 30, price: 30, status: 'active',
    professionals: ['Rafaela Oliveira'],
    bookingsThisMonth: 10, bookingsTotal: 280, revenueThisMonth: 300, revenueTotal: 8400,
    monthlyData: [
      { month: 'Jan', bookings: 28, revenue: 840 },
      { month: 'Fev', bookings: 22, revenue: 660 },
      { month: 'Mar', bookings: 30, revenue: 900 },
      { month: 'Abr', bookings: 24, revenue: 720 },
      { month: 'Mai', bookings: 12, revenue: 360 },
      { month: 'Jun', bookings: 10, revenue: 300 },
    ],
  },
  {
    id: 's15', name: 'Extensão de Cílios', category: 'Estética',
    description: 'Alongamento de cílios com fios de seda, volume natural ou dramático.',
    duration: 120, price: 200, status: 'inactive',
    professionals: ['Rafaela Oliveira'],
    bookingsThisMonth: 0, bookingsTotal: 82, revenueThisMonth: 0, revenueTotal: 16400,
    monthlyData: [
      { month: 'Jan', bookings: 16, revenue: 3200 },
      { month: 'Fev', bookings: 12, revenue: 2400 },
      { month: 'Mar', bookings: 18, revenue: 3600 },
      { month: 'Abr', bookings: 14, revenue: 2800 },
      { month: 'Mai', bookings: 0, revenue: 0 },
      { month: 'Jun', bookings: 0, revenue: 0 },
    ],
  },
]
