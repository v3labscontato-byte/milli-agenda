import { api } from './client'

export interface AppointmentParams {
  date?: string
  professionalId?: string
  status?: string
  page?: number
  perPage?: number
}

export const agendaApi = {
  list: (params?: AppointmentParams) => {
    const qs = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          qs.set(key, String(value))
        }
      }
    }
    const query = qs.toString()
    return api.get(`/api/v1/appointments${query ? `?${query}` : ''}`)
  },

  get: (id: string) =>
    api.get(`/api/v1/appointments/${id}`),

  create: (data: unknown) =>
    api.post('/api/v1/appointments', data),

  update: (id: string, data: unknown) =>
    api.patch(`/api/v1/appointments/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/api/v1/appointments/${id}/status`, { status }),

  cancel: (id: string) =>
    api.patch(`/api/v1/appointments/${id}/status`, { status: 'CANCELLED' }),

  delete: (id: string) =>
    api.delete(`/api/v1/appointments/${id}`),
}
