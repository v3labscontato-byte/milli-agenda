import { api } from './client'

export const produtosApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/api/v1/products${qs}`)
  },

  get: (id: string) =>
    api.get(`/api/v1/products/${id}`),

  dashboard: () =>
    api.get('/api/v1/products/dashboard'),

  create: (data: unknown) =>
    api.post('/api/v1/products', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/v1/products/${id}`),

  adjustStock: (id: string, delta: number) =>
    api.post(`/api/v1/products/${id}/stock`, { delta }),

  createMovimento: (id: string, data: unknown) =>
    api.post(`/api/v1/products/${id}/movimentacoes`, data),

  listMovimentos: (id: string) =>
    api.get(`/api/v1/products/${id}/movimentacoes`),
}
