// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'voucher'
export type TransactionStatus = 'PAID' | 'PENDING'
export type ComissaoStatus = 'PENDING' | 'PAID'
export type PeriodFilter = 'today' | 'week' | 'month' | 'last30' | 'custom'
export type MetaTipo = 'diaria' | 'semanal' | 'mensal'

export interface Transaction {
  id: string
  date: Date
  time: string
  clientName: string
  service: string
  professional: string
  method: PaymentMethod
  value: number
  status: TransactionStatus
}

export interface Comissao {
  id: string
  profissionalName: string
  initials: string
  avatarBg: string
  atendimentos: number
  receita: number
  pctComissao: number
  comissaoValue: number
  tipoPagamento: 'mensal' | 'quinzenal'
  diaPagamento: number
  periodoRef: string
  diasAtraso: number
  status: ComissaoStatus
  paidAt?: string
}

export interface Inadimplencia {
  id: string
  dateLabel: string
  clientName: string
  service: string
  value: number
  daysOverdue: number
}

export interface FluxoCaixaEntry {
  date: Date
  dateLabel: string
  entradas: number
  saidas: number
  saldoDia: number
  saldoAcum: number
}

export interface WeeklyRevenue {
  semana: string
  servicos: number
  produtos: number
  outros: number
}

export interface FaturamentoMensal {
  mes: string
  servicos: number
  produtos: number
  outros: number
}

export interface ProcedimentoRanking {
  rank: number
  nome: string
  qtd: number
  receita: number
  pct: number
}

export interface ProfissionalRanking {
  rank: number
  nome: string
  initials: string
  avatarBg: string
  atendimentos: number
  receita: number
  avaliacao: number
}

export interface ProdutoRanking {
  rank: number
  nome: string
  qtd: number
  receita: number
}

export interface MetodoDistrib {
  id: string
  label: string
  emoji: string
  value: number
  color: string
}

export interface FinanceiroKpis {
  receitaMes: number
  receitaMesTrend: string
  receitaMesTrendUp: boolean
  receitaHoje: number
  receitaHojeTrend: string
  receitaHojeTrendUp: boolean
  aReceber: number
  pendingCount: number
  taxaRecebimento: number
  taxaMeta: number
  taxaTrendUp: boolean
  ticketMedio: number
  ticketTrend: string
  ticketTrendUp: boolean
  receitaBruta: number
  despesas: number
  lucroLiquido: number
  margem: number
  metaAting: number
  inadimplenciaPct: number
  totalEntradas: number
  saldoCaixa: number
  receitaSemana: number
  metaDiaria: number
  metaSemanal: number
  metaMensal: number
}

export interface Meta {
  id: string
  tipo: MetaTipo
  valor: number
  atual: number
  dataInicio: string
  dataFim: string
  ativa: boolean
}

export interface FluxoLancamento {
  id: string
  date: string
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string
  valor: number
}

export interface PlanoConta {
  id: string
  nome: string
  categoria: string
  tipo: 'fixa' | 'variavel'
  valor: number
  diaPagamento: number
  pagoMesAtual: boolean
  recorrente: boolean
  ativa: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayAt(offsetDays: number, hh: number, mm = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  d.setHours(hh, mm, 0, 0)
  return d
}

let _txId = 0
function mk(
  offset: number, time: string, client: string, service: string,
  prof: string, method: PaymentMethod, value: number, status: TransactionStatus,
): Transaction {
  const [hh, mm] = time.split(':').map(Number)
  return { id: `tx-${++_txId}`, date: dayAt(offset, hh, mm), time, clientName: client, service, professional: prof, method, value, status }
}

function calcDiasAtraso(status: ComissaoStatus, tipoPagamento: 'mensal' | 'quinzenal', diaPagamento: number): number {
  if (status === 'PAID') return 0
  const d = new Date().getDate()
  if (tipoPagamento === 'mensal') return d > diaPagamento ? d - diaPagamento : 0
  const dueDay2 = diaPagamento + 15
  if (d > dueDay2) return d - dueDay2
  if (d > diaPagamento) return d - diaPagamento
  return 0
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  mk(0, '09:00', 'Maria Silva',       'Escova',             'Lena Santos', 'pix',      80,  'PAID'),
  mk(0, '10:15', 'Carlos Santos',     'Barba',              'João Silva',  'dinheiro', 40,  'PAID'),
  mk(0, '10:30', 'Paula Mendes',      'Coloração',          'Lena Santos', 'credito',  200, 'PAID'),
  mk(0, '11:00', 'Juliana Ferreira',  'Hidratação Capilar', 'Lisa Kim',    'pix',      100, 'PAID'),
  mk(0, '11:30', 'Roberto Lima',      'Corte + Barba',      'João Silva',  'debito',   80,  'PAID'),
  mk(0, '13:00', 'Beatriz Oliveira',  'Escova',             'Lisa Kim',    'pix',      142, 'PAID'),
  mk(0, '14:00', 'Ana Lima',          'Manicure',           'Ana Costa',   'pix',      40,  'PENDING'),
  mk(0, '15:00', 'Rodrigo Alves',     'Corte Masculino',    'João Silva',  'debito',   45,  'PENDING'),
  mk(1, '16:30', 'Fernanda Souza',    'Pedicure',           'Ana Costa',   'pix',      30,  'PENDING'),
  mk(1, '09:00', 'Lucas Pereira',     'Corte Masculino',    'João Silva',  'credito',  40,  'PENDING'),
  mk(2, '14:00', 'Beatriz Santos',    'Escova',             'Lisa Kim',    'credito',  20,  'PENDING'),
  mk(2, '11:00', 'Marcos Oliveira',   'Barba',              'João Silva',  'dinheiro', 22,  'PENDING'),
  mk(2, '09:30', 'Camila Torres',     'Coloração',          'Lena Santos', 'pix',      280, 'PAID'),
  mk(2, '14:00', 'Diego Souza',       'Corte + Barba',      'João Silva',  'dinheiro', 85,  'PAID'),
  mk(1, '10:00', 'Patricia Lima',     'Escova Progressiva', 'Lisa Kim',    'credito',  320, 'PAID'),
  mk(1, '15:00', 'Eduardo Costa',     'Corte Masculino',    'João Silva',  'pix',      65,  'PAID'),
  mk(3, '10:00', 'Sofia Ramos',       'Coloração + Hidrat.','Lena Santos', 'credito',  380, 'PAID'),
  mk(4, '09:00', 'Bruna Alves',       'Escova Progressiva', 'Lisa Kim',    'pix',      300, 'PAID'),
  mk(5, '11:30', 'Isabel Nunes',      'Coloração',          'Lena Santos', 'credito',  250, 'PAID'),
  mk(5, '14:00', 'Aline Barbosa',     'Design Sobrancelha', 'Ana Costa',   'pix',      30,  'PAID'),
  mk(6, '09:30', 'Renata Costa',      'Hidratação Capilar', 'Lena Santos', 'debito',   180, 'PAID'),
  mk(7, '10:00', 'Victor Moraes',     'Corte + Barba',      'João Silva',  'pix',      80,  'PAID'),
  mk(10,'09:00', 'Tatiane Rocha',     'Coloração Completa', 'Lena Santos', 'credito',  420, 'PAID'),
  mk(11,'10:30', 'Miguel Ferreira',   'Corte Masculino',    'João Silva',  'pix',      65,  'PAID'),
  mk(12,'09:00', 'Gabriela Santos',   'Escova Progressiva', 'Lisa Kim',    'pix',      320, 'PAID'),
  mk(13,'11:30', 'Mariana Lima',      'Hidratação Capilar', 'Lena Santos', 'debito',   180, 'PAID'),
  mk(14,'10:00', 'Amanda Costa',      'Coloração',          'Lena Santos', 'credito',  250, 'PAID'),
  mk(17,'09:00', 'Claudia Oliveira',  'Coloração + Hidrat.','Lena Santos', 'credito',  380, 'PAID'),
  mk(18,'10:00', 'Rafael Souza',      'Barba',              'João Silva',  'dinheiro', 35,  'PAID'),
  mk(19,'09:30', 'Fernanda Lima',     'Escova Progressiva', 'Lisa Kim',    'pix',      280, 'PAID'),
  mk(20,'14:00', 'José Santos',       'Corte Masculino',    'João Silva',  'voucher',  65,  'PAID'),
]

// ─── Comissões ────────────────────────────────────────────────────────────────

export const MOCK_COMISSOES: Comissao[] = [
  {
    id: 'co-1', profissionalName: 'Lena Santos', initials: 'LS', avatarBg: '#7C3AED',
    atendimentos: 48, receita: 4320, pctComissao: 40, comissaoValue: 1728,
    tipoPagamento: 'mensal', diaPagamento: 5, periodoRef: 'Jun/2026',
    diasAtraso: calcDiasAtraso('PENDING', 'mensal', 5),
    status: 'PENDING',
  },
  {
    id: 'co-2', profissionalName: 'João Silva', initials: 'JS', avatarBg: '#2563EB',
    atendimentos: 35, receita: 2100, pctComissao: 35, comissaoValue: 735,
    tipoPagamento: 'quinzenal', diaPagamento: 5, periodoRef: 'Jun/2026',
    diasAtraso: calcDiasAtraso('PENDING', 'quinzenal', 5),
    status: 'PENDING',
  },
  {
    id: 'co-3', profissionalName: 'Lisa Kim', initials: 'LK', avatarBg: '#DB2777',
    atendimentos: 28, receita: 3360, pctComissao: 40, comissaoValue: 1344,
    tipoPagamento: 'mensal', diaPagamento: 5, periodoRef: 'Jun/2026',
    diasAtraso: calcDiasAtraso('PENDING', 'mensal', 5),
    status: 'PENDING',
  },
  {
    id: 'co-4', profissionalName: 'Ana Costa', initials: 'AC', avatarBg: '#16A34A',
    atendimentos: 22, receita: 880, pctComissao: 35, comissaoValue: 308,
    tipoPagamento: 'mensal', diaPagamento: 5, periodoRef: 'Jun/2026',
    diasAtraso: 0, status: 'PAID', paidAt: '20/06',
  },
]

// ─── Inadimplência ────────────────────────────────────────────────────────────

export const MOCK_INADIMPLENCIA: Inadimplencia[] = [
  { id: 'id-1', dateLabel: '15/06', clientName: 'Pedro Alves',  service: 'Coloração', value: 200, daysOverdue: 9  },
  { id: 'id-2', dateLabel: '10/06', clientName: 'Julia Ramos',  service: 'Escova',    value: 80,  daysOverdue: 14 },
  { id: 'id-3', dateLabel: '01/06', clientName: 'Marcos Lima',  service: 'Barba',     value: 40,  daysOverdue: 23 },
]

// ─── Fluxo de Caixa (diário agregado) ────────────────────────────────────────

const DAILY_CASHFLOW: Array<[number, number]> = [
  [680,0],[420,200],[480,0],[565,0],[620,1500],[450,0],[0,0],
  [520,300],[380,0],[620,0],[290,0],[700,0],[580,0],[0,0],
  [370,450],[620,0],[450,0],[710,200],[580,0],[480,0],[0,0],
  [450,1500],[520,0],[642,0],
]

export const MOCK_FLUXO: FluxoCaixaEntry[] = (() => {
  let acc = 0
  return DAILY_CASHFLOW.map(([entradas, saidas], i) => {
    const offset = DAILY_CASHFLOW.length - 1 - i
    const date = dayAt(offset, 0)
    const saldoDia = entradas - saidas
    acc += saldoDia
    return {
      date,
      dateLabel: `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}`,
      entradas, saidas, saldoDia, saldoAcum: acc,
    }
  })
})()

// ─── Lançamentos detalhados ───────────────────────────────────────────────────

export const MOCK_LANCAMENTOS: FluxoLancamento[] = [
  { id:'l01', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração - Paula Mendes',           valor:200  },
  { id:'l02', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Escova - Maria Silva',               valor:80   },
  { id:'l03', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Barba - Carlos Santos',              valor:40   },
  { id:'l04', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Hidratação - Juliana Ferreira',      valor:100  },
  { id:'l05', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Corte + Barba - Roberto Lima',       valor:80   },
  { id:'l06', date:'24/06', tipo:'entrada', categoria:'Serviços',  descricao:'Escova - Beatriz Oliveira',          valor:142  },
  { id:'l07', date:'22/06', tipo:'saida',   categoria:'Aluguel',   descricao:'Aluguel Comercial',                  valor:1500 },
  { id:'l08', date:'22/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração - Camila Torres',          valor:280  },
  { id:'l09', date:'21/06', tipo:'entrada', categoria:'Serviços',  descricao:'Escova Progressiva - Patricia Lima', valor:320  },
  { id:'l10', date:'20/06', tipo:'entrada', categoria:'Serviços',  descricao:'Corte - Eduardo Costa',              valor:65   },
  { id:'l11', date:'15/06', tipo:'saida',   categoria:'Material',  descricao:'Insumos e produtos capilares',       valor:450  },
  { id:'l12', date:'15/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração + Hidrat. - Sofia Ramos',  valor:380  },
  { id:'l13', date:'12/06', tipo:'entrada', categoria:'Serviços',  descricao:'Escova Progressiva - Gabriela Santos',valor:320 },
  { id:'l14', date:'10/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração - Isabel Nunes',           valor:250  },
  { id:'l15', date:'08/06', tipo:'saida',   categoria:'Material',  descricao:'Material de consumo',                valor:300  },
  { id:'l16', date:'08/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração Completa - Tatiane Rocha', valor:420  },
  { id:'l17', date:'05/06', tipo:'saida',   categoria:'Aluguel',   descricao:'Aluguel Comercial',                  valor:1500 },
  { id:'l18', date:'05/06', tipo:'saida',   categoria:'Energia',   descricao:'Conta de Energia Elétrica',          valor:280  },
  { id:'l19', date:'05/06', tipo:'saida',   categoria:'Comissão',  descricao:'Comissão Ana Costa — Maio/2026',     valor:308  },
  { id:'l20', date:'02/06', tipo:'saida',   categoria:'Internet',  descricao:'Internet e Telefone',                valor:150  },
  { id:'l21', date:'01/06', tipo:'entrada', categoria:'Serviços',  descricao:'Coloração - Claudia Oliveira',       valor:380  },
  { id:'l22', date:'01/06', tipo:'entrada', categoria:'Serviços',  descricao:'Escova Progressiva - Fernanda Lima', valor:280  },
]

// ─── Chart data ───────────────────────────────────────────────────────────────

export const RECEITA_SEMANAL: WeeklyRevenue[] = [
  { semana:'S1', servicos:1100, produtos:180, outros:70 },
  { semana:'S2', servicos:1420, produtos:220, outros:90 },
  { semana:'S3', servicos:1580, produtos:195, outros:110 },
  { semana:'S4', servicos:980,  produtos:140, outros:75 },
]

export const FATURAMENTO_MENSAL: FaturamentoMensal[] = [
  { mes:'Jan', servicos:6800, produtos:1200, outros:500 },
  { mes:'Fev', servicos:7400, produtos:1300, outros:500 },
  { mes:'Mar', servicos:8200, produtos:1400, outros:500 },
  { mes:'Abr', servicos:7900, produtos:1400, outros:500 },
  { mes:'Mai', servicos:10000,produtos:1750, outros:550 },
  { mes:'Jun', servicos:9500, produtos:1650, outros:550 },
]

export const METODO_DISTRIBUICAO: MetodoDistrib[] = [
  { id:'pix',      label:'PIX',      emoji:'🔵', value:3708, color:'#16A34A' },
  { id:'credito',  label:'Crédito',  emoji:'💳', value:2060, color:'#7C3AED' },
  { id:'debito',   label:'Débito',   emoji:'💳', value:1236, color:'#2563EB' },
  { id:'dinheiro', label:'Dinheiro', emoji:'💵', value:824,  color:'#D97706' },
  { id:'outros',   label:'Outros',   emoji:'🎫', value:412,  color:'#94A3B8' },
]

// ─── Metas ────────────────────────────────────────────────────────────────────

export const MOCK_METAS: Meta[] = [
  { id:'m1', tipo:'semanal', valor:4000,  atual:3250, dataInicio:'2026-06-23', dataFim:'2026-06-27', ativa:true  },
  { id:'m2', tipo:'mensal',  valor:15000, atual:8240, dataInicio:'2026-06-01', dataFim:'2026-06-30', ativa:true  },
  { id:'m3', tipo:'diaria',  valor:800,   atual:642,  dataInicio:'2026-06-24', dataFim:'2026-06-24', ativa:true  },
  { id:'m4', tipo:'semanal', valor:3500,  atual:3500, dataInicio:'2026-06-16', dataFim:'2026-06-22', ativa:false },
]

// ─── Plano de Contas ─────────────────────────────────────────────────────────

export const MOCK_PLANO_CONTAS: PlanoConta[] = [
  { id:'pc1',  nome:'Aluguel',       categoria:'Moradia',        tipo:'fixa',     valor:1500, diaPagamento:5,  pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc2',  nome:'Energia',       categoria:'Utilidades',     tipo:'fixa',     valor:280,  diaPagamento:10, pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc3',  nome:'Água',          categoria:'Utilidades',     tipo:'fixa',     valor:95,   diaPagamento:10, pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc4',  nome:'Internet',      categoria:'Comunicação',    tipo:'fixa',     valor:150,  diaPagamento:15, pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc5',  nome:'Telefone',      categoria:'Comunicação',    tipo:'fixa',     valor:80,   diaPagamento:15, pagoMesAtual:false, recorrente:true,  ativa:false },
  { id:'pc6',  nome:'Seguro',        categoria:'Proteção',       tipo:'fixa',     valor:220,  diaPagamento:1,  pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc7',  nome:'Sistema (Milli)',categoria:'Tecnologia',    tipo:'fixa',     valor:149,  diaPagamento:24, pagoMesAtual:false, recorrente:true,  ativa:true  },
  { id:'pc8',  nome:'Contabilidade', categoria:'Administrativo', tipo:'fixa',     valor:450,  diaPagamento:20, pagoMesAtual:true,  recorrente:true,  ativa:true  },
  { id:'pc9',  nome:'Comissões',     categoria:'Pessoal',        tipo:'variavel', valor:0,    diaPagamento:5,  pagoMesAtual:false, recorrente:true,  ativa:true  },
  { id:'pc10', nome:'Material',      categoria:'Insumos',        tipo:'variavel', valor:300,  diaPagamento:15, pagoMesAtual:false, recorrente:false, ativa:true  },
  { id:'pc11', nome:'Produtos',      categoria:'Insumos',        tipo:'variavel', valor:180,  diaPagamento:20, pagoMesAtual:false, recorrente:false, ativa:true  },
  { id:'pc12', nome:'Marketing',     categoria:'Vendas',         tipo:'variavel', valor:350,  diaPagamento:28, pagoMesAtual:false, recorrente:true,  ativa:true  },
  { id:'pc13', nome:'Manutenção',    categoria:'Operacional',    tipo:'variavel', valor:200,  diaPagamento:30, pagoMesAtual:false, recorrente:false, ativa:false },
  { id:'pc14', nome:'Impostos',      categoria:'Fiscal',         tipo:'variavel', valor:480,  diaPagamento:31, pagoMesAtual:false, recorrente:true,  ativa:true  },
  { id:'pc15', nome:'Outros',        categoria:'Geral',          tipo:'variavel', valor:100,  diaPagamento:25, pagoMesAtual:false, recorrente:false, ativa:true  },
]

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export const FINANCEIRO_KPIS: FinanceiroKpis = {
  receitaMes: 8240, receitaMesTrend: '+12% vs mês ant.', receitaMesTrendUp: true,
  receitaHoje: 642, receitaHojeTrend: '+R$ 120 vs ontem', receitaHojeTrendUp: true,
  aReceber: 197, pendingCount: 6,
  taxaRecebimento: 92, taxaMeta: 88, taxaTrendUp: true,
  ticketMedio: 285, ticketTrend: '+R$ 15 vs mês ant.', ticketTrendUp: true,
  receitaBruta: 15000,
  despesas: 5200,
  lucroLiquido: 9800,
  margem: 65,
  metaAting: 81,
  inadimplenciaPct: 4,
  totalEntradas: 12500,
  saldoCaixa: 7300,
  receitaSemana: 3250,
  metaDiaria: 800,
  metaSemanal: 4000,
  metaMensal: 15000,
}

// ─── Helpers (exported) ───────────────────────────────────────────────────────

export function filterByPeriod(
  txs: Transaction[], filter: PeriodFilter, customFrom?: string, customTo?: string,
): Transaction[] {
  const now = new Date()
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const todayStart = sod(now)
  switch (filter) {
    case 'today': return txs.filter((t) => sod(t.date).getTime() === todayStart.getTime())
    case 'week': {
      const dow = todayStart.getDay()
      const diff = dow === 0 ? 6 : dow - 1
      const monStart = new Date(todayStart); monStart.setDate(todayStart.getDate() - diff)
      return txs.filter((t) => sod(t.date) >= monStart)
    }
    case 'month': {
      const monStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return txs.filter((t) => sod(t.date) >= monStart)
    }
    case 'last30': {
      const cutoff = new Date(todayStart); cutoff.setDate(todayStart.getDate() - 29)
      return txs.filter((t) => sod(t.date) >= cutoff)
    }
    case 'custom': {
      if (!customFrom || !customTo) return txs
      const from = sod(new Date(customFrom + 'T00:00:00'))
      const to   = sod(new Date(customTo   + 'T00:00:00'))
      return txs.filter((t) => { const d = sod(t.date); return d >= from && d <= to })
    }
  }
}

export function txDateLabel(date: Date, time: string): string {
  const today = new Date(); const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const d = date.toDateString()
  if (d === today.toDateString()) return `Hoje ${time}`
  if (d === yesterday.toDateString()) return `Ontem ${time}`
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')} ${time}`
}

// ─── Procedimentos ranking ────────────────────────────────────────────────────

export const MOCK_PROCEDIMENTOS: ProcedimentoRanking[] = [
  { rank:1,  nome:'Coloração Completa',  qtd:18, receita:3240, pct:20 },
  { rank:2,  nome:'Corte Feminino',      qtd:44, receita:2860, pct:18 },
  { rank:3,  nome:'Escova Progressiva',  qtd:12, receita:2640, pct:16 },
  { rank:4,  nome:'Corte Masculino',     qtd:38, receita:1710, pct:11 },
  { rank:5,  nome:'Manicure',            qtd:48, receita:1920, pct:12 },
  { rank:6,  nome:'Escova',              qtd:28, receita:1540, pct:10 },
  { rank:7,  nome:'Barba',               qtd:32, receita:1120, pct:7  },
  { rank:8,  nome:'Pedicure',            qtd:22, receita:1100, pct:7  },
  { rank:9,  nome:'Hidratação Capilar',  qtd:15, receita:1050, pct:7  },
  { rank:10, nome:'Design Sobrancelha',  qtd:10, receita:300,  pct:2  },
]

export const MOCK_PROF_RANKING: ProfissionalRanking[] = [
  { rank:1, nome:'Lisa Kim',      initials:'LK', avatarBg:'#DB2777', atendimentos:28, receita:5600, avaliacao:5.0 },
  { rank:2, nome:'Lena Santos',   initials:'LS', avatarBg:'#7C3AED', atendimentos:44, receita:4900, avaliacao:4.9 },
  { rank:3, nome:'Carlos Mendes', initials:'CM', avatarBg:'#2563EB', atendimentos:32, receita:3200, avaliacao:4.6 },
  { rank:4, nome:'Ana Costa',     initials:'AC', avatarBg:'#16A34A', atendimentos:72, receita:2880, avaliacao:4.8 },
  { rank:5, nome:'João Ferreira', initials:'JF', avatarBg:'#D97706', atendimentos:38, receita:1520, avaliacao:4.7 },
]

export const MOCK_PRODUTOS: ProdutoRanking[] = [
  { rank:1, nome:'Máscara Hidratante',   qtd:30, receita:1650 },
  { rank:2, nome:'Shampoo Profissional', qtd:45, receita:2025 },
  { rank:3, nome:'Vitamina Capilar',     qtd:38, receita:1330 },
  { rank:4, nome:'Finalizador',          qtd:25, receita:1000 },
  { rank:5, nome:'Óleo Capilar',         qtd:20, receita:760  },
]

// ─── Comissões por mês ────────────────────────────────────────────────────────

export const COMISSAO_HISTORICO: Record<string, Comissao[]> = {
  'jun-26': MOCK_COMISSOES,
  'mai-26': [
    { id:'cm1', profissionalName:'Lena Santos', initials:'LS', avatarBg:'#7C3AED', atendimentos:40, receita:3950, pctComissao:40, comissaoValue:1580, tipoPagamento:'mensal',    diaPagamento:5, periodoRef:'Mai/2026', diasAtraso:0, status:'PAID', paidAt:'08/06' },
    { id:'cm2', profissionalName:'João Silva',  initials:'JS', avatarBg:'#2563EB', atendimentos:28, receita:1942, pctComissao:35, comissaoValue:680,  tipoPagamento:'quinzenal', diaPagamento:5, periodoRef:'Mai/2026', diasAtraso:0, status:'PAID', paidAt:'08/06' },
  ],
  'abr-26': [
    { id:'ca1', profissionalName:'Lena Santos', initials:'LS', avatarBg:'#7C3AED', atendimentos:36, receita:3550, pctComissao:40, comissaoValue:1420, tipoPagamento:'mensal',    diaPagamento:5, periodoRef:'Abr/2026', diasAtraso:0, status:'PAID', paidAt:'07/05' },
    { id:'ca2', profissionalName:'João Silva',  initials:'JS', avatarBg:'#2563EB', atendimentos:25, receita:1700, pctComissao:35, comissaoValue:595,  tipoPagamento:'quinzenal', diaPagamento:5, periodoRef:'Abr/2026', diasAtraso:0, status:'PAID', paidAt:'07/05' },
  ],
}
