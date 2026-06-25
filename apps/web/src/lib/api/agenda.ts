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
    const qs = new URLSearchParams(params as Record<string, string>)
    return api.get(`/api/v1/appointments?${qs}`)
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
