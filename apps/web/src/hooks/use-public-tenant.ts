'use client'

import { useState, useEffect } from 'react'

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
  const [tenant, setTenant] = useState<PublicTenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slug = process.env.NEXT_PUBLIC_TENANT_SLUG
    if (!slug) { setLoading(false); return }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    fetch(`${baseUrl}/api/v1/settings/public/${slug}`)
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
