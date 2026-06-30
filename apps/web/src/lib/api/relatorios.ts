import { api } from './client'

export interface RelatorioParams {
  startDate?: string
  endDate?: string
  from?: string
  to?: string
  professionalId?: string
}

export interface GoalRaw {
  id: string
  tipo: string
  periodo: string
  valor: string | number
  dataInicio: string
  dataFim: string
}

export interface GoalCreateDto {
  tipo: string
  periodo: string
  valor: number
  dataInicio: string
  dataFim: string
}

function qs(params?: RelatorioParams) {
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v != null && v !== ''),
  ) as Record<string, string>
  const s = new URLSearchParams(clean).toString()
  return s ? `?${s}` : ''
}

export const relatoriosApi = {
  kpis: (params?: RelatorioParams) => api.get(`/api/v1/reports/kpis${qs(params)}`),

  revenue: (params?: RelatorioParams) => api.get(`/api/v1/reports/revenue${qs(params)}`),

  appointments: (params?: RelatorioParams) =>
    api.get(`/api/v1/reports/appointments${qs(params)}`),

  professionals: (params?: RelatorioParams) =>
    api.get(`/api/v1/reports/professionals${qs(params)}`),

  topServices: (params?: RelatorioParams) => api.get(`/api/v1/reports/top-services${qs(params)}`),

  paymentsByMethod: (params?: RelatorioParams) =>
    api.get(`/api/v1/reports/payments-by-method${qs(params)}`),

  payments: (params?: RelatorioParams) => api.get(`/api/v1/reports/payments${qs(params)}`),

  commissions: (params?: RelatorioParams) => api.get(`/api/v1/reports/commissions${qs(params)}`),

  cashflow: (params?: RelatorioParams) => api.get(`/api/v1/reports/cashflow${qs(params)}`),

  overdue: () => api.get('/api/v1/reports/overdue'),

  goals: () => api.get('/api/v1/reports/goals'),
  createGoal: (dto: GoalCreateDto) => api.post('/api/v1/reports/goals', dto),
  deleteGoal: (id: string) => api.delete(`/api/v1/reports/goals/${id}`),

  payCommission: (professionalId: string, dto: { period: string; amount: number }) =>
    api.post(`/api/v1/reports/commissions/${professionalId}/pay`, dto),

  createExpense: (dto: { descricao: string; valor: number; data: string }) =>
    api.post('/api/v1/reports/expenses', dto),

  listChartOfAccounts: (period?: string) =>
    api.get(`/api/v1/reports/chart-of-accounts${period ? `?period=${period}` : ''}`),

  createChartOfAccount: (dto: { nome: string; tipo: string; categoria: string; valorPadrao?: number; diaPagamento?: number; recorrente?: boolean; ativa?: boolean }) =>
    api.post('/api/v1/reports/chart-of-accounts', dto),

  deleteChartOfAccount: (id: string) =>
    api.delete(`/api/v1/reports/chart-of-accounts/${id}`),

  payChartOfAccount: (id: string, dto: { period: string; valor: number }) =>
    api.post(`/api/v1/reports/chart-of-accounts/${id}/pay`, dto),
}
