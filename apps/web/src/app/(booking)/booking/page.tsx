'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SALON, CLIENT, POPULAR_SERVICES, UPCOMING_APPOINTMENTS, REVIEWS,
  formatPrice, formatDuration, type BookingAppointment,
} from '@/lib/booking-mock'

const ANIM = `
  @keyframes bkFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bk-s { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`

export default function BookingHomePage() {
  const [upcoming, setUpcoming] = useState<BookingAppointment[]>(UPCOMING_APPOINTMENTS)
  const next = upcoming[0] ?? null

  function cancelAppointment(id: string) {
    setUpcoming((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex flex-col">
      <style>{ANIM}</style>

      {/* ── Salon header ── */}
      <div className="bg-gradient-to-b from-[#EFF6FF] to-white px-5 pb-5 pt-6">
        <div className="flex items-start gap-3">
          <span className="text-[38px] leading-none" aria-hidden="true">{SALON.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-[#0F172A]">{SALON.name}</h1>
            <p className="mt-0.5 text-[13px] text-[#475569]">{SALON.address}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#0F172A]">{SALON.rating}</span>
              <span className="text-[13px] text-[#64748B]">({SALON.reviewCount} avaliações)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* ── Greeting + next appointment ── */}
        <section aria-labelledby="greeting-heading">
          <p id="greeting-heading" className="text-[16px] font-semibold text-[#0F172A]">
            Olá, {CLIENT.name.split(' ')[0]}! 👋
          </p>

          {next ? (
            <div className="mt-3 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#2563EB]">Próximo agendamento</p>
                  <p className="mt-2 text-[15px] font-semibold text-[#0F172A]">
                    {next.serviceEmoji} {next.service}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#475569]">
                    <Calendar size={12} aria-hidden="true" />
                    {next.dateLabel}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#475569]">👤 {next.professional}</p>
                </div>
                <button
                  type="button"
                  onClick={() => cancelAppointment(next.id)}
                  aria-label="Fechar lembrete de agendamento"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#DBEAFE] active:bg-[#BFDBFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <X size={15} className="text-[#64748B]" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/booking/meus-agendamentos"
                  className="flex-1 rounded-xl border border-[#2563EB] py-3 text-center text-[13px] font-medium text-[#2563EB] transition-colors hover:bg-[#DBEAFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Ver detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => cancelAppointment(next.id)}
                  className="flex-1 rounded-xl border border-[#E2E8F0] bg-white py-3 text-[13px] font-medium text-[#475569] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCA5A5]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5 text-center">
              <p className="text-[14px] text-[#64748B]">Nenhum agendamento próximo</p>
              <Link href="/booking/agendar" className="mt-2 inline-block text-[13px] font-medium text-[#2563EB]">
                Agendar agora →
              </Link>
            </div>
          )}
        </section>

        {/* ── Popular services — list avoids identical card grid ── */}
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="mb-3 text-[15px] font-semibold text-[#0F172A]">
            Serviços populares
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#E2E8F0]" role="list">
            {POPULAR_SERVICES.map((svc, i) => (
              <Link
                key={svc.id}
                href="/booking/agendar"
                role="listitem"
                className={cn(
                  'bk-s flex items-center gap-3 bg-white px-4 py-3.5 transition-colors',
                  'hover:bg-[#EFF6FF] active:bg-[#DBEAFE]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                  i < POPULAR_SERVICES.length - 1 && 'border-b border-[#F1F5F9]',
                )}
                style={{ animation: `bkFadeUp 220ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[20px]"
                  aria-hidden="true"
                >
                  {svc.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#0F172A]">{svc.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#64748B]">{formatDuration(svc.durationMins)}</p>
                </div>
                <span className="shrink-0 text-[14px] font-semibold text-[#2563EB]">
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
            'flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] py-4',
            'text-[15px] font-semibold text-white',
            'transition-all hover:bg-[#1D4ED8] active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]',
          )}
        >
          + Agendar agora
        </Link>

        {/* ── Reviews — divider list avoids identical card grid ── */}
        <section aria-labelledby="reviews-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="reviews-heading" className="text-[15px] font-semibold text-[#0F172A]">
              Avaliações recentes
            </h2>
            <span className="flex items-center gap-1 text-[13px] font-medium text-[#64748B]">
              <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              {SALON.rating} · {SALON.reviewCount}
            </span>
          </div>
          <div className="space-y-4">
            {REVIEWS.map((rev, i) => (
              <div
                key={rev.id}
                className={cn(
                  'bk-s pb-4',
                  i < REVIEWS.length - 1 && 'border-b border-[#F1F5F9]',
                )}
                style={{ animation: `bkFadeUp 220ms cubic-bezier(0.16,1,0.3,1) ${i * 60 + 200}ms both` }}
              >
                <div className="mb-1.5 flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-[#0F172A]">"{rev.text}"</p>
                <p className="mt-1.5 text-[12px] text-[#64748B]">
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
