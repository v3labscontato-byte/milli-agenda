'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PACOTES, CLIENT_PACOTES, formatPrice } from '@/lib/booking-mock'
import PacotesSection from '@/components/booking/pacotes-section'

function ActivePackageCard({ cp }: { cp: typeof CLIENT_PACOTES[0] }) {
  const pct = Math.round((cp.usedSessions / cp.totalSessions) * 100)
  const remaining = cp.totalSessions - cp.usedSessions

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[22px]" aria-hidden="true">{cp.emoji}</span>
          <p className="text-[15px] font-semibold text-content-primary">{cp.packageName}</p>
        </div>
        <span className="rounded-full bg-status-confirmed-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-confirmed-text">
          {remaining} sessões restantes
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-content-subtle">
          <span>{cp.usedSessions} de {cp.totalSessions} sessões utilizadas</span>
          <span>{pct}% utilizado</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-background-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
            aria-label={`${pct}% das sessões utilizadas`}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-content-subtle">Expira em {cp.expiresAt}</p>
      </div>

      <button
        type="button"
        className={cn(
          'mt-3 w-full rounded-xl border border-primary py-2.5 text-[13px] font-semibold text-primary',
          'transition-colors hover:bg-primary hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
          remaining === 0 && 'cursor-not-allowed border-border text-content-muted hover:bg-transparent hover:text-content-muted',
        )}
        disabled={remaining === 0}
      >
        {remaining === 0 ? 'Pacote esgotado' : 'Agendar sessão'}
      </button>
    </div>
  )
}

export default function PacotesPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col">
      {/* Header */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">Meus Pacotes</span>
      </button>

      <div className="space-y-6 px-5 pb-6">
        {/* Active packages */}
        {CLIENT_PACOTES.length > 0 && (
          <section aria-labelledby="active-pkgs-heading">
            <h2 id="active-pkgs-heading" className="mb-3 text-[15px] font-semibold text-content-primary">
              📦 Pacotes ativos
            </h2>
            <div className="space-y-3">
              {CLIENT_PACOTES.map((cp) => <ActivePackageCard key={cp.id} cp={cp} />)}
            </div>
          </section>
        )}

        {/* Available to buy */}
        <PacotesSection />
      </div>
    </div>
  )
}
