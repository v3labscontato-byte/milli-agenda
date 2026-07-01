import type { Metadata } from 'next'
import BottomNav from '@/components/booking/bottom-nav'
import TenantSlugProvider from '@/components/booking/tenant-context'

export const metadata: Metadata = {
  title: {
    template: '%s — Salão Bella Vista',
    default: 'Salão Bella Vista',
  },
}

export default function BookingShellLayout({ children }: { children: React.ReactNode }) {
  // Server Component reads env at runtime — not subject to DefinePlugin build-time limitation
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? ''
  return (
    <div className="bg-background">
      <TenantSlugProvider slug={tenantSlug}>
        <div className="relative mx-auto min-h-screen max-w-md bg-white pb-[72px] shadow-[0_0_40px_0_rgb(0_0_0/0.08)]">
          <main id="main-content" aria-label="Conteúdo principal">
            {children}
          </main>
        </div>
        <BottomNav />
      </TenantSlugProvider>
    </div>
  )
}
