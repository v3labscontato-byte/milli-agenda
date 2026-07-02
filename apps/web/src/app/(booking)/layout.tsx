import type { Metadata, Viewport } from 'next'
import BookingShell from './_booking-shell'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Studio Bella',
  },
  icons: {
    apple: '/images/logo-icon.png',
    other: [{ rel: 'apple-touch-startup-image', url: '/images/logo-icon.png' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#81736f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <BookingShell>{children}</BookingShell>
}
