'use client'

import { useState, useEffect } from 'react'

// Falls back to 'studio-homolog' when env var is not baked in at build time
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'studio-homolog'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface PublicTenantBusinessHours {
  days: Array<{ day: string; dayLabel: string; open: boolean; start: string; end: string }>
  lunchBreak: { active: boolean; start: string; end: string }
}

export interface PublicTenant {
  name: string
  slug: string
  logoUrl: string | null
  slogan: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  phone: string | null
  businessHours: PublicTenantBusinessHours | null
  acceptedPaymentMethods: string[]
  depositRequired: boolean
  depositType: string
  depositValue: number | null
  cancellationMinHours: number
  cancellationFeePercent: number
  cancellationRefundSignal: boolean
}

export function usePublicTenant(): { tenant: PublicTenant | null; loading: boolean } {
  const [tenant, setTenant] = useState<PublicTenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!TENANT_SLUG) { setLoading(false); return }

    fetch(`${API_BASE}/api/v1/settings/public/${TENANT_SLUG}`)
      .then((r) => r.json())
      .then((json: unknown) => {
        const raw = json as Record<string, unknown>
        const data = (raw?.success === true ? raw.data : raw) as PublicTenant
        setTenant(data)
      })
      .catch(() => { /* keep null — falls back to mock data */ })
      .finally(() => setLoading(false))
  }, [])

  return { tenant, loading }
}
