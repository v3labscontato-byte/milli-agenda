'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICES, formatDuration, formatPrice, type BookingService } from '@/lib/booking-mock'

const CATEGORY_LABELS: Record<string, string> = {
  CABELO:   'Cabelo',
  UNHAS:    'Unhas',
  ESTÉTICA: 'Estética',
  BARBA:    'Barba',
}

const CATEGORY_ICONS: Record<string, string> = {
  CABELO:   '✂',
  UNHAS:    '💅',
  ESTÉTICA: '🌿',
  BARBA:    '🪒',
}

const CATEGORY_ORDER = ['CABELO', 'UNHAS', 'ESTÉTICA', 'BARBA']

// Derive available categories from the mock in preferred order
const CATEGORIES = CATEGORY_ORDER.filter((cat) => SERVICES.some((s) => s.category === cat))

interface StepServiceProps {
  onSelect: (service: BookingService) => void
}

export default function StepService({ onSelect }: StepServiceProps) {
  const [query, setQuery]           = useState('')
  const [selectedCat, setSelectedCat] = useState('') // '' = Todos

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let result = selectedCat ? SERVICES.filter((s) => s.category === selectedCat) : SERVICES
    if (q) result = result.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
    return result
  }, [query, selectedCat])

  const grouped = useMemo(() => {
    const map = new Map<string, BookingService[]>()
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, [])
      map.get(s.category)!.push(s)
    }
    return map
  }, [filtered])

  const pillCls = (active: boolean) => cn(
    'flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
    active
      ? 'bg-primary text-white'
      : 'border border-border bg-white text-content-secondary hover:border-primary-light hover:text-primary',
  )

  return (
    <div className="flex flex-col">
      <div className="px-4 pb-3 pt-1">
        <h2 className="text-[18px] font-semibold text-content-primary">Escolha o serviço</h2>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <label htmlFor="svc-search" className="sr-only">Buscar serviço</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" aria-hidden="true" />
          <input
            id="svc-search"
            type="search"
            placeholder="Buscar serviço..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 text-body text-content-primary placeholder:text-content-subtle focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      {/* Category pills */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-4"
        role="group"
        aria-label="Filtrar por categoria"
      >
        <button
          type="button"
          onClick={() => setSelectedCat('')}
          aria-pressed={selectedCat === ''}
          className={pillCls(selectedCat === '')}
        >
          ✨ Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(selectedCat === cat ? '' : cat)}
            aria-pressed={selectedCat === cat}
            className={pillCls(selectedCat === cat)}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Grouped list — key forces remount on category change, restarting stagger animations */}
      <div key={selectedCat} className="flex-1">
        {grouped.size === 0 && (
          <p className="px-4 py-8 text-center text-body text-content-subtle">
            Nenhum serviço encontrado.
          </p>
        )}
        {(() => {
          let staggerIdx = 0
          return Array.from(grouped.entries()).map(([cat, services]) => (
            <div key={cat}>
              <div className="bg-background px-4 py-2">
                <p className="text-caption text-content-subtle">
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
                      'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
                      'hover:bg-background active:bg-primary-xlight',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
                      'animate-fade-in motion-reduce:animate-none',
                      i < services.length - 1 && 'border-b border-background-secondary',
                    )}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-xlight text-[20px]" aria-hidden="true">
                      {svc.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-content-primary">{svc.name}</p>
                      <p className="mt-0.5 text-[13px] text-content-subtle">
                        {formatDuration(svc.durationMins)} · {formatPrice(svc.price)}
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-content-muted" aria-hidden="true" />
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
