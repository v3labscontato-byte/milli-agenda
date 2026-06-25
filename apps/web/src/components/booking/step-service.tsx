'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronRight, Camera, X } from 'lucide-react'
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

function PhotoGallerySheet({ service, onClose }: { service: BookingService; onClose: () => void }) {
  const photos = service.photos ?? []
  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label={`Fotos de ${service.name}`}>
      <div className="absolute inset-0 bg-[#0F172A]/60" onClick={onClose} aria-hidden="true" />
      <div className="relative mt-auto flex max-h-[80vh] flex-col rounded-t-2xl bg-white">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-content-primary">{service.name}</p>
            <p className="text-[12px] text-content-subtle">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar galeria"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto p-4">
          {photos.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${service.name} — foto ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StepService({ onSelect }: StepServiceProps) {
  const [query, setQuery]           = useState('')
  const [selectedCat, setSelectedCat] = useState('') // '' = Todos
  const [galleryService, setGalleryService] = useState<BookingService | null>(null)

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
    <>
    {galleryService && (
      <PhotoGallerySheet service={galleryService} onClose={() => setGalleryService(null)} />
    )}
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
                const hasPhotos = (svc.photos?.length ?? 0) > 0
                return (
                  <div
                    key={svc.id}
                    className={cn(
                      'flex items-center animate-fade-in motion-reduce:animate-none',
                      i < services.length - 1 && 'border-b border-background-secondary',
                    )}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(svc)}
                      className={cn(
                        'flex flex-1 items-center gap-3 px-4 py-4 text-left transition-colors',
                        'hover:bg-background active:bg-primary-xlight',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light',
                      )}
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
                    {hasPhotos && (
                      <button
                        type="button"
                        onClick={() => setGalleryService(svc)}
                        aria-label={`Ver ${svc.photos!.length} foto${svc.photos!.length !== 1 ? 's' : ''} de ${svc.name}`}
                        className={cn(
                          'mr-3 flex shrink-0 items-center gap-1 rounded-full bg-background px-2.5 py-1.5',
                          'text-[12px] font-medium text-content-secondary transition-colors',
                          'hover:bg-primary-xlight hover:text-primary',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
                        )}
                      >
                        <Camera size={12} aria-hidden="true" />
                        {svc.photos!.length}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        })()}
      </div>
    </div>
    </>
  )
}
