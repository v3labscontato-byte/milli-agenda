'use client'

import Link from 'next/link'
import { Star, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SALON, CLIENT, UPCOMING_APPOINTMENTS, NOTIFICACOES,
  getLoyaltyConfig,
} from '@/lib/booking-mock'
import HomeCarousel from '@/components/booking/home-carousel'

const loyaltyCfg = getLoyaltyConfig(CLIENT.pontos)
const next   = UPCOMING_APPOINTMENTS[0] ?? null
const unread = NOTIFICACOES.filter((n) => !n.read).length

function getRelativeDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  if (diff <= 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `Em ${diff} dias`
}

export default function BookingHomePage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* ── Salon header ── */}
      <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-5 pt-6">
        <div className="flex items-start gap-3">
          <span className="text-[38px] leading-none" aria-hidden="true">{SALON.emoji}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-h2 font-bold text-content-primary">{SALON.name}</h1>
            <p className="mt-0.5 text-[13px] text-content-secondary">{SALON.address}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Star size={13} className="fill-warning text-warning" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-content-primary">{SALON.rating}</span>
              <span className="text-[13px] text-content-subtle">({SALON.reviewCount} avaliações)</span>
            </div>
          </div>
          <Link
            href="/booking/notificacoes"
            aria-label={`Notificações${unread > 0 ? ` — ${unread} não lidas` : ''}`}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-primary-xlight hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <Bell size={20} aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-medium text-[9px] font-bold text-white" aria-hidden="true">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Greeting + compact summary card ── */}
      <div className="px-5 pb-4 pt-4">
        <p className="mb-3 text-[16px] font-semibold text-content-primary">
          Olá, {CLIENT.name.split(' ')[0]}! 👋
        </p>

        <Link
          href="/booking/meus-agendamentos"
          aria-label="Ver meus agendamentos e fidelidade"
          className={cn(
            'block rounded-2xl border border-primary-light bg-primary-xlight px-4 py-3',
            'transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold text-content-primary">
              {loyaltyCfg.emoji} {CLIENT.pontos.toLocaleString('pt-BR')} pts · {loyaltyCfg.label}
            </p>
            {next && (
              <p className="shrink-0 text-[11px] font-medium text-primary">
                {getRelativeDate(next.date)}
              </p>
            )}
          </div>
          {next ? (
            <p className="mt-1 truncate text-[12px] text-content-secondary">
              Próximo: {next.serviceEmoji} {next.service} {next.startTime} c/ {next.professional}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-content-subtle">Nenhum agendamento próximo · Agendar →</p>
          )}
        </Link>
      </div>

      {/* ── Carousel ── */}
      <div className="flex-1">
        <HomeCarousel />
      </div>

      {/* ── Sticky CTA ── */}
      <div className="sticky bottom-[72px] border-t border-background-secondary bg-white/95 px-5 py-3 backdrop-blur-sm">
        <Link
          href="/booking/agendar"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4',
            'text-[15px] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          + Agendar agora
        </Link>
      </div>
    </div>
  )
}
