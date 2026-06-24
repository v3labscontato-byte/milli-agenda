'use client'

import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFESSIONALS, formatDuration, formatPrice, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

interface StepProfessionalProps {
  service: BookingService
  onSelect: (professional: BookingProfessional) => void
  onBack: () => void
}

function Avatar({ initials, bg, size = 44 }: { initials: string; bg: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-hidden="true"
    >
      {initials}
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
  return (
    <div className="flex flex-col">
      {/* Back header */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{service.emoji} {service.name}</span>
        <span className="ml-1 text-content-subtle">· {formatDuration(service.durationMins)} · {formatPrice(service.price)}</span>
      </button>

      <div className="px-4 pb-4">
        <h2 className="text-[18px] font-semibold text-content-primary">Escolha o profissional</h2>
      </div>

      <div className="flex-1">
        {PROFESSIONALS.map((pro, i) => (
          <button
            key={pro.id}
            type="button"
            onClick={() => onSelect(pro)}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
              'hover:bg-background active:bg-primary-xlight',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
              'animate-fade-in motion-reduce:animate-none',
              i < PROFESSIONALS.length - 1 && 'border-b border-background-secondary',
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Avatar initials={pro.initials} bg={pro.avatarBg} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-medium text-content-primary">{pro.name}</p>
                {pro.rating > 0 && <StarRating rating={pro.rating} />}
              </div>
              <p className="mt-0.5 text-[13px] text-content-subtle">
                {pro.role}
                {pro.reviews > 0 && <span> · {pro.reviews} avaliações</span>}
              </p>
              <p className="mt-0.5 text-[12px] text-primary">
                Próximo: {pro.nextAvailable}
              </p>
            </div>

            <ChevronRight size={18} className="shrink-0 text-content-muted" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
