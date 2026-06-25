'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, ChevronUp, ChevronDown, Tag, Package, Scissors, Star, Banknote, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BookingSiteConfig } from '@/lib/configuracoes-mock'
import { CAROUSEL_CONFIG, type CarouselSlideConfig } from '@/lib/carousel-config'
import type { TenantSettings } from '@/hooks/use-configuracoes'
import { Toggle, TextInput, SectionCard, SaveButton, useSaveState } from './_primitives'
import SmartFormAppCliente from '@/components/shared/smart-form-app-cliente'

// ── Carousel config helpers ───────────────────────────────────────────────────

const SLIDE_ICONS: Record<CarouselSlideConfig['type'], React.ElementType> = {
  promocoes:  Tag,
  pacotes:    Package,
  servicos:   Scissors,
  avaliacoes: Star,
  afiliados:  Banknote,
}

const SLIDE_LABELS: Record<CarouselSlideConfig['type'], string> = {
  promocoes:  'Promoções',
  pacotes:    'Pacotes Especiais',
  servicos:   'Serviços Populares',
  avaliacoes: 'Avaliações',
  afiliados:  'Programa Afiliados',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SectionSiteBookingProps {
  settings?: TenantSettings | null
}

const PLAN_LABELS: Record<string, string> = {
  TRIAL:        'Trial',
  STARTER:      'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE:   'Enterprise',
}

export default function SectionSiteBooking({ settings }: SectionSiteBookingProps) {
  const plan = (settings?.plan ?? 'STARTER').toUpperCase()
  const planLabel = PLAN_LABELS[plan] ?? plan
  const hasCustomDomain = plan === 'ENTERPRISE'

  const [cfg, setCfg] = useState<BookingSiteConfig>({
    slug: settings?.slug ?? '',
    customDomain: '',
    primaryColor: '#2563EB',
    description: '',
    showPrices: true,
    showProfessionals: true,
    allowProfessionalChoice: false,
  })
  const [saveState, triggerSave] = useSaveState()
  const [copied, setCopied] = useState(false)

  const [carouselCfg, setCarouselCfg] = useState<CarouselSlideConfig[]>(() =>
    [...CAROUSEL_CONFIG].sort((a, b) => a.order - b.order),
  )
  const [carouselSaveState, triggerCarouselSave] = useSaveState()
  const [appClienteOpen, setAppClienteOpen] = useState(false)

  function set<K extends keyof BookingSiteConfig>(field: K, value: BookingSiteConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
  }

  function handleCopy() {
    void navigator.clipboard.writeText(`milliagenda.com/${cfg.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleSlide(id: string) {
    setCarouselCfg((prev) => {
      const active = prev.filter((s) => s.enabled).length
      const target = prev.find((s) => s.id === id)
      if (!target) return prev
      if (target.enabled && active <= 1) return prev
      return prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    })
  }

  function moveItem(idx: number, dir: 'up' | 'down') {
    setCarouselCfg((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev
      return prev.map((s) => {
        if (s.id === sorted[idx].id)       return { ...s, order: sorted[targetIdx].order }
        if (s.id === sorted[targetIdx].id) return { ...s, order: sorted[idx].order }
        return s
      })
    })
  }

  const sortedSlides = [...carouselCfg].sort((a, b) => a.order - b.order)
  const activeCount  = carouselCfg.filter((s) => s.enabled).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Site de Agendamento Online</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Configure a página pública onde seus clientes podem agendar.
          </p>
        </div>

        {/* URL pública */}
        <SectionCard title="URL Pública">
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-[#475569]">Link de agendamento</p>
              <div className="flex items-center overflow-hidden rounded-md border border-[#E2E8F0] bg-white">
                <span className="shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#94A3B8]">
                  milliagenda.com/
                </span>
                <input
                  type="text"
                  value={cfg.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  aria-label="Slug do site de agendamento"
                  className="min-w-0 flex-1 bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#DBEAFE]"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copiar URL"
                  className="flex shrink-0 items-center gap-1.5 border-l border-[#E2E8F0] px-3 py-2 text-[12px] text-[#475569] transition-colors hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  {copied ? <Check size={12} className="text-[#10B981]" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Domínio próprio */}
        <SectionCard title="Domínio Próprio">
          <div className="space-y-3">
            {!hasCustomDomain && (
              <div className="rounded-md border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2">
                <p className="text-[12px] text-[#92400E]">
                  Disponível no plano Enterprise. Você está no plano {planLabel}.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <TextInput
                id="custom-domain"
                value={cfg.customDomain}
                onChange={(v) => set('customDomain', v)}
                placeholder="agenda.seusalao.com.br"
                disabled={!hasCustomDomain}
              />
              <button
                type="button"
                disabled={!hasCustomDomain}
                aria-label="Verificar domínio"
                className="shrink-0 rounded-md border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#CBD5E1] cursor-not-allowed disabled:cursor-not-allowed"
              >
                Verificar
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Aparência */}
        <SectionCard title="Aparência">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">Cor principal</p>
                <p className="text-[12px] text-[#64748B]">Usada em botões e destaques do site</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-md border border-[#E2E8F0]"
                  style={{ backgroundColor: cfg.primaryColor }}
                  aria-hidden="true"
                />
                <label className="sr-only" htmlFor="primary-color">Cor principal</label>
                <input
                  id="primary-color"
                  type="color"
                  value={cfg.primaryColor}
                  onChange={(e) => set('primaryColor', e.target.value)}
                  className="h-7 w-16 cursor-pointer rounded-md border border-[#E2E8F0] p-0.5"
                  aria-label="Selecionar cor principal"
                />
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <p className="mb-1.5 text-[12px] font-medium text-[#475569]">Descrição do salão</p>
              <textarea
                value={cfg.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descreva seu salão para os clientes…"
                aria-label="Descrição do salão"
                className={cn(
                  'w-full resize-none rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
                  'placeholder:text-[#94A3B8]',
                  'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                  'transition-colors duration-150',
                )}
              />
            </div>
          </div>
        </SectionCard>

        {/* Visibilidade */}
        <SectionCard title="Visibilidade">
          <div className="space-y-3">
            {(
              [
                { field: 'showPrices'              as const, label: 'Mostrar preços no site'                        },
                { field: 'showProfessionals'       as const, label: 'Mostrar profissionais disponíveis'              },
                { field: 'allowProfessionalChoice' as const, label: 'Permitir que o cliente escolha o profissional'  },
              ] as const
            ).map(({ field, label }) => (
              <div key={field} className="flex items-center gap-3">
                <Toggle checked={cfg[field]} onChange={(v) => set(field, v)} label={label} />
                <span className="text-[13px] text-[#0F172A]">{label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Carrossel do App */}
        <SectionCard title="Carrossel do App Cliente">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] text-[#64748B]">
              Configure quais seções aparecem no carrossel e em qual ordem.
            </p>
            <button
              type="button"
              onClick={() => setAppClienteOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] font-medium text-[#475569] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <Palette size={13} aria-hidden="true" />
              Personalizar App
            </button>
          </div>
          <ul className="space-y-2" aria-label="Slides do carrossel">
            {sortedSlides.map((slide, idx) => {
              const SlideIcon = SLIDE_ICONS[slide.type]
              return (
              <li
                key={slide.id}
                className={cn(
                  'flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                  slide.enabled ? 'border-[#E2E8F0] bg-white' : 'border-[#F1F5F9] bg-[#F8FAFC]',
                )}
              >
                <span className="cursor-grab select-none text-[14px] text-[#CBD5E1]" aria-hidden="true">☰</span>
                <Toggle
                  checked={slide.enabled}
                  onChange={() => toggleSlide(slide.id)}
                  label={`${slide.enabled ? 'Desativar' : 'Ativar'} ${SLIDE_LABELS[slide.type]}`}
                />
                <SlideIcon size={15} className={cn('shrink-0', slide.enabled ? 'text-[#475569]' : 'text-[#CBD5E1]')} aria-hidden="true" />
                <span className={cn('min-w-0 flex-1 text-[13px]', slide.enabled ? 'font-medium text-[#0F172A]' : 'text-[#94A3B8]')}>
                  {SLIDE_LABELS[slide.type]}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    aria-label={`Mover ${SLIDE_LABELS[slide.type]} para cima`}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:text-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === sortedSlides.length - 1}
                    aria-label={`Mover ${SLIDE_LABELS[slide.type]} para baixo`}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:text-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
              )
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[12px] text-[#64748B]">
              Preview:{' '}
              <span className="font-medium text-[#0F172A]">
                {activeCount} slide{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
              </span>
            </p>
            <SaveButton state={carouselSaveState} onClick={triggerCarouselSave} label="Salvar configuração" />
          </div>
        </SectionCard>

        {/* Preview link */}
        <div className="flex items-center justify-between">
          <a
            href={`https://milliagenda.com/${cfg.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1.5 text-[13px] text-[#2563EB] underline-offset-2 hover:underline',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded',
            )}
          >
            <ExternalLink size={13} aria-hidden="true" />
            Abrir site de agendamento
          </a>
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar configurações" />
        </div>
      </div>
      <SmartFormAppCliente
        open={appClienteOpen}
        onClose={() => setAppClienteOpen(false)}
        initialSlug={cfg.slug}
      />
    </div>
  )
}
