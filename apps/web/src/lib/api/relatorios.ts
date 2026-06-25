import { api } from './client'

export interface RelatorioParams {
  startDate?: string
  endDate?: string
  professionalId?: string
}

export const relatoriosApi = {
  kpis: (params?: RelatorioParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/reports/kpis?${qs}`)
  },

  revenue: (params?: RelatorioParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/reports/revenue?${qs}`)
  },

  topServices: (params?: RelatorioParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/reports/top-services?${qs}`)
  },

  commissions: (params?: RelatorioParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/reports/commissions?${qs}`)
  },
}
