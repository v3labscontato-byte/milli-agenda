'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SALON, POPULAR_SERVICES, REVIEWS, CUPONS, PACOTES,
  formatPrice, formatDuration, type BookingCoupon,
} from '@/lib/booking-mock'

const TOTAL = 4

// ── Slide 1: Promoções ───────────────────────────────────────────────────────

function CouponCard({ c }: { c: BookingCoupon }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(c.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-xlight px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
            {c.code}
          </span>
          <span className="text-[12px] font-semibold text-content-primary">
            {c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-content-secondary">{c.description}</p>
        <p className="mt-0.5 text-[11px] text-content-subtle">Válido até {c.expiresAt}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={cn(
          'shrink-0 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
          copied
            ? 'border-success-medium bg-success-xlight text-success-medium'
            : 'border-primary text-primary hover:bg-primary hover:text-white',
        )}
      >
        {copied ? '✓' : 'Usar'}
      </button>
    </div>
  )
}

function SlidePromocoes() {
  return (
    <div className="min-w-full px-5 py-4">
      <h2 className="mb-4 text-[15px] font-semibold text-content-primary">🎁 Promoções para você</h2>
      <div className="space-y-3">
        {CUPONS.slice(0, 2).map((c) => <CouponCard key={c.id} c={c} />)}
      </div>
    </div>
  )
}

// ── Slide 2: Pacotes ─────────────────────────────────────────────────────────

function SlidePacotes() {
  return (
    <div className="min-w-full px-5 py-4">
      <h2 className="mb-4 text-[15px] font-semibold text-content-primary">📦 Pacotes especiais</h2>
      <div className="space-y-3">
        {PACOTES.slice(0, 2).map((p) => {
          const saved = p.originalPrice - p.discountedPrice
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-content-primary">{p.emoji} {p.name}</p>
                  <p className="mt-0.5 text-[11px] text-content-subtle">{p.services.join(' + ')}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="tabular-nums text-[15px] font-bold text-primary">{formatPrice(p.discountedPrice)}</span>
                    {p.highlight && <span className="text-[11px]">{p.highlight}</span>}
                    <span className="tabular-nums text-[11px] text-content-subtle line-through">{formatPrice(p.originalPrice)}</span>
                  </div>
                  <p className="text-[11px] font-medium text-success-medium">Economia {formatPrice(saved)}</p>
                </div>
                <Link
                  href="/booking/pacotes"
                  className={cn(
                    'shrink-0 rounded-xl border border-border px-4 py-2 text-[13px] font-medium text-content-secondary',
                    'transition-colors hover:border-primary hover:text-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
                  )}
                >
                  Ver
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Slide 3: Serviços ────────────────────────────────────────────────────────

function SlideServicos() {
  return (
    <div className="min-w-full px-5 py-4">
      <h2 className="mb-4 text-[15px] font-semibold text-content-primary">✂ Serviços populares</h2>
      <div className="grid grid-cols-3 gap-2">
        {POPULAR_SERVICES.slice(0, 6).map((svc) => (
          <Link
            key={svc.id}
            href="/booking/agendar"
            className={cn(
              'flex flex-col items-center rounded-2xl border border-border bg-white px-2 py-3 text-center',
              'transition-colors hover:border-primary-light hover:bg-primary-xlight',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
            )}
          >
            <span className="mb-1 text-[22px]" aria-hidden="true">{svc.emoji}</span>
            <p className="text-[11px] font-medium leading-tight text-content-primary">{svc.name}</p>
            <p className="mt-1 tabular-nums text-[12px] font-semibold text-primary">{formatPrice(svc.price)}</p>
            <p className="text-[10px] text-content-subtle">{formatDuration(svc.durationMins)}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/booking/agendar"
        className="mt-4 block text-center text-[13px] font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
      >
        Ver todos os serviços →
      </Link>
    </div>
  )
}

// ── Slide 4: Avaliações ──────────────────────────────────────────────────────

function SlideAvaliacoes() {
  return (
    <div className="min-w-full px-5 py-4">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 className="text-[15px] font-semibold text-content-primary">⭐ O que dizem sobre nós</h2>
        <span className="text-[12px] text-content-subtle">{SALON.rating} · {SALON.reviewCount} avaliações</span>
      </div>
      <div className="space-y-3">
        {REVIEWS.slice(0, 2).map((rev) => (
          <div key={rev.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-2 flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: rev.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-warning text-warning" />
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-content-primary">"{rev.text}"</p>
            <p className="mt-2 text-[11px] text-content-subtle">— {rev.clientName} · {rev.service}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main carousel ─────────────────────────────────────────────────────────────

export default function HomeCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const touchStartX  = useRef<number | null>(null)
  const resumeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % TOTAL), 5000)
    return () => clearInterval(id)
  }, [paused])

  function scheduleResume() {
    if (resumeTimer.current !== null) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), 8000)
  }

  function goTo(i: number) {
    setCurrent(i)
    setPaused(true)
    scheduleResume()
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      setCurrent((c) => dx < 0 ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0))
    }
    touchStartX.current = null
    scheduleResume()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Slides do carrossel">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1} de ${TOTAL}`}
            aria-selected={current === i}
            className={cn(
              'h-2 rounded-full transition-all duration-300 motion-reduce:transition-none',
              current === i ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-content-muted',
            )}
          />
        ))}
      </div>

      {/* Track */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Slide counter */}
        <span
          className="absolute right-5 top-4 z-10 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white"
          aria-hidden="true"
        >
          {current + 1} / {TOTAL}
        </span>

        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          <SlidePromocoes />
          <SlidePacotes />
          <SlideServicos />
          <SlideAvaliacoes />
        </div>
      </div>
    </div>
  )
}
