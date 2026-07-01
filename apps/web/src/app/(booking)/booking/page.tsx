'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Star, ChevronRight } from 'lucide-react'
import { usePublicTenant } from '@/hooks/use-public-tenant'
import { useBookingClient } from '@/hooks/use-booking-client'
import {
  SALON as SALON_MOCK, CLIENT, UPCOMING_APPOINTMENTS, NOTIFICACOES,
  POPULAR_SERVICES, PROFESSIONALS, getLoyaltyConfig,
} from '@/lib/booking-mock'
import {
  fetchPublicServices, fetchPublicProfessionals, TENANT_SLUG,
} from '@/lib/api/public-booking'
import { FEATURES } from '@/lib/features'

const unread = NOTIFICACOES.filter((n) => !n.read).length

const CATEGORY_EMOJI: Record<string, string> = {
  CABELO: '✂️', UNHAS: '💅', ESTÉTICA: '🌿', BARBA: '🪒', OUTROS: '✨',
}

function getRelativeDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  if (diff <= 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `Em ${diff} dias`
}

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

type ServiceChip = { id: string; name: string; emoji: string }
type ProfCard = { id: string; name: string; role: string; initials: string; avatarBg: string | null; rating: number }

export default function BookingHomePage() {
  const { tenant: tenantData } = usePublicTenant()
  const tenant = FEATURES.realBooking ? tenantData : null
  const { client } = useBookingClient()

  const primaryColor  = tenantData?.primaryColor ?? '#81736f'
  const salonName     = tenant?.name ?? SALON_MOCK.name
  const salonAddress  = tenant?.address
    ? [tenant.address, tenant.city].filter(Boolean).join(' — ')
    : SALON_MOCK.address
  const coverUrl      = FEATURES.realBooking ? (tenant?.coverImageUrl ?? null) : (SALON_MOCK.coverUrl ?? null)
  const firstName     = (client?.name ?? 'você').split(' ')[0]

  const next       = UPCOMING_APPOINTMENTS[0] ?? null
  const loyaltyCfg = getLoyaltyConfig(CLIENT.pontos)

  const [services, setServices] = useState<ServiceChip[]>(
    POPULAR_SERVICES.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji ?? '✂️' })),
  )
  const [professionals, setProfessionals] = useState<ProfCard[]>(
    PROFESSIONALS.filter((p) => p.id !== 'pro-any').slice(0, 4).map((p) => ({
      id: p.id, name: p.name, role: p.role,
      initials: p.initials ?? getInitials(p.name),
      avatarBg: p.avatarBg ?? null,
      rating: p.rating ?? 0,
    })),
  )

  useEffect(() => {
    fetchPublicServices(TENANT_SLUG)
      .then((data) => {
        const cats = Array.from(new Set(data.map((s) => s.category?.name ?? 'OUTROS'))).slice(0, 5)
        if (cats.length > 0) {
          setServices(cats.map((cat, i) => ({
            id: `cat-${i}`,
            name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
            emoji: CATEGORY_EMOJI[cat.toUpperCase()] ?? '✨',
          })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchPublicProfessionals(TENANT_SLUG)
      .then((data) => {
        if (data.length > 0) {
          setProfessionals(data.slice(0, 4).map((p) => ({
            id: p.id, name: p.name, role: p.specialty ?? 'Especialista',
            initials: getInitials(p.name), avatarBg: null, rating: 0,
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white px-[14px] pb-3 pt-4">
        <h1 className="text-[20px] font-semibold text-[#2e2a2b]" style={{ letterSpacing: '0.5px' }}>
          Olá, {firstName}! 👋
        </h1>
        <Link
          href="/booking/notificacoes"
          aria-label={`Notificações${unread > 0 ? ` — ${unread} não lidas` : ''}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#9c9899] transition-colors hover:bg-[#f5f5f5]"
        >
          <Bell size={20} aria-hidden="true" />
          {unread > 0 && (
            <span
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              aria-hidden="true"
              style={{ backgroundColor: '#DC2626' }}
            >
              {unread}
            </span>
          )}
        </Link>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ height: 200, borderRadius: '0 0 16px 16px' }}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" role="presentation" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(to bottom, #C9B8A8, ${primaryColor})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 px-[14px] pb-4">
          <p className="text-[16px] font-bold text-white drop-shadow-sm">{salonName}</p>
          <div className="flex items-center gap-1.5">
            <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-white">{SALON_MOCK.rating}</span>
            <span className="text-[11px] text-white/80">· {salonAddress}</span>
          </div>
        </div>
      </div>

      {/* ── Próximo agendamento / Fidelidade ── */}
      <div className="px-[14px] pt-4">
        <Link
          href="/booking/meus-agendamentos"
          className="block rounded-[8px] border border-[#eaebec] bg-white px-4 py-3 transition-colors hover:border-[#d0cac9]"
          style={{ boxShadow: '0px 2px 48px rgba(0,0,0,0.04)' }}
        >
          {next ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-[#9c9899]">Próximo agendamento</p>
                <p className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                  {getRelativeDate(next.date)}
                </p>
              </div>
              <p className="mt-1 text-[14px] font-semibold text-[#2e2a2b]">
                {next.serviceEmoji} {next.service}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9c9899]">
                {next.startTime} · {next.professional}
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-[#2e2a2b]">
                {loyaltyCfg.emoji} {CLIENT.pontos.toLocaleString('pt-BR')} pts · {loyaltyCfg.label}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9c9899]">Nenhum agendamento próximo · Agendar →</p>
            </>
          )}
        </Link>
      </div>

      {/* ── Serviços populares ── */}
      <div className="pt-5">
        <div className="flex items-center justify-between px-[14px]">
          <h2 className="text-[16px] font-semibold text-[#2e2a2b]">Serviços</h2>
          <Link
            href="/booking/agendar"
            className="flex items-center gap-0.5 text-[12px] font-medium"
            style={{ color: primaryColor }}
          >
            Ver todos <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div
          className="mt-3 flex gap-4 overflow-x-auto px-[14px] pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {services.map((svc) => (
            <Link
              key={svc.id}
              href="/booking/agendar"
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[22px]"
                style={{ backgroundColor: `${primaryColor}1A` }}
              >
                {svc.emoji}
              </div>
              <span className="max-w-[64px] text-center text-[12px] font-medium leading-tight text-[#2e2a2b]">
                {svc.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Nossos profissionais ── */}
      <div className="pb-4 pt-5">
        <div className="px-[14px]">
          <h2 className="text-[16px] font-semibold text-[#2e2a2b]">Nossos profissionais</h2>
        </div>
        <div
          className="mt-3 flex gap-4 overflow-x-auto px-[14px] pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {professionals.map((pro) => (
            <Link
              key={pro.id}
              href="/booking/agendar"
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full text-[24px] font-bold text-white"
                style={{ backgroundColor: pro.avatarBg ?? primaryColor }}
              >
                {pro.initials}
              </div>
              <div className="max-w-[100px] text-center">
                <p className="truncate text-[14px] font-medium text-[#2e2a2b]">{pro.name}</p>
                <p className="text-[12px] text-[#9c9899]">{pro.role}</p>
                {pro.rating > 0 && (
                  <div className="flex items-center justify-center gap-0.5">
                    <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-[#2e2a2b]">{pro.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="sticky bottom-[70px] bg-white/95 px-[14px] py-3 backdrop-blur-sm"
        style={{ borderTop: '1px solid #f1f5f9' }}
      >
        <Link
          href="/booking/agendar"
          className="flex h-[48px] w-full items-center justify-center rounded-[24px] text-[15px] font-semibold text-white transition-all active:scale-[0.97]"
          style={{ backgroundColor: primaryColor }}
        >
          + Agendar agora
        </Link>
      </div>
    </div>
  )
}
