import { api } from './client'

export const pagamentosApi = {
  create: (data: unknown) =>
    api.post('/api/v1/payments', data),

  get: (id: string) =>
    api.get(`/api/v1/payments/${id}`),

  refund: (id: string, reason?: string) =>
    api.post(`/api/v1/payments/${id}/refund`, { reason }),
}
