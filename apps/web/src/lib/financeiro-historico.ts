import type { Transaction, Inadimplencia, FluxoCaixaEntry, FluxoLancamento } from './financeiro-mock'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetaHistorico {
  mesKey: string
  mes: string
  meta: number
  realizado: number
  pct: number
}

// ─── Metas histórico ─────────────────────────────────────────────────────────

export const MOCK_METAS_HISTORICO: MetaHistorico[] = [
  { mesKey:'jan-26', mes:'Jan/26', meta:12000, realizado:10200, pct:85  },
  { mesKey:'fev-26', mes:'Fev/26', meta:12000, realizado:11800, pct:98  },
  { mesKey:'mar-26', mes:'Mar/26', meta:13000, realizado:14200, pct:109 },
  { mesKey:'abr-26', mes:'Abr/26', meta:13000, realizado:12100, pct:93  },
  { mesKey:'mai-26', mes:'Mai/26', meta:14000, realizado:13500, pct:96  },
  { mesKey:'jun-26', mes:'Jun/26', meta:15000, realizado:8240,  pct:55  },
]

// ─── Transactions histórico ───────────────────────────────────────────────────

function td(year: number, month: number, day: number, hour = 10): Date {
  return new Date(year, month - 1, day, hour)
}

export const MOCK_TRANSACTIONS_HISTORICO: Record<string, Transaction[]> = {
  'jan-26': [
    { id:'tj1', date:td(2026,1,5,9),   time:'09:00', clientName:'Amanda Lima',    service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:220, status:'PAID'    },
    { id:'tj2', date:td(2026,1,7,10),  time:'10:30', clientName:'Beatriz Costa',  service:'Corte Feminino',     professional:'Lisa Kim',      method:'credito',  value:85,  status:'PAID'    },
    { id:'tj3', date:td(2026,1,9,14),  time:'14:00', clientName:'Carlos Melo',    service:'Corte Masculino',    professional:'João Ferreira', method:'dinheiro', value:55,  status:'PAID'    },
    { id:'tj4', date:td(2026,1,12,9),  time:'09:00', clientName:'Diana Souza',    service:'Manicure',           professional:'Ana Costa',     method:'debito',   value:45,  status:'PAID'    },
    { id:'tj5', date:td(2026,1,14,11), time:'11:00', clientName:'Eduardo Rocha',  service:'Barba',              professional:'Carlos Mendes', method:'pix',      value:40,  status:'PAID'    },
    { id:'tj6', date:td(2026,1,15,15), time:'15:00', clientName:'Fernanda Alves', service:'Escova',             professional:'Lena Santos',   method:'credito',  value:90,  status:'PAID'    },
    { id:'tj7', date:td(2026,1,18,10), time:'10:00', clientName:'Gustavo Pinto',  service:'Hidratação Capilar', professional:'Lisa Kim',      method:'pix',      value:120, status:'PAID'    },
    { id:'tj8', date:td(2026,1,20,14), time:'14:30', clientName:'Helena Faria',   service:'Pedicure',           professional:'Ana Costa',     method:'dinheiro', value:55,  status:'PAID'    },
    { id:'tj9', date:td(2026,1,22,9),  time:'09:00', clientName:'Igor Cunha',     service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:210, status:'PENDING' },
    { id:'tja', date:td(2026,1,25,11), time:'11:00', clientName:'Juliana Ramos',  service:'Corte Feminino',     professional:'Lisa Kim',      method:'credito',  value:85,  status:'PAID'    },
    { id:'tjb', date:td(2026,1,27,16), time:'16:00', clientName:'Karen Silva',    service:'Escova Progressiva', professional:'Lena Santos',   method:'pix',      value:280, status:'PAID'    },
    { id:'tjc', date:td(2026,1,29,10), time:'10:00', clientName:'Lucas Ferreira', service:'Corte Masculino',    professional:'Carlos Mendes', method:'debito',   value:55,  status:'PAID'    },
  ],
  'fev-26': [
    { id:'tf1', date:td(2026,2,3,9),   time:'09:00', clientName:'Mariana Duarte', service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:240, status:'PAID'    },
    { id:'tf2', date:td(2026,2,5,10),  time:'10:00', clientName:'Natalia Lima',   service:'Manicure',           professional:'Ana Costa',     method:'dinheiro', value:45,  status:'PAID'    },
    { id:'tf3', date:td(2026,2,8,14),  time:'14:00', clientName:'Otávio Melo',    service:'Corte Masculino',    professional:'João Ferreira', method:'credito',  value:55,  status:'PAID'    },
    { id:'tf4', date:td(2026,2,11,11), time:'11:00', clientName:'Patricia Costa', service:'Escova',             professional:'Lisa Kim',      method:'pix',      value:90,  status:'PAID'    },
    { id:'tf5', date:td(2026,2,13,15), time:'15:00', clientName:'Rafael Santos',  service:'Barba',              professional:'Carlos Mendes', method:'dinheiro', value:40,  status:'PAID'    },
    { id:'tf6', date:td(2026,2,17,9),  time:'09:30', clientName:'Sandra Rocha',   service:'Hidratação Capilar', professional:'Lena Santos',   method:'pix',      value:130, status:'PAID'    },
    { id:'tf7', date:td(2026,2,19,13), time:'13:00', clientName:'Thiago Alves',   service:'Escova Progressiva', professional:'Lisa Kim',      method:'credito',  value:260, status:'PAID'    },
    { id:'tf8', date:td(2026,2,21,10), time:'10:00', clientName:'Ursula Pinto',   service:'Pedicure',           professional:'Ana Costa',     method:'debito',   value:55,  status:'PAID'    },
    { id:'tf9', date:td(2026,2,24,9),  time:'09:00', clientName:'Viviane Faria',  service:'Corte Feminino',     professional:'Lisa Kim',      method:'pix',      value:85,  status:'PENDING' },
    { id:'tfa', date:td(2026,2,26,16), time:'16:00', clientName:'Wagner Cunha',   service:'Coloração',          professional:'Lena Santos',   method:'credito',  value:230, status:'PAID'    },
    { id:'tfb', date:td(2026,2,28,11), time:'11:00', clientName:'Ximena Ramos',   service:'Design Sobrancelha', professional:'Ana Costa',     method:'dinheiro', value:35,  status:'PAID'    },
  ],
  'mar-26': [
    { id:'tm1', date:td(2026,3,2,9),   time:'09:00', clientName:'Yara Silva',     service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:250, status:'PAID'    },
    { id:'tm2', date:td(2026,3,4,10),  time:'10:00', clientName:'Zeca Mendes',    service:'Corte Masculino',    professional:'Carlos Mendes', method:'dinheiro', value:55,  status:'PAID'    },
    { id:'tm3', date:td(2026,3,7,11),  time:'11:00', clientName:'Alice Barbosa',  service:'Manicure',           professional:'Ana Costa',     method:'debito',   value:45,  status:'PAID'    },
    { id:'tm4', date:td(2026,3,10,14), time:'14:00', clientName:'Bruno Tavares',  service:'Escova',             professional:'Lisa Kim',      method:'pix',      value:90,  status:'PAID'    },
    { id:'tm5', date:td(2026,3,12,9),  time:'09:30', clientName:'Carla Nunes',    service:'Escova Progressiva', professional:'Lena Santos',   method:'credito',  value:290, status:'PAID'    },
    { id:'tm6', date:td(2026,3,14,15), time:'15:00', clientName:'David Soares',   service:'Barba',              professional:'João Ferreira', method:'dinheiro', value:40,  status:'PAID'    },
    { id:'tm7', date:td(2026,3,17,10), time:'10:00', clientName:'Elena Castro',   service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:260, status:'PAID'    },
    { id:'tm8', date:td(2026,3,19,13), time:'13:00', clientName:'Felipe Lima',    service:'Hidratação Capilar', professional:'Lisa Kim',      method:'credito',  value:130, status:'PAID'    },
    { id:'tm9', date:td(2026,3,21,9),  time:'09:00', clientName:'Gabriela Pinto', service:'Pedicure',           professional:'Ana Costa',     method:'debito',   value:55,  status:'PAID'    },
    { id:'tma', date:td(2026,3,24,14), time:'14:30', clientName:'Henrique Faria', service:'Corte Feminino',     professional:'Lisa Kim',      method:'pix',      value:85,  status:'PAID'    },
    { id:'tmb', date:td(2026,3,26,11), time:'11:00', clientName:'Isabela Rocha',  service:'Coloração',          professional:'Lena Santos',   method:'credito',  value:220, status:'PAID'    },
    { id:'tmc', date:td(2026,3,29,10), time:'10:00', clientName:'Júlio Cunha',    service:'Corte Masculino',    professional:'Carlos Mendes', method:'dinheiro', value:55,  status:'PENDING' },
  ],
  'abr-26': [
    { id:'ta1', date:td(2026,4,2,9),   time:'09:00', clientName:'Katia Alves',    service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:230, status:'PAID'    },
    { id:'ta2', date:td(2026,4,5,10),  time:'10:00', clientName:'Leandro Melo',   service:'Barba',              professional:'Carlos Mendes', method:'dinheiro', value:40,  status:'PAID'    },
    { id:'ta3', date:td(2026,4,8,14),  time:'14:00', clientName:'Marcia Costa',   service:'Manicure',           professional:'Ana Costa',     method:'debito',   value:45,  status:'PAID'    },
    { id:'ta4', date:td(2026,4,10,11), time:'11:00', clientName:'Nuno Santos',    service:'Escova Progressiva', professional:'Lisa Kim',      method:'credito',  value:270, status:'PAID'    },
    { id:'ta5', date:td(2026,4,12,9),  time:'09:30', clientName:'Olga Ferreira',  service:'Pedicure',           professional:'Ana Costa',     method:'pix',      value:55,  status:'PAID'    },
    { id:'ta6', date:td(2026,4,15,15), time:'15:00', clientName:'Paulo Ramos',    service:'Corte Masculino',    professional:'João Ferreira', method:'dinheiro', value:55,  status:'PAID'    },
    { id:'ta7', date:td(2026,4,17,10), time:'10:00', clientName:'Quintia Silva',  service:'Hidratação Capilar', professional:'Lena Santos',   method:'pix',      value:130, status:'PAID'    },
    { id:'ta8', date:td(2026,4,20,13), time:'13:00', clientName:'Ricardo Duarte', service:'Coloração',          professional:'Lena Santos',   method:'credito',  value:240, status:'PAID'    },
    { id:'ta9', date:td(2026,4,22,9),  time:'09:00', clientName:'Sofia Lima',     service:'Corte Feminino',     professional:'Lisa Kim',      method:'pix',      value:85,  status:'PENDING' },
    { id:'taa', date:td(2026,4,25,16), time:'16:00', clientName:'Tadeu Barbosa',  service:'Barba',              professional:'Carlos Mendes', method:'debito',   value:40,  status:'PAID'    },
    { id:'tab', date:td(2026,4,28,11), time:'11:00', clientName:'Ubiratan Pinto', service:'Escova',             professional:'Lisa Kim',      method:'dinheiro', value:90,  status:'PAID'    },
  ],
  'mai-26': [
    { id:'ts1', date:td(2026,5,2,9),   time:'09:00', clientName:'Vera Nunes',     service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:245, status:'PAID'    },
    { id:'ts2', date:td(2026,5,5,10),  time:'10:00', clientName:'Walter Faria',   service:'Corte Masculino',    professional:'Carlos Mendes', method:'dinheiro', value:55,  status:'PAID'    },
    { id:'ts3', date:td(2026,5,7,11),  time:'11:00', clientName:'Xenia Castro',   service:'Manicure',           professional:'Ana Costa',     method:'debito',   value:45,  status:'PAID'    },
    { id:'ts4', date:td(2026,5,9,14),  time:'14:00', clientName:'Yago Soares',    service:'Barba',              professional:'João Ferreira', method:'pix',      value:40,  status:'PAID'    },
    { id:'ts5', date:td(2026,5,12,9),  time:'09:30', clientName:'Zelda Lima',     service:'Escova',             professional:'Lena Santos',   method:'credito',  value:90,  status:'PAID'    },
    { id:'ts6', date:td(2026,5,14,15), time:'15:00', clientName:'Adriana Melo',   service:'Escova Progressiva', professional:'Lisa Kim',      method:'pix',      value:280, status:'PAID'    },
    { id:'ts7', date:td(2026,5,17,10), time:'10:00', clientName:'Benedito Costa', service:'Hidratação Capilar', professional:'Lena Santos',   method:'credito',  value:130, status:'PAID'    },
    { id:'ts8', date:td(2026,5,20,13), time:'13:00', clientName:'Cintia Santos',  service:'Pedicure',           professional:'Ana Costa',     method:'dinheiro', value:55,  status:'PAID'    },
    { id:'ts9', date:td(2026,5,22,9),  time:'09:00', clientName:'Danilo Alves',   service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:250, status:'PAID'    },
    { id:'tsa', date:td(2026,5,24,11), time:'11:00', clientName:'Erica Ferreira', service:'Corte Feminino',     professional:'Lisa Kim',      method:'credito',  value:85,  status:'PAID'    },
    { id:'tsb', date:td(2026,5,27,16), time:'16:00', clientName:'Fabio Ramos',    service:'Design Sobrancelha', professional:'Ana Costa',     method:'pix',      value:35,  status:'PENDING' },
    { id:'tsc', date:td(2026,5,29,10), time:'10:00', clientName:'Gisele Duarte',  service:'Coloração',          professional:'Lena Santos',   method:'debito',   value:235, status:'PAID'    },
  ],
  'jun-26': [
    { id:'tu1', date:td(2026,6,2,9),   time:'09:00', clientName:'Hélio Barbosa',  service:'Corte Masculino',    professional:'Carlos Mendes', method:'pix',      value:55,  status:'PAID'    },
    { id:'tu2', date:td(2026,6,4,10),  time:'10:00', clientName:'Ines Pinto',     service:'Coloração',          professional:'Lena Santos',   method:'credito',  value:230, status:'PAID'    },
    { id:'tu3', date:td(2026,6,6,11),  time:'11:00', clientName:'Jorge Silva',    service:'Barba',              professional:'João Ferreira', method:'dinheiro', value:40,  status:'PAID'    },
    { id:'tu4', date:td(2026,6,9,14),  time:'14:00', clientName:'Kele Lima',      service:'Manicure',           professional:'Ana Costa',     method:'debito',   value:45,  status:'PAID'    },
    { id:'tu5', date:td(2026,6,11,9),  time:'09:30', clientName:'Laís Nunes',     service:'Escova Progressiva', professional:'Lisa Kim',      method:'pix',      value:275, status:'PAID'    },
    { id:'tu6', date:td(2026,6,13,15), time:'15:00', clientName:'Marcos Costa',   service:'Hidratação Capilar', professional:'Lena Santos',   method:'credito',  value:125, status:'PAID'    },
    { id:'tu7', date:td(2026,6,16,10), time:'10:00', clientName:'Nadia Soares',   service:'Coloração',          professional:'Lena Santos',   method:'pix',      value:240, status:'PAID'    },
    { id:'tu8', date:td(2026,6,18,13), time:'13:00', clientName:'Omar Alves',     service:'Corte Masculino',    professional:'Carlos Mendes', method:'dinheiro', value:55,  status:'PAID'    },
    { id:'tu9', date:td(2026,6,20,9),  time:'09:00', clientName:'Paula Ferreira', service:'Escova',             professional:'Lisa Kim',      method:'pix',      value:90,  status:'PAID'    },
    { id:'tua', date:td(2026,6,22,11), time:'11:00', clientName:'Quintino Ramos', service:'Pedicure',           professional:'Ana Costa',     method:'debito',   value:55,  status:'PAID'    },
    { id:'tub', date:td(2026,6,24,16), time:'16:00', clientName:'Renata Duarte',  service:'Design Sobrancelha', professional:'Ana Costa',     method:'pix',      value:35,  status:'PENDING' },
    { id:'tuc', date:td(2026,6,24,9),  time:'09:00', clientName:'Sandro Castro',  service:'Coloração',          professional:'Lena Santos',   method:'credito',  value:245, status:'PENDING' },
  ],
}

// ─── Inadimplência histórico ──────────────────────────────────────────────────

export const MOCK_INADIMPLENCIA_HISTORICO: Record<string, Inadimplencia[]> = {
  'jan-26': [
    { id:'ij1', dateLabel:'10/01', clientName:'Amanda Lima',    service:'Coloração',          value:220, daysOverdue:21 },
    { id:'ij2', dateLabel:'18/01', clientName:'Beatriz Costa',  service:'Escova Progressiva', value:280, daysOverdue:13 },
  ],
  'fev-26': [
    { id:'if1', dateLabel:'05/02', clientName:'Carlos Melo',    service:'Coloração',          value:240, daysOverdue:23 },
  ],
  'mar-26': [
    { id:'im1', dateLabel:'12/03', clientName:'Diana Souza',    service:'Manicure',           value:45,  daysOverdue:19 },
    { id:'im2', dateLabel:'20/03', clientName:'Eduardo Rocha',  service:'Barba',              value:40,  daysOverdue:11 },
  ],
  'abr-26': [
    { id:'ia1', dateLabel:'08/04', clientName:'Fernanda Alves', service:'Escova',             value:90,  daysOverdue:22 },
    { id:'ia2', dateLabel:'15/04', clientName:'Gustavo Pinto',  service:'Coloração',          value:230, daysOverdue:15 },
  ],
  'mai-26': [
    { id:'is1', dateLabel:'10/05', clientName:'Helena Faria',   service:'Pedicure',           value:55,  daysOverdue:20 },
  ],
  'jun-26': [
    { id:'iu1', dateLabel:'02/06', clientName:'Maria Oliveira', service:'Coloração',          value:280, daysOverdue:22 },
    { id:'iu2', dateLabel:'10/06', clientName:'João Silva',     service:'Corte Feminino',     value:95,  daysOverdue:14 },
    { id:'iu3', dateLabel:'15/06', clientName:'Ana Souza',      service:'Manicure',           value:45,  daysOverdue:9  },
  ],
}

// ─── Fluxo de Caixa histórico ─────────────────────────────────────────────────

function makeFluxoEntries(year: number, month: number, data: [number, number][]): FluxoCaixaEntry[] {
  let acc = 0
  return data.map(([entradas, saidas], i) => {
    const day = Math.min((i + 1) * 4, 28)
    const saldoDia = entradas - saidas
    acc += saldoDia
    return {
      date: new Date(year, month - 1, day),
      dateLabel: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
      entradas, saidas, saldoDia, saldoAcum: acc,
    }
  })
}

export const MOCK_FLUXO_HISTORICO: Record<string, FluxoCaixaEntry[]> = {
  'jan-26': makeFluxoEntries(2026, 1, [[2800,1800],[3200,1200],[2600,900],[2800,1300],[3100,1500],[2900,1000],[3500,1100]]),
  'fev-26': makeFluxoEntries(2026, 2, [[3100,1600],[2900,1100],[3300,1300],[3500,1200],[3200,1400],[3600,1100],[3100,900]]),
  'mar-26': makeFluxoEntries(2026, 3, [[3400,1700],[3600,1200],[3800,1400],[3500,1300],[3700,1600],[4100,1200],[3900,1000]]),
  'abr-26': makeFluxoEntries(2026, 4, [[3200,1600],[3400,1300],[3100,1500],[3600,1200],[3300,1400],[3500,1100],[3400,1000]]),
  'mai-26': makeFluxoEntries(2026, 5, [[3500,1700],[3800,1300],[3600,1500],[3900,1200],[3700,1600],[4200,1100],[3900,1000]]),
  'jun-26': makeFluxoEntries(2026, 6, [[1800,1500],[2100,1200],[2400,1300],[1900,1100],[2200,1400],[2600,900],[0,0]]),
}

// ─── Lançamentos histórico ────────────────────────────────────────────────────

export const MOCK_LANCAMENTOS_HISTORICO: Record<string, FluxoLancamento[]> = {
  'jan-26': [
    { id:'lj1', date:'05/01', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:2800 },
    { id:'lj2', date:'05/01', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1800 },
    { id:'lj3', date:'12/01', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:6100 },
    { id:'lj4', date:'12/01', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2100 },
    { id:'lj5', date:'20/01', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:5700 },
    { id:'lj6', date:'25/01', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:2300 },
  ],
  'fev-26': [
    { id:'lf1', date:'03/02', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:3100 },
    { id:'lf2', date:'03/02', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1600 },
    { id:'lf3', date:'11/02', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:6800 },
    { id:'lf4', date:'11/02', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2000 },
    { id:'lf5', date:'21/02', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:7700 },
    { id:'lf6', date:'26/02', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:2400 },
  ],
  'mar-26': [
    { id:'lm1', date:'02/03', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:3400 },
    { id:'lm2', date:'02/03', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1700 },
    { id:'lm3', date:'10/03', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:7400 },
    { id:'lm4', date:'10/03', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2100 },
    { id:'lm5', date:'20/03', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:9500 },
    { id:'lm6', date:'26/03', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:2500 },
  ],
  'abr-26': [
    { id:'la1', date:'02/04', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:3200 },
    { id:'la2', date:'02/04', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1600 },
    { id:'la3', date:'10/04', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:6700 },
    { id:'la4', date:'10/04', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2000 },
    { id:'la5', date:'20/04', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:8100 },
    { id:'la6', date:'26/04', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:2200 },
  ],
  'mai-26': [
    { id:'ls1', date:'02/05', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:3500 },
    { id:'ls2', date:'02/05', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1700 },
    { id:'ls3', date:'10/05', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:7700 },
    { id:'ls4', date:'10/05', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2100 },
    { id:'ls5', date:'21/05', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:9500 },
    { id:'ls6', date:'26/05', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:2400 },
  ],
  'jun-26': [
    { id:'lu1', date:'02/06', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 1',      valor:1800 },
    { id:'lu2', date:'02/06', tipo:'saida',   categoria:'Pessoal',    descricao:'Comissões profissionais', valor:1500 },
    { id:'lu3', date:'10/06', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 2',      valor:4500 },
    { id:'lu4', date:'10/06', tipo:'saida',   categoria:'Moradia',    descricao:'Aluguel + utilidades',   valor:2000 },
    { id:'lu5', date:'18/06', tipo:'entrada', categoria:'Serviços',   descricao:'Receitas semana 3',      valor:6200 },
    { id:'lu6', date:'20/06', tipo:'saida',   categoria:'Operacional',descricao:'Despesas operacionais',  valor:1900 },
  ],
}
