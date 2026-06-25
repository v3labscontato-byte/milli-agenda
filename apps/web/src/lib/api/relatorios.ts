import { api } from './client'

export interface RelatorioParams {
  startDate?: string
  endDate?: string
  from?: string
  to?: string
  professionalId?: string
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

  commissions: (params?: RelatorioParams) => api.get(`/api/v1/reports/commissions${qs(params)}`),

  cashflow: (params?: RelatorioParams) => api.get(`/api/v1/reports/cashflow${qs(params)}`),

  overdue: () => api.get('/api/v1/reports/overdue'),
}
