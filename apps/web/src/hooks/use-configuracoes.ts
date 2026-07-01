'use client'
import { useState, useEffect, useCallback } from 'react'
import { configuracoesApi, type UpdateSettingsData } from '@/lib/api/configuracoes'

export interface TenantSettings {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  document: string | null
  logoUrl: string | null
  plan: string
  trialEndsAt: string | null
  createdAt: string
  businessHours: object | null
  slotGapMinutes: number
  minAdvanceHours: number
  maxAdvanceDays: number
  acceptedPaymentMethods: string[]
  slogan: string | null
  address: string | null
  neighborhood: string | null
  cep: string | null
  city: string | null
  state: string | null
  depositRequired: boolean
  depositType: string
  depositValue: number | null
  cancellationMinHours: number
  cancellationFeePercent: number
  cancellationRefundSignal: boolean
}

export function useConfiguracoes() {
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await configuracoesApi.get()
      setSettings(data as TenantSettings)
    } catch {
      setError('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchSettings() }, [fetchSettings])

  const update = useCallback(async (data: UpdateSettingsData) => {
    setSaving(true)
    try {
      const updated = await configuracoesApi.update(data)
      setSettings(updated as TenantSettings)
      return { success: true as const }
    } catch {
      return { success: false as const, error: 'Erro ao salvar' }
    } finally {
      setSaving(false)
    }
  }, [])

  return { settings, loading, error, saving, update, refetch: fetchSettings }
}
