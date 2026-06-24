import type { Metadata } from 'next'
import BottomNav from '@/components/booking/bottom-nav'

export const metadata: Metadata = {
  title: {
    template: '%s — Salão Bella Vista',
    default: 'Salão Bella Vista',
  },
}

export default function BookingShellLayout({ children }: { children: React.ReactNode }) {
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
