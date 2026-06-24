'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ChevronRight, Calendar, X } from 'lucide-react'
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
      <div className="bg-gradient-to-b from-[#EFF6FF] to-white px-5 pb-5 pt-6">
        <div className="flex items-start gap-3">
          <span className="text-[38px] leading-none" aria-hidden="true">{SALON.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-[#0F172A]">{SALON.name}</h1>
            <p className="mt-0.5 text-[13px] text-[#475569]">{SALON.address}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#0F172A]">{SALON.rating}</span>
              <span className="text-[13px] text-[#94A3B8]">({SALON.reviewCount} avaliações)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* ── Greeting + next appointment ── */}
        <section aria-labelledby="greeting-heading">
          <p id="greeting-heading" className="text-[16px] font-semibold text-[#0F172A]">
            Olá, {CLIENT.name.split(' ')[0]}! 👋
          </p>

          {next ? (
            <div className="mt-3 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
                    Próximo agendamento
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-[#0F172A]">
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
                  aria-label="Cancelar agendamento"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#DBEAFE]"
                >
                  <X size={15} className="text-[#64748B]" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/booking/meus-agendamentos"
                  className="flex-1 rounded-lg border border-[#2563EB] py-2 text-center text-[13px] font-medium text-[#2563EB] hover:bg-[#DBEAFE]"
                >
                  Ver detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => cancelAppointment(next.id)}
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2 text-[13px] font-medium text-[#475569] hover:border-[#DC2626] hover:text-[#DC2626]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5 text-center">
              <p className="text-[14px] text-[#64748B]">Nenhum agendamento próximo</p>
              <Link
                href="/booking/agendar"
                className="mt-2 inline-block text-[13px] font-medium text-[#2563EB]"
              >
                Agendar agora →
              </Link>
            </div>
          )}
        </section>

        {/* ── Popular services ── */}
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="mb-3 text-[15px] font-semibold text-[#0F172A]">
            Serviços populares
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {POPULAR_SERVICES.map((svc) => (
              <Link
                key={svc.id}
                href="/booking/agendar"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-4 text-center transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]"
              >
                <span className="text-[26px]" aria-hidden="true">{svc.emoji}</span>
                <span className="text-[12px] font-medium leading-tight text-[#0F172A]">{svc.name}</span>
                <span className="text-[12px] font-semibold text-[#2563EB]">{formatPrice(svc.price)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <Link
          href="/booking/agendar"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] py-4 text-[15px] font-semibold text-white shadow-[0_4px_14px_0_rgb(37_99_235/0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          + Agendar agora
        </Link>

        {/* ── Reviews ── */}
        <section aria-labelledby="reviews-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="reviews-heading" className="text-[15px] font-semibold text-[#0F172A]">
              Avaliações recentes
            </h2>
            <span className="flex items-center gap-1 text-[13px] font-medium text-[#64748B]">
              <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              {SALON.rating} · {SALON.reviewCount}
            </span>
          </div>
          <div className="space-y-3">
            {REVIEWS.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={12} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-[14px] text-[#0F172A]">"{rev.text}"</p>
                <p className="mt-1.5 text-[12px] text-[#94A3B8]">
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
