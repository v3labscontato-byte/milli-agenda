'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICES, formatDuration, formatPrice, type BookingService } from '@/lib/booking-mock'

const ANIM = `
  @keyframes bkFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bk-s { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`

const CATEGORY_LABELS: Record<string, string> = {
  CABELO:   'Cabelo',
  UNHAS:    'Unhas',
  ESTÉTICA: 'Estética',
}

interface StepServiceProps {
  onSelect: (service: BookingService) => void
}

export default function StepService({ onSelect }: StepServiceProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return q ? SERVICES.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : SERVICES
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, BookingService[]>()
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, [])
      map.get(s.category)!.push(s)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col">
      <style>{ANIM}</style>

      <div className="px-4 pb-3 pt-1">
        <h2 className="text-[18px] font-semibold text-[#0F172A]">Escolha o serviço</h2>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <label htmlFor="svc-search" className="sr-only">Buscar serviço</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" aria-hidden="true" />
          <input
            id="svc-search"
            type="search"
            placeholder="Buscar serviço..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-9 pr-4 text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
          />
        </div>
      </div>

      {/* Grouped list */}
      <div className="flex-1">
        {grouped.size === 0 && (
          <p className="px-4 py-8 text-center text-[14px] text-[#64748B]">Nenhum serviço encontrado.</p>
        )}
        {(() => {
          // Flat stagger index across all category groups
          let staggerIdx = 0
          return Array.from(grouped.entries()).map(([cat, services]) => (
            <div key={cat}>
              <div className="bg-[#F8FAFC] px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
              </div>
              {services.map((svc, i) => {
                const idx = staggerIdx++
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => onSelect(svc)}
                    className={cn(
                      'bk-s flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
                      'hover:bg-[#F8FAFC] active:bg-[#EFF6FF]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                      i < services.length - 1 && 'border-b border-[#F1F5F9]',
                    )}
                    style={{ animation: `bkFadeUp 220ms cubic-bezier(0.16,1,0.3,1) ${idx * 40}ms both` }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[20px]" aria-hidden="true">
                      {svc.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-[#0F172A]">{svc.name}</p>
                      <p className="mt-0.5 text-[13px] text-[#64748B]">
                        {formatDuration(svc.durationMins)} · {formatPrice(svc.price)}
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          ))
        })()}
      </div>
    </div>
  )
}
