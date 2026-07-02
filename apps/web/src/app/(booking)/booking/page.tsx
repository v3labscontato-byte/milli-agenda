'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, Calendar } from 'lucide-react'
import { usePublicTenant } from '@/hooks/use-public-tenant'
import { useBookingClient } from '@/hooks/use-booking-client'
import { UPCOMING_APPOINTMENTS, NOTIFICACOES } from '@/lib/booking-mock'
import { fetchPublicProfessionals, TENANT_SLUG } from '@/lib/api/public-booking'

const unread = NOTIFICACOES.filter((n) => !n.read).length

const QUICK_ACCESS = [
  { emoji: '✂️', label: 'Serviços',        href: '/booking/agendar',    highlight: false },
  { emoji: '🏷️', label: 'Promoções',       href: '/booking/promocoes',  highlight: true  },
  { emoji: '🤝', label: 'Indique e ganhe', href: '/booking/afiliados',  highlight: false },
  { emoji: '⭐', label: 'Meus pontos',     href: '/booking/fidelidade', highlight: false },
]

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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.855L.057 23.882l6.195-1.627A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.869 9.869 0 01-5.031-1.377l-.361-.214-3.735.979 1.001-3.656-.235-.374A9.86 9.86 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/>
    </svg>
  )
}

type ProfCard = {
  id: string
  name: string
  role: string
  rating: number | null
  initials: string
  avatarUrl: string | null
}

export default function BookingHomePage() {
  const { tenant: tenantData, loading } = usePublicTenant()
  const { client } = useBookingClient()

  const primaryColor = tenantData?.primaryColor ?? '#81736f'
  const salonName    = tenantData?.name ?? ''
  const salonAddress = tenantData?.address
    ? [tenantData.address, tenantData.city].filter(Boolean).join(' — ')
    : ''
  const tenantPhone  = (tenantData?.phone ?? '').replace(/\D/g, '')
  const whatsappHref = tenantPhone ? `https://wa.me/55${tenantPhone}` : null
  const firstName    = (client?.name ?? 'você').split(' ')[0]
  const next         = UPCOMING_APPOINTMENTS[0] ?? null

  const [professionals, setProfessionals] = useState<ProfCard[]>([])
  const [activeCard, setActiveCard] = useState(0)

  const carouselRef   = useRef<HTMLDivElement>(null)
  const activeCardRef = useRef(0)
  const isPausedRef   = useRef(false)

  function handleCarouselScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth)
    const idx = Math.round(pct * 3)
    setActiveCard(idx)
    activeCardRef.current = idx
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return
      const next = activeCardRef.current >= 3 ? 0 : activeCardRef.current + 1
      const el = carouselRef.current
      if (el) el.scrollTo({ left: next * (150 + 12), behavior: 'smooth' })
      setActiveCard(next)
      activeCardRef.current = next
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchPublicProfessionals(TENANT_SLUG)
      .then((data) => {
        if (data.length > 0) {
          setProfessionals(
            data.slice(0, 6).map((p) => ({
              id: p.id,
              name: p.name,
              role: p.specialty ?? 'Especialista',
              rating: null,
              initials: getInitials(p.name),
              avatarUrl: p.avatarUrl,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex min-h-full flex-col">

      {/* ── Header fixo ── */}
      <div
        className="sticky top-0 z-10 px-[14px] pb-3 pt-4"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? (
          <div className="animate-pulse space-y-2 py-0.5">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
              <div className="h-9 w-9 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="h-3 w-48 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <div className="h-3 w-28 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-[16px] font-bold text-white" style={{ letterSpacing: '0.3px' }}>
                {salonName}
              </h1>
              <Link
                href="/booking/notificacoes"
                aria-label={`Notificações${unread > 0 ? ` — ${unread} não lidas` : ''}`}
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-100 active:scale-90"
                style={{ color: 'rgba(255,255,255,0.85)' }}
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

            {salonAddress && (
              <p className="mt-0.5 text-[11px] text-white/70">{salonAddress}</p>
            )}

            <p className="mt-1.5 text-[14px] font-medium text-white/85">
              Olá, {firstName}! 👋
            </p>
          </>
        )}
      </div>

      {/* ── Conteúdo scrollável ── */}
      <div className="flex-1 bg-[var(--bk-surface)]">

        {/* Próximo agendamento */}
        <div className="px-[14px] pt-4">
          <Link
            href="/booking/meus-agendamentos"
            className="block rounded-[8px] border border-[var(--bk-border)] bg-white px-4 py-3 transition-transform duration-100 hover:border-[var(--bk-border-hover)] active:scale-[0.98]"
            style={{ boxShadow: '0px 2px 48px rgba(0,0,0,0.04)' }}
          >
            {next ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-[var(--bk-muted)]">Próximo agendamento</p>
                  <p className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                    {getRelativeDate(next.date)}
                  </p>
                </div>
                <p className="mt-1 text-[14px] font-semibold text-[var(--bk-ink)]">
                  {next.serviceEmoji} {next.service}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--bk-muted)]">
                  {next.startTime} · {next.professional}
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[var(--bk-ink)]">📅 Sem agendamento próximo</p>
                <p className="mt-0.5 text-[12px] text-[var(--bk-muted)]">
                  Toque para ver histórico ou agendar →
                </p>
              </>
            )}
          </Link>
        </div>

        {/* Acesso rápido */}
        <div className="pt-5">
          <p className="px-[14px] text-[9px] font-semibold uppercase tracking-widest text-[#94A3B8]">
            Acesso rápido
          </p>
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            onTouchStart={() => { isPausedRef.current = true }}
            onTouchEnd={() => { setTimeout(() => { isPausedRef.current = false }, 5000) }}
            className="mt-2.5 flex gap-3 overflow-x-auto px-[14px] pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {QUICK_ACCESS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border transition-transform duration-100 active:scale-95"
                style={{
                  width: 150,
                  height: 90,
                  borderColor: item.highlight ? primaryColor : '#E2E8F0',
                  backgroundColor: item.highlight ? primaryColor : '#ffffff',
                }}
              >
                <span className="text-[26px] leading-none">{item.emoji}</span>
                <span
                  className="text-center text-[12px] font-semibold leading-tight"
                  style={{ color: item.highlight ? '#ffffff' : 'var(--bk-ink)' }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-[5px]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[6px] rounded-full transition-all duration-200"
                style={{
                  width: activeCard === i ? 18 : 6,
                  background: activeCard === i ? primaryColor : '#E2E8F0',
                }}
              />
            ))}
          </div>
        </div>

        {/* Profissionais */}
        {professionals.length > 0 && (
          <div className="pb-4 pt-5">
            <h2 className="px-[14px] text-[14px] font-semibold text-[var(--bk-ink)]">Profissionais</h2>
            <div
              className="mt-3 flex gap-4 overflow-x-auto px-[14px] pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {professionals.map((pro) => (
                <Link
                  key={pro.id}
                  href="/booking/agendar"
                  className="flex shrink-0 flex-col items-center gap-1 transition-transform duration-100 active:scale-95"
                >
                  {pro.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pro.avatarUrl}
                      alt={pro.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {pro.initials}
                    </div>
                  )}
                  <p className="mt-0.5 max-w-[68px] truncate text-center text-[10px] font-semibold text-[var(--bk-ink)]">
                    {pro.name.split(' ')[0]}
                  </p>
                  {pro.rating !== null ? (
                    <p className="flex items-center gap-0.5 text-[9px] text-[#64748B]">
                      <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true">
                        <path fill="#F59E0B" d="M6 0l1.545 3.13 3.455.502-2.5 2.436.59 3.44L6 7.88l-3.09 1.628.59-3.44L1 3.632l3.455-.502z"/>
                      </svg>
                      {pro.rating.toFixed(1)}
                    </p>
                  ) : (
                    <p className="max-w-[68px] truncate text-center text-[9px] leading-tight text-[var(--bk-muted)]">
                      {pro.role}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer fixo ── */}
      <div
        className="sticky bottom-0 flex gap-2 bg-white px-3 py-2.5"
        style={{ borderTop: '1px solid #E2E8F0' }}
      >
        <Link
          href="/booking/agendar"
          className="flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] text-[14px] font-semibold text-white transition-all active:scale-[0.97]"
          style={{ backgroundColor: primaryColor }}
        >
          <Calendar size={16} aria-hidden="true" />
          Agendar agora
        </Link>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contato via WhatsApp"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#25D366' }}
          >
            <WhatsAppIcon />
          </a>
        )}
      </div>
    </div>
  )
}
