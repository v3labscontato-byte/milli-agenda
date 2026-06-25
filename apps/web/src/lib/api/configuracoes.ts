import { api } from './client'

export interface UpdateSettingsData {
  name?: string
  phone?: string
  document?: string
  email?: string
  logoUrl?: string
}

export const configuracoesApi = {
  get: () => api.get('/api/v1/settings'),

  update: (data: UpdateSettingsData) =>
    api.patch('/api/v1/settings', data),
}
