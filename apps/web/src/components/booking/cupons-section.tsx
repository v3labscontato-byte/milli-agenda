'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CUPONS, type BookingCoupon } from '@/lib/booking-mock'

interface CupomCardProps {
  coupon: BookingCoupon
  idx: number
}

function CupomCard({ coupon, idx }: CupomCardProps) {
  const [copied, setCopied] = useState(false)

  function handleUse() {
    navigator.clipboard.writeText(coupon.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="animate-fade-in motion-reduce:animate-none overflow-hidden rounded-2xl border border-border bg-white"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Dashed left accent */}
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0 bg-primary" aria-hidden="true" />
        <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-xlight px-2 py-0.5 font-mono text-[12px] font-bold tracking-wide text-primary">
                {coupon.code}
              </span>
              <span className="rounded-full bg-success-xlight px-2 py-0.5 text-[11px] font-semibold text-success-medium">
                {coupon.label}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] text-content-primary">{coupon.description}</p>
            <p className="mt-0.5 text-[11px] text-content-subtle">Válido até {coupon.expiresAt}</p>
          </div>
          <button
            type="button"
            onClick={handleUse}
            className={cn(
              'shrink-0 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
              copied
                ? 'bg-success-xlight text-success-medium'
                : 'bg-primary text-white hover:bg-primary-dark',
            )}
          >
            {copied ? '✓ Copiado' : 'Usar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface CuponsSectionProps {
  limit?: number
}

export default function CuponsSection({ limit }: CuponsSectionProps) {
  const list = limit ? CUPONS.slice(0, limit) : CUPONS

  if (list.length === 0) return null

  return (
    <section aria-labelledby="cupons-heading">
      <h2 id="cupons-heading" className="mb-3 text-[15px] font-semibold text-content-primary">
        🎁 Promoções para você
      </h2>
      <div className="space-y-2.5">
        {list.map((c, i) => <CupomCard key={c.id} coupon={c} idx={i} />)}
      </div>
    </section>
  )
}
