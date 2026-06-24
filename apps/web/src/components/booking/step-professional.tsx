'use client'

import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFESSIONALS, formatDuration, formatPrice, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

const ANIM = `
  @keyframes bkFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bk-s { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`

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
      <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
      <span className="text-[12px] font-medium text-[#0F172A]">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function StepProfessional({ service, onSelect, onBack }: StepProfessionalProps) {
  return (
    <div className="flex flex-col">
      <style>{ANIM}</style>

      {/* Back header */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 text-[14px] text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE] rounded-lg"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{service.emoji} {service.name}</span>
        <span className="ml-1 text-[#64748B]">· {formatDuration(service.durationMins)} · {formatPrice(service.price)}</span>
      </button>

      <div className="px-4 pb-4">
        <h2 className="text-[18px] font-semibold text-[#0F172A]">Escolha o profissional</h2>
      </div>

      <div className="flex-1">
        {PROFESSIONALS.map((pro, i) => (
          <button
            key={pro.id}
            type="button"
            onClick={() => onSelect(pro)}
            className={cn(
              'bk-s flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
              'hover:bg-[#F8FAFC] active:bg-[#EFF6FF]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
              i < PROFESSIONALS.length - 1 && 'border-b border-[#F1F5F9]',
            )}
            style={{ animation: `bkFadeUp 220ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}
          >
            <Avatar initials={pro.initials} bg={pro.avatarBg} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-medium text-[#0F172A]">{pro.name}</p>
                {pro.rating > 0 && <StarRating rating={pro.rating} />}
              </div>
              <p className="mt-0.5 text-[13px] text-[#64748B]">
                {pro.role}
                {pro.reviews > 0 && (
                  <span className="text-[#64748B]"> · {pro.reviews} avaliações</span>
                )}
              </p>
              <p className="mt-0.5 text-[12px] text-[#2563EB]">
                Próximo: {pro.nextAvailable}
              </p>
            </div>

            <ChevronRight size={18} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
