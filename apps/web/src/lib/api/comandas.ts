import { api } from './client'

export interface ComandaParams {
  status?: string
  page?: number
  perPage?: number
}

export const comandasApi = {
  list: (params?: ComandaParams) => {
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/orders?${qs}`)
  },

  get: (id: string) =>
    api.get(`/api/v1/orders/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/orders', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/orders/${id}`, data),

  addItem: (id: string, item: unknown) =>
    api.post(`/api/v1/orders/${id}/items`, item),

  removeItem: (orderId: string, itemId: string) =>
    api.delete(`/api/v1/orders/${orderId}/items/${itemId}`),

  close: (id: string, paymentData: unknown) =>
    api.post(`/api/v1/orders/${id}/close`, paymentData),

  cancel: (id: string) =>
    api.patch(`/api/v1/orders/${id}/status`, { status: 'CANCELLED' }),
}
