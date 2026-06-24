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

// Initials from first two words
const SALON_INITIALS = SALON.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0] ?? '')
  .join('')
  .toUpperCase()

function SalonLogo({ size, hasBorder }: { size: 'sm' | 'lg'; hasBorder?: boolean }) {
  const dim   = size === 'lg' ? 'h-16 w-16 text-[18px]' : 'h-12 w-12 text-[14px]'
  const border = hasBorder ? 'ring-2 ring-white shadow-md' : ''

  if (SALON.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={SALON.logoUrl}
        alt={`Logo ${SALON.name}`}
        className={cn('shrink-0 rounded-full object-cover', dim, border)}
      />
    )
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white', dim, border)}
      style={{ backgroundColor: SALON.primaryColor }}
      aria-hidden="true"
    >
      {SALON_INITIALS}
    </div>
  )
}

function NotificationBell({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/booking/notificacoes"
      aria-label={`Notificações${unread > 0 ? ` — ${unread} não lidas` : ''}`}
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        inverted
          ? 'text-white/80 hover:bg-white/20 focus-visible:ring-white/40'
          : 'text-content-secondary hover:bg-primary-xlight hover:text-primary focus-visible:ring-primary-light',
      )}
    >
      <Bell size={20} aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-medium text-[9px] font-bold text-white" aria-hidden="true">
          {unread}
        </span>
      )}
    </Link>
  )
}

export default function BookingHomePage() {
  return (
    <div className="flex min-h-full flex-col">

      {/* ── Salon header ── */}
      {SALON.coverUrl ? (
        /* ─ WITH cover image ─ */
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SALON.coverUrl} alt="" role="presentation" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden="true" />
          <div className="absolute right-4 top-4">
            <NotificationBell inverted />
          </div>
          <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
            <div className="flex items-center gap-3">
              <SalonLogo size="lg" hasBorder />
              <div className="min-w-0">
                <h1 className="text-[18px] font-bold leading-tight text-white drop-shadow-sm">{SALON.name}</h1>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Star size={12} className="fill-warning text-warning" aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-white">{SALON.rating}</span>
                  <span className="text-[12px] text-white/80">· {SALON.reviewCount} avaliações</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─ WITHOUT cover image ─ */
        <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-5 pt-6">
          <div className="flex items-start gap-3">
            <SalonLogo size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-h2 font-bold text-content-primary">{SALON.name}</h1>
                <NotificationBell />
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Star size={12} className="fill-warning text-warning" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-content-primary">{SALON.rating}</span>
                <span className="text-[13px] text-content-subtle">· {SALON.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
