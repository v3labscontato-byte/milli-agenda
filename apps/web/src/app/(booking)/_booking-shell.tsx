'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from '@/components/booking/bottom-nav'
import InstallBanner from '@/components/booking/install-banner'
import { useBookingClient } from '@/hooks/use-booking-client'
import { usePublicTenant } from '@/hooks/use-public-tenant'

const PUBLIC_ROUTES = ['/booking/login']

export default function BookingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { client, ready } = useBookingClient()
  const { tenant } = usePublicTenant()

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const primaryColor = tenant?.primaryColor ?? '#81736f'

  useEffect(() => {
    if (ready && !client && !isPublic) {
      router.replace('/booking/login')
    }
  }, [ready, client, isPublic, router])

  if (isPublic) {
    return (
      <div
        className="relative mx-auto max-w-md bg-white shadow-[0_0_40px_0_rgb(0_0_0/0.08)]"
        style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <main
          id="main-content"
          aria-label="Conteúdo principal"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        >
          {children}
        </main>
      </div>
    )
  }

  if (!ready) {
    return (
      <div
        className="relative mx-auto max-w-md bg-[#FAF7F4]"
        style={{ height: '100dvh', overflow: 'hidden' }}
      >
        <div className="h-full w-full animate-pulse bg-[#FAF7F4]" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div
      className="relative mx-auto max-w-md bg-[#fafafa] shadow-[0_0_40px_0_rgb(0_0_0/0.08)]"
      style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <InstallBanner />
      <main
        id="main-content"
        aria-label="Conteúdo principal"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        className="pb-[70px]"
      >
        {children}
      </main>
      <BottomNav primaryColor={primaryColor} />
    </div>
  )
}
