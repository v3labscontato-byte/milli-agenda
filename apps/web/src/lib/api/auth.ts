import { api } from './client'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    roles: string[]
  }
  tenant: {
    id: string
    name: string
    slug: string
  }
}

export const authApi = {
  login: (data: { email: string; password: string; tenantSlug: string }) =>
    api.post<LoginResponse>('/api/v1/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/api/v1/auth/refresh', { refreshToken }),

  logout: () => api.post<void>('/api/v1/auth/logout', {}),
}
