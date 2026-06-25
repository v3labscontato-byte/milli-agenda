import { api } from './client'

export const profissionaisApi = {
  list: () =>
    api.get('/api/v1/professionals'),

  get: (id: string) =>
    api.get(`/api/v1/professionals/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/professionals', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/professionals/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/v1/professionals/${id}`),

  availability: (id: string, date: string) =>
    api.get(`/api/v1/professionals/${id}/availability?date=${date}`),
}
