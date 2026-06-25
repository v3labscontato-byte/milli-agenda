import { api } from './client'

export interface ComandaParams {
  status?: string
  page?: number
  perPage?: number
}

export const comandasApi = {
  list: (params?: ComandaParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/commands?${qs}`)
  },

  get: (id: string) =>
    api.get(`/api/v1/commands/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/commands', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/commands/${id}`, data),

  addItem: (id: string, item: unknown) =>
    api.post(`/api/v1/commands/${id}/items`, item),

  removeItem: (orderId: string, itemId: string) =>
    api.delete(`/api/v1/commands/${orderId}/items/${itemId}`),

  close: (id: string, paymentData: unknown) =>
    api.post(`/api/v1/commands/${id}/close`, paymentData),

  cancel: (id: string) =>
    api.patch(`/api/v1/commands/${id}/status`, { status: 'CANCELLED' }),
}
