import type { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'

export const metadata: Metadata = {
  title: {
    template: '%s — Milli Agenda',
    default: 'Serviços — Milli Agenda',
  },
}

export default function ServicosShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="Serviços" />
        <main
          id="main-content"
          className="flex-1 overflow-auto"
          aria-label="Conteúdo principal"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
