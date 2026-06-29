import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({ subsets: ['latin'], weight: ['900'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: 'Milli Agenda',
  description: 'Plataforma de agendamento para salões e clínicas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${nunito.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
