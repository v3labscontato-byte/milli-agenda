'use client'

import { useState, useEffect } from 'react'
import { useTenantSlug } from '@/components/booking/tenant-context'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

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
  businessHours: unknown
  acceptedPaymentMethods: string[]
}

export function usePublicTenant(): { tenant: PublicTenant | null; loading: boolean } {
  const tenantSlug = useTenantSlug()
  const [tenant, setTenant] = useState<PublicTenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantSlug) { setLoading(false); return }

    fetch(`${API_BASE}/api/v1/settings/public/${tenantSlug}`)
      .then((r) => r.json())
      .then((json: unknown) => {
        const raw = json as Record<string, unknown>
        const data = (raw?.success === true ? raw.data : raw) as PublicTenant
        setTenant(data)
      })
      .catch(() => { /* keep null — falls back to mock data */ })
      .finally(() => setLoading(false))
  }, [tenantSlug])

  return { tenant, loading }
}
