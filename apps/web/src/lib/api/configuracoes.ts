import { api } from './client'

export interface UpdateSettingsData {
  name?: string
  phone?: string
  document?: string
  email?: string
  logoUrl?: string
  businessHours?: object
  slotGapMinutes?: number
  minAdvanceHours?: number
  maxAdvanceDays?: number
  acceptedPaymentMethods?: string[]
  slogan?: string
  address?: string
  neighborhood?: string
  cep?: string
  city?: string
  state?: string
  depositRequired?: boolean
  depositType?: string
  depositValue?: number | null
  cancellationMinHours?: number
  cancellationFeePercent?: number
  cancellationRefundSignal?: boolean
}

export const configuracoesApi = {
  get: () => api.get('/api/v1/settings'),

  update: (data: UpdateSettingsData) =>
    api.patch('/api/v1/settings', data),
}
