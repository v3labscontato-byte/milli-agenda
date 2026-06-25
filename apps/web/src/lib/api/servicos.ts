import { api } from './client'

export const servicosApi = {
  list: () =>
    api.get('/api/v1/services'),

  get: (id: string) =>
    api.get(`/api/v1/services/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/services', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/services/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/v1/services/${id}`),
}
