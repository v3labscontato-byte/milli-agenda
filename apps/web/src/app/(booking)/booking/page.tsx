'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SALON, CLIENT, POPULAR_SERVICES, UPCOMING_APPOINTMENTS, REVIEWS,
  formatPrice, formatDuration, type BookingAppointment,
} from '@/lib/booking-mock'

export default function BookingHomePage() {
  const [upcoming, setUpcoming] = useState<BookingAppointment[]>(UPCOMING_APPOINTMENTS)
  const next = upcoming[0] ?? null

  function cancelAppointment(id: string) {
    setUpcoming((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex flex-col">
      {/* ── Salon header ── */}
      <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-5 pt-6">
        <div className="flex items-start gap-3">
          <span className="text-[38px] leading-none" aria-hidden="true">{SALON.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-h2 font-bold text-content-primary">{SALON.name}</h1>
            <p className="mt-0.5 text-[13px] text-content-secondary">{SALON.address}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Star size={13} className="fill-warning text-warning" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-content-primary">{SALON.rating}</span>
              <span className="text-[13px] text-content-subtle">({SALON.reviewCount} avaliações)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* ── Greeting + next appointment ── */}
        <section aria-labelledby="greeting-heading">
          <p id="greeting-heading" className="text-[16px] font-semibold text-content-primary">
            Olá, {CLIENT.name.split(' ')[0]}! 👋
          </p>

          {next ? (
            <div className="mt-3 rounded-2xl border border-primary-light bg-primary-xlight p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-primary">Próximo agendamento</p>
                  <p className="mt-2 text-[15px] font-semibold text-content-primary">
                    {next.serviceEmoji} {next.service}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-content-secondary">
                    <Calendar size={12} aria-hidden="true" />
                    {next.dateLabel}
                  </p>
                  <p className="mt-0.5 text-[13px] text-content-secondary">👤 {next.professional}</p>
                </div>
                <button
                  type="button"
                  onClick={() => cancelAppointment(next.id)}
                  aria-label="Fechar lembrete de agendamento"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary-light active:bg-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={15} className="text-content-subtle" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/booking/meus-agendamentos"
                  className="flex-1 rounded-xl border border-primary py-3 text-center text-[13px] font-medium text-primary transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  Ver detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => cancelAppointment(next.id)}
                  className="flex-1 rounded-xl border border-danger-border bg-white py-3 text-[13px] font-medium text-danger-medium transition-colors hover:bg-danger-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-border"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-border bg-background px-4 py-5 text-center">
              <p className="text-body text-content-subtle">Nenhum agendamento próximo</p>
              <Link href="/booking/agendar" className="mt-2 inline-block text-[13px] font-medium text-primary">
                Agendar agora →
              </Link>
            </div>
          )}
        </section>

        {/* ── Popular services — list layout avoids identical card grid ── */}
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="mb-3 text-[15px] font-semibold text-content-primary">
            Serviços populares
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-border" role="list">
            {POPULAR_SERVICES.map((svc, i) => (
              <Link
                key={svc.id}
                href="/booking/agendar"
                role="listitem"
                className={cn(
                  'flex items-center gap-3 bg-white px-4 py-3.5 transition-colors',
                  'hover:bg-primary-xlight active:bg-primary-light',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
                  'animate-fade-in motion-reduce:animate-none',
                  i < POPULAR_SERVICES.length - 1 && 'border-b border-background-secondary',
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-xlight text-[20px]"
                  aria-hidden="true"
                >
                  {svc.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-content-primary">{svc.name}</p>
                  <p className="mt-0.5 text-small text-content-subtle">{formatDuration(svc.durationMins)}</p>
                </div>
                <span className="shrink-0 text-[14px] font-semibold text-primary">
                  {formatPrice(svc.price)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <Link
          href="/booking/agendar"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4',
            'text-[15px] font-semibold text-white',
            'transition-all hover:bg-primary-dark active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          + Agendar agora
        </Link>

        {/* ── Reviews — divider list avoids identical card grid ── */}
        <section aria-labelledby="reviews-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="reviews-heading" className="text-[15px] font-semibold text-content-primary">
              Avaliações recentes
            </h2>
            <span className="flex items-center gap-1 text-[13px] font-medium text-content-subtle">
              <Star size={12} className="fill-warning text-warning" aria-hidden="true" />
              {SALON.rating} · {SALON.reviewCount}
            </span>
          </div>
          <div className="space-y-4">
            {REVIEWS.map((rev, i) => (
              <div
                key={rev.id}
                className={cn(
                  'pb-4 animate-fade-in motion-reduce:animate-none',
                  i < REVIEWS.length - 1 && 'border-b border-background-secondary',
                )}
                style={{ animationDelay: `${i * 60 + 200}ms` }}
              >
                <div className="mb-1.5 flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} size={12} className="fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-content-primary">"{rev.text}"</p>
                <p className="mt-1.5 text-small text-content-subtle">
                  — {rev.clientName} · {rev.service}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
