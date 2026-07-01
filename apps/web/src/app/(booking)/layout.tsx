'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from '@/components/booking/bottom-nav'
import { useBookingClient } from '@/hooks/use-booking-client'

const PUBLIC_ROUTES = ['/booking/login']

export default function BookingShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { client, ready } = useBookingClient()

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))

  useEffect(() => {
    if (ready && !client && !isPublic) {
      router.replace('/booking/login')
    }
  }, [ready, client, isPublic, router])

  // Login and other public routes — no auth check, no BottomNav
  if (isPublic) {
    return (
      <div className="bg-background">
        <div className="relative mx-auto min-h-screen max-w-md bg-white shadow-[0_0_40px_0_rgb(0_0_0/0.08)]">
          <main id="main-content" aria-label="Conteúdo principal">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Waiting for sessionStorage hydration
  if (!ready) {
    return (
      <div className="bg-background">
        <div className="min-h-screen max-w-md mx-auto bg-[#FAF7F4] animate-pulse" />
      </div>
    )
  }

  // Not logged in — redirect in progress
  if (!client) return null

  return (
    <div className="bg-background">
      <div className="relative mx-auto min-h-screen max-w-md bg-white pb-[72px] shadow-[0_0_40px_0_rgb(0_0_0/0.08)]">
        <main id="main-content" aria-label="Conteúdo principal">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
