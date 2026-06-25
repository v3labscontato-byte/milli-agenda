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

export interface RegisterPayload {
  salonName: string
  slug: string
  ownerName: string
  email: string
  password: string
  phone?: string
  plan?: 'starter' | 'pro' | 'enterprise'
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: RegisterPayload) =>
    api.post<LoginResponse>('/api/v1/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/api/v1/auth/refresh', { refreshToken }),

  logout: () => api.post<void>('/api/v1/auth/logout', {}),

  forgotPassword: (email: string, tenantSlug: string) =>
    api.post<void>('/api/v1/auth/forgot-password', { email, tenantSlug }),

  resetPassword: (token: string, password: string) =>
    api.post<void>('/api/v1/auth/reset-password', { token, password }),

  getOnboardingStatus: () =>
    api.get<{
      completed: boolean
      nichoSlug: string | null
      hasServices: boolean
      hasProfessionals: boolean
      hasCategories: boolean
      tenant: { name: string; slug: string; plan: string; createdAt: string }
    }>('/api/v1/auth/onboarding'),

  completeOnboarding: () =>
    api.post<void>('/api/v1/auth/onboarding/complete', {}),

  selectNicho: (nichoSlug: string) =>
    api.post<{ categoriesCreated: number; servicesCreated: number; rolesCreated: number; nichoSlug: string }>(
      '/api/v1/auth/onboarding/nicho',
      { nichoSlug },
    ),
}
