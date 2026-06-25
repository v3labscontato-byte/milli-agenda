import { api } from './client'

export interface ClienteParams {
  search?: string
  page?: number
  perPage?: number
}

export const clientesApi = {
  list: (params?: ClienteParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/clients?${qs}`)
  },

  get: (id: string) =>
    api.get(`/api/v1/clients/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/clients', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/clients/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/v1/clients/${id}`),

  history: (id: string) =>
    api.get(`/api/v1/clients/${id}/history`),
}
