import type { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'

export const metadata: Metadata = {
  title: {
    template: '%s — Milli Agenda',
    default: 'Dashboard — Milli Agenda',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Full-viewport shell: sidebar left, content right — no overflow on root
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      {/* Right column: topbar pinned, main scrollable */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="Visão geral do seu negócio" />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-6 py-5"
          // Landmark label for screen readers (topbar has role="banner")
          aria-label="Conteúdo principal"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
