'use client'

import { createContext, useContext } from 'react'

const TenantSlugCtx = createContext<string>('')

export function useTenantSlug(): string {
  return useContext(TenantSlugCtx)
}

export default function TenantSlugProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <TenantSlugCtx.Provider value={slug}>{children}</TenantSlugCtx.Provider>
}
