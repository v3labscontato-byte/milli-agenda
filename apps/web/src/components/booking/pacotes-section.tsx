'use client'

import { cn } from '@/lib/utils'
import { PACOTES, formatPrice, type BookingPackage } from '@/lib/booking-mock'

interface PacoteCardProps {
  pac: BookingPackage
  idx: number
}

function PacoteCard({ pac, idx }: PacoteCardProps) {
  return (
    <div
      className="animate-fade-in motion-reduce:animate-none rounded-2xl border border-border bg-white p-4"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[22px]" aria-hidden="true">{pac.emoji}</span>
          <div>
            <p className="text-[15px] font-semibold text-content-primary">{pac.name}</p>
            <p className="text-[12px] text-content-subtle">{pac.services.join(' · ')}</p>
          </div>
        </div>
        {pac.highlight && (
          <span className="shrink-0 rounded-full bg-danger-light px-2 py-0.5 text-[11px] font-bold text-danger-medium">
            🔥 {pac.highlight}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] text-content-subtle line-through">{formatPrice(pac.originalPrice)}</p>
          <p className="text-[18px] font-bold text-content-primary">
            {formatPrice(pac.discountedPrice)}
          </p>
          <p className="text-[11px] text-content-subtle">
            Válido por {pac.validDays} dias · Economia {formatPrice(pac.originalPrice - pac.discountedPrice)}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'shrink-0 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white',
            'transition-colors hover:bg-primary-dark',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          Comprar
        </button>
      </div>
    </div>
  )
}

interface PacotesSectionProps {
  limit?: number
}

export default function PacotesSection({ limit }: PacotesSectionProps) {
  const list = limit ? PACOTES.slice(0, limit) : PACOTES

  if (list.length === 0) return null

  return (
    <section aria-labelledby="pacotes-heading">
      <h2 id="pacotes-heading" className="mb-3 text-[15px] font-semibold text-content-primary">
        📦 Pacotes especiais
      </h2>
      <div className="space-y-3">
        {list.map((p, i) => <PacoteCard key={p.id} pac={p} idx={i} />)}
      </div>
    </section>
  )
}
