'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BookingService, type BookingProfessional } from '@/lib/booking-mock'
import { fetchPublicProfessionals, TENANT_SLUG } from '@/lib/api/public-booking'

interface StepProfessionalProps {
  service: BookingService
  onSelect: (professional: BookingProfessional) => void
  onBack: () => void
}

function Avatar({ name, avatarUrl, initials, bg, size = 44 }: { name: string; avatarUrl?: string | null; initials?: string; bg?: string; size?: number }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  const fallbackInitials = initials ?? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const fallbackBg = bg ?? '#2563EB'
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
      style={{ width: size, height: size, backgroundColor: fallbackBg }}
      aria-hidden="true"
    >
      {fallbackInitials}
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={12} className="fill-warning text-warning" aria-hidden="true" />
      <span className="text-[12px] font-medium text-content-primary">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function StepProfessional({ service, onSelect, onBack }: StepProfessionalProps) {
  const [professionals, setProfessionals] = useState<BookingProfessional[]>([])
  const [loading, setLoading] = useState(true)

  const durationLabel = service.durationMins >= 60
    ? `${Math.floor(service.durationMins / 60)}h${service.durationMins % 60 ? ` ${service.durationMins % 60}min` : ''}`
    : `${service.durationMins}min`
  const priceLabel = service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  useEffect(() => {
    fetchPublicProfessionals(TENANT_SLUG, service.id)
      .then((data) =>
        setProfessionals(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.specialty ?? 'Profissional',
            workDays: p.workDays,
          })),
        ),
      )
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [service.id])

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-[44px] items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{service.emoji ?? ''} {service.name}</span>
        <span className="ml-1 text-content-subtle">· {durationLabel} · {priceLabel}</span>
      </button>

      <div className="px-4 pb-4">
        <h2 className="text-[18px] font-semibold text-content-primary">Escolha o profissional</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-[15px] font-medium text-content-primary">Nenhum profissional disponível</p>
          <p className="mt-1 text-[13px] text-content-subtle">Tente outro serviço ou entre em contato.</p>
        </div>
      ) : (
        <div className="flex-1">
          {professionals.map((pro, i) => (
            <button
              key={pro.id}
              type="button"
              onClick={() => onSelect(pro)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
                'hover:bg-background active:bg-primary-xlight',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
                'animate-fade-in motion-reduce:animate-none',
                i < professionals.length - 1 && 'border-b border-background-secondary',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Avatar name={pro.name} initials={pro.initials} bg={pro.avatarBg} size={44} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-content-primary">{pro.name}</p>
                  {(pro.rating ?? 0) > 0 && <StarRating rating={pro.rating!} />}
                </div>
                <p className="mt-0.5 text-[13px] text-content-subtle">
                  {pro.role}
                  {(pro.reviews ?? 0) > 0 && <span> · {pro.reviews} avaliações</span>}
                </p>
              </div>

              <ChevronRight size={18} className="shrink-0 text-content-muted" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
