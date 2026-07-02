'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, ChevronRight, Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BookingService } from '@/lib/booking-mock'
import { fetchPublicServices, TENANT_SLUG } from '@/lib/api/public-booking'

const CATEGORY_ICONS: Record<string, string> = {
  CABELO:      '✂',
  UNHAS:       '💅',
  ESTÉTICA:    '🌿',
  BARBA:       '🪒',
  SOBRANCELHA: '👁️',
  MASSAGEM:    '💆',
  MAQUIAGEM:   '💄',
}

function categoryIcon(name: string): string {
  return CATEGORY_ICONS[name.toUpperCase()] ?? '✨'
}

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
  const [services, setServices]     = useState<BookingService[]>([])
  const [loading, setLoading]       = useState(true)
  const [query, setQuery]           = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [galleryService, setGalleryService] = useState<BookingService | null>(null)

  useEffect(() => {
    fetchPublicServices(TENANT_SLUG)
      .then((data) =>
        setServices(
          data.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description ?? undefined,
            category: s.category?.name ?? 'Outros',
            durationMins: s.durationMin,
            price: Number(s.price),
          })),
        ),
      )
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let result = selectedCat ? services.filter((s) => s.category === selectedCat) : services
    if (q) result = result.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
    return result
  }, [query, selectedCat, services])

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

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6" role="status" aria-label="Carregando serviços...">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F1F5F9]" />
        ))}
      </div>
    )
  }

  return (
    <>
    {galleryService && (
      <PhotoGallerySheet service={galleryService} onClose={() => setGalleryService(null)} />
    )}
    <div className="flex flex-col">
      <div className="px-4 pb-3 pt-1">
        <h2 className="text-[18px] font-semibold text-content-primary">Escolha o serviço</h2>
      </div>

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

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4" role="group" aria-label="Filtrar por categoria">
          <button type="button" onClick={() => setSelectedCat('')} aria-pressed={selectedCat === ''} className={pillCls(selectedCat === '')}>
            ✨ Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(selectedCat === cat ? '' : cat)}
              aria-pressed={selectedCat === cat}
              className={pillCls(selectedCat === cat)}
            >
              {categoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      )}

      <div key={selectedCat} className="flex-1">
        {grouped.size === 0 && (
          <p className="px-4 py-8 text-center text-body text-content-subtle">
            Nenhum serviço encontrado.
          </p>
        )}
        {(() => {
          let staggerIdx = 0
          return Array.from(grouped.entries()).map(([cat, svcs]) => (
            <div key={cat}>
              {categories.length > 1 && (
                <div className="bg-background px-4 py-2">
                  <p className="text-caption text-content-subtle">{cat}</p>
                </div>
              )}
              {svcs.map((svc, i) => {
                const idx = staggerIdx++
                const hasPhotos = (svc.photos?.length ?? 0) > 0
                const durationLabel = svc.durationMins >= 60
                  ? `${Math.floor(svc.durationMins / 60)}h${svc.durationMins % 60 ? ` ${svc.durationMins % 60}min` : ''}`
                  : `${svc.durationMins}min`
                const priceLabel = svc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                return (
                  <div
                    key={svc.id}
                    className={cn(
                      'flex items-center animate-fade-in motion-reduce:animate-none',
                      i < svcs.length - 1 && 'border-b border-background-secondary',
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
                        {svc.emoji ?? categoryIcon(svc.category)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium text-content-primary">{svc.name}</p>
                        <p className="mt-0.5 text-[13px] text-content-subtle">
                          {durationLabel} · {priceLabel}
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
