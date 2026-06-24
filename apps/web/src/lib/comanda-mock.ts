// ─── Types ────────────────────────────────────────────────────────────────────

export type ComandaStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED'
export type ItemCategory = 'service' | 'product' | 'fee' | 'adjustment'
export type DiscountType = 'amount' | 'percent'
export type ComandasFilter = 'ALL' | 'OPEN_IN_PROGRESS' | ComandaStatus

export interface ComandaItem {
  id: string
  name: string
  category: ItemCategory
  quantity: number
  unitPrice: number
}

export interface Discount {
  type: DiscountType
  value: number
}

export interface ComandaDeposit {
  amount: number
  method: string
  paidAt: string   // 'DD/MM' display string
}

export interface Comanda {
  id: string
  number: string
  clientName: string
  service: string        // primary service label for list display
  professional: string
  date: Date             // date of the appointment/procedure
  startTime: string      // 'HH:MM'
  endTime: string        // 'HH:MM'
  items: ComandaItem[]
  discount: Discount | null
  deposit?: ComandaDeposit | null
  status: ComandaStatus
  openedAt: Date
  cancelReason?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000)
}

function dayAt(offsetDays: number, hh: number, mm = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  d.setHours(hh, mm, 0, 0)
  return d
}

// Format day offset as 'DD/MM' for deposit paidAt strings
function fmtDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextNumber(existing: Comanda[]): string {
  const max = existing.reduce((m, c) => Math.max(m, parseInt(c.number, 10)), 0)
  return String(max + 1).padStart(4, '0')
}

export const MOCK_COMANDAS: Comanda[] = [
  // ── OPEN (today) ──────────────────────────────────────────────────────────
  {
    id: 'c-001',
    number: '0041',
    clientName: 'Carla Dias',
    service: 'Manicure',
    professional: 'Ana Costa',
    date: dayAt(0, 9),
    startTime: '09:00',
    endTime: '09:45',
    status: 'OPEN',
    openedAt: ago(8),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-001', name: 'Manicure', category: 'service', quantity: 1, unitPrice: 40 },
    ],
  },
  {
    id: 'c-002',
    number: '0042',
    clientName: 'Thiago Santos',
    service: 'Corte Masculino',
    professional: 'João Silva',
    date: dayAt(0, 10, 30),
    startTime: '10:30',
    endTime: '11:15',
    status: 'OPEN',
    openedAt: ago(3),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-002', name: 'Corte Masculino', category: 'service', quantity: 1, unitPrice: 45 },
    ],
  },

  // ── IN_PROGRESS (today) ───────────────────────────────────────────────────
  {
    id: 'c-003',
    number: '0043',
    clientName: 'Paula Mendes',
    service: 'Coloração',
    professional: 'Lena',
    date: dayAt(0, 9, 30),
    startTime: '09:30',
    endTime: '11:30',
    status: 'IN_PROGRESS',
    openedAt: ago(87),
    discount: null,
    deposit: { amount: 50, method: 'PIX', paidAt: fmtDate(2) },
    items: [
      { id: 'i-003', name: 'Coloração',          category: 'service', quantity: 1, unitPrice: 180 },
      { id: 'i-004', name: 'Hidratação Capilar', category: 'service', quantity: 1, unitPrice: 90  },
    ],
  },
  {
    id: 'c-004',
    number: '0044',
    clientName: 'Beatriz Oliveira',
    service: 'Escova Progressiva',
    professional: 'Lisa Kim',
    date: dayAt(0, 11),
    startTime: '11:00',
    endTime: '13:00',
    status: 'IN_PROGRESS',
    openedAt: ago(45),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-005', name: 'Escova Progressiva', category: 'service', quantity: 1, unitPrice: 220 },
      { id: 'i-006', name: 'Óleo de Argan',      category: 'product', quantity: 1, unitPrice: 45  },
    ],
  },

  // ── AWAITING_PAYMENT (yesterday) ──────────────────────────────────────────
  {
    id: 'c-005',
    number: '0045',
    clientName: 'Roberto Lima',
    service: 'Corte + Barba',
    professional: 'João Silva',
    date: dayAt(1, 14),
    startTime: '14:00',
    endTime: '15:00',
    status: 'AWAITING_PAYMENT',
    openedAt: ago(65),
    discount: { type: 'percent', value: 10 },
    deposit: null,
    items: [
      { id: 'i-007', name: 'Corte Masculino', category: 'service', quantity: 1, unitPrice: 45 },
      { id: 'i-008', name: 'Barba',           category: 'service', quantity: 1, unitPrice: 35 },
    ],
  },
  {
    id: 'c-006',
    number: '0046',
    clientName: 'Juliana Costa',
    service: 'Pedicure + Manicure',
    professional: 'Ana Costa',
    date: dayAt(1, 10),
    startTime: '10:00',
    endTime: '11:45',
    status: 'AWAITING_PAYMENT',
    openedAt: ago(110),
    discount: { type: 'amount', value: 10 },
    deposit: { amount: 25, method: 'PIX', paidAt: fmtDate(3) },
    items: [
      { id: 'i-009', name: 'Pedicure',       category: 'service', quantity: 1, unitPrice: 45 },
      { id: 'i-010', name: 'Manicure',       category: 'service', quantity: 1, unitPrice: 40 },
      { id: 'i-011', name: 'Esmaltação Gel', category: 'service', quantity: 2, unitPrice: 25 },
    ],
  },

  // ── PAID (2 days ago) ─────────────────────────────────────────────────────
  {
    id: 'c-007',
    number: '0047',
    clientName: 'Maria Silva',
    service: 'Hidratação Capilar',
    professional: 'Lena',
    date: dayAt(2, 9),
    startTime: '09:00',
    endTime: '10:30',
    status: 'PAID',
    openedAt: ago(150),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-012', name: 'Hidratação Capilar', category: 'service', quantity: 1, unitPrice: 90 },
      { id: 'i-013', name: 'Máscara Capilar',    category: 'product', quantity: 1, unitPrice: 55 },
    ],
  },

  // ── CANCELLED (2 days ago) ────────────────────────────────────────────────
  {
    id: 'c-008',
    number: '0048',
    clientName: 'Lucas Ferreira',
    service: 'Barba',
    professional: 'João Silva',
    date: dayAt(2, 15),
    startTime: '15:00',
    endTime: '15:30',
    status: 'CANCELLED',
    openedAt: ago(95),
    discount: null,
    deposit: null,
    cancelReason: 'Cliente desistiu no momento do atendimento.',
    items: [
      { id: 'i-014', name: 'Barba', category: 'service', quantity: 1, unitPrice: 35 },
    ],
  },

  // ── OPEN (today, continued) ───────────────────────────────────────────────
  {
    id: 'c-009',
    number: '0049',
    clientName: 'Marco Souza',
    service: 'Corte Masculino',
    professional: 'Carlos Mendes',
    date: dayAt(0, 9, 30),
    startTime: '09:30',
    endTime: '10:00',
    status: 'OPEN',
    openedAt: ago(25),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-015', name: 'Corte Masculino', category: 'service', quantity: 1, unitPrice: 45 },
    ],
  },
  {
    id: 'c-010',
    number: '0050',
    clientName: 'Larissa Tavares',
    service: 'Pedicure',
    professional: 'Ana Costa',
    date: dayAt(0, 11, 30),
    startTime: '11:30',
    endTime: '12:15',
    status: 'OPEN',
    openedAt: ago(15),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-016', name: 'Pedicure',       category: 'service', quantity: 1, unitPrice: 45 },
      { id: 'i-017', name: 'Esmaltação Gel', category: 'service', quantity: 1, unitPrice: 25 },
    ],
  },

  // ── IN_PROGRESS (today, continued) ───────────────────────────────────────
  {
    id: 'c-011',
    number: '0051',
    clientName: 'Fernanda Alves',
    service: 'Escova',
    professional: 'Lisa Kim',
    date: dayAt(0, 10),
    startTime: '10:00',
    endTime: '10:45',
    status: 'IN_PROGRESS',
    openedAt: ago(55),
    discount: { type: 'percent', value: 5 },
    deposit: null,
    items: [
      { id: 'i-018', name: 'Escova',            category: 'service', quantity: 1, unitPrice: 55 },
      { id: 'i-019', name: 'Tratamento Brilho', category: 'product', quantity: 1, unitPrice: 30 },
    ],
  },
  {
    id: 'c-012',
    number: '0052',
    clientName: 'Eduardo Campos',
    service: 'Hidratação Capilar',
    professional: 'Lena Santos',
    date: dayAt(0, 12),
    startTime: '12:00',
    endTime: '13:00',
    status: 'IN_PROGRESS',
    openedAt: ago(10),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-020', name: 'Hidratação Capilar', category: 'service', quantity: 1, unitPrice: 90 },
    ],
  },

  // ── AWAITING_PAYMENT (today) ──────────────────────────────────────────────
  {
    id: 'c-013',
    number: '0053',
    clientName: 'Isabela Ramos',
    service: 'Manicure + Esmaltação',
    professional: 'Ana Costa',
    date: dayAt(0, 8, 30),
    startTime: '08:30',
    endTime: '09:45',
    status: 'AWAITING_PAYMENT',
    openedAt: ago(120),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-021', name: 'Manicure',       category: 'service', quantity: 1, unitPrice: 40 },
      { id: 'i-022', name: 'Esmaltação Gel', category: 'service', quantity: 2, unitPrice: 25 },
    ],
  },

  // ── PAID (last few days) ──────────────────────────────────────────────────
  {
    id: 'c-014',
    number: '0054',
    clientName: 'Samira Nunes',
    service: 'Coloração + Hidratação',
    professional: 'Lisa Kim',
    date: dayAt(2, 10),
    startTime: '10:00',
    endTime: '12:30',
    status: 'PAID',
    openedAt: ago(48 * 60 + 20),
    discount: { type: 'amount', value: 20 },
    deposit: { amount: 80, method: 'PIX', paidAt: fmtDate(3) },
    items: [
      { id: 'i-023', name: 'Coloração Completa',  category: 'service', quantity: 1, unitPrice: 180 },
      { id: 'i-024', name: 'Hidratação Capilar',  category: 'service', quantity: 1, unitPrice: 90  },
      { id: 'i-025', name: 'Protetor Térmico',    category: 'product', quantity: 1, unitPrice: 38  },
    ],
  },
  {
    id: 'c-015',
    number: '0055',
    clientName: 'Vinícius Prado',
    service: 'Corte + Barba',
    professional: 'João Ferreira',
    date: dayAt(1, 16),
    startTime: '16:00',
    endTime: '17:00',
    status: 'PAID',
    openedAt: ago(26 * 60),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-026', name: 'Corte Masculino', category: 'service', quantity: 1, unitPrice: 45 },
      { id: 'i-027', name: 'Barba',           category: 'service', quantity: 1, unitPrice: 35 },
    ],
  },
  {
    id: 'c-016',
    number: '0056',
    clientName: 'Aline Barbosa',
    service: 'Design de Sobrancelha',
    professional: 'Rafaela Oliveira',
    date: dayAt(1, 9),
    startTime: '09:00',
    endTime: '09:30',
    status: 'PAID',
    openedAt: ago(30 * 60),
    discount: null,
    deposit: null,
    items: [
      { id: 'i-028', name: 'Design de Sobrancelha', category: 'service', quantity: 1, unitPrice: 30 },
    ],
  },

  // ── CANCELLED (more) ─────────────────────────────────────────────────────
  {
    id: 'c-017',
    number: '0057',
    clientName: 'Fábio Rodrigues',
    service: 'Escova Progressiva',
    professional: 'Lena Santos',
    date: dayAt(1, 11),
    startTime: '11:00',
    endTime: '14:00',
    status: 'CANCELLED',
    openedAt: ago(27 * 60),
    discount: null,
    deposit: { amount: 50, method: 'Cartão', paidAt: fmtDate(4) },
    cancelReason: 'Reagendado para a próxima semana a pedido do cliente.',
    items: [
      { id: 'i-029', name: 'Escova Progressiva', category: 'service', quantity: 1, unitPrice: 220 },
    ],
  },
]
