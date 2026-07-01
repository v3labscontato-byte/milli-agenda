'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from '@/components/booking/bottom-nav'
import { useBookingClient } from '@/hooks/use-booking-client'
import { usePublicTenant } from '@/hooks/use-public-tenant'

const PUBLIC_ROUTES = ['/booking/login']

export default function BookingShellLayout({ children }: { children: React.ReactNode }) {
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
      <div className="bg-[#fafafa]">
        <div className="relative mx-auto min-h-screen max-w-md bg-white shadow-[0_0_40px_0_rgb(0_0_0/0.08)]">
          <main id="main-content" aria-label="Conteúdo principal">
            {children}
          </main>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="bg-[#fafafa]">
        <div className="min-h-screen max-w-md mx-auto bg-[#FAF7F4] animate-pulse" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="bg-[#fafafa]">
      <div className="relative mx-auto min-h-screen max-w-md bg-[#fafafa] pb-[70px] shadow-[0_0_40px_0_rgb(0_0_0/0.08)]">
        <main id="main-content" aria-label="Conteúdo principal">
          {children}
        </main>
      </div>
      <BottomNav primaryColor={primaryColor} />
    </div>
  )
}
