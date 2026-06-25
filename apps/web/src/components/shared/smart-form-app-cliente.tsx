'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronRight, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppClienteConfig {
  displayName: string
  primaryColor: string
  theme: 'light' | 'dark'
  enabledSlides: string[]
  cancelPolicy: string
  reschedulePolicy: string
  minValue: number
  slug: string
  published: boolean
}

interface SmartFormAppClienteProps {
  open: boolean
  onClose: () => void
  onSave?: (config: AppClienteConfig) => Promise<void>
  initialSlug?: string
}

const SLIDE_TYPES = [
  { id: 'promocoes',  label: 'Promoções',         emoji: '🏷️' },
  { id: 'pacotes',    label: 'Pacotes Especiais',  emoji: '📦' },
  { id: 'servicos',   label: 'Serviços Populares', emoji: '✂️' },
  { id: 'avaliacoes', label: 'Avaliações',         emoji: '⭐' },
  { id: 'afiliados',  label: 'Programa Afiliados', emoji: '💰' },
]

const CANCEL_OPTIONS = [
  'Não aceita cancelamentos',
  'Até 1 hora antes',
  'Até 24 horas antes',
  'Até 48 horas antes',
]

const RESCHEDULE_OPTIONS = [
  'Não aceita reagendamentos',
  'Até 1 hora antes',
  'Até 24 horas antes',
  'Até 48 horas antes',
]

const STEP_TITLES = [
  { title: 'Aparência do App',   subtitle: 'Configure a identidade visual que os clientes verão' },
  { title: 'Carrossel do App',   subtitle: 'Escolha quais seções aparecem para seus clientes' },
  { title: 'Políticas do App',   subtitle: 'Defina as regras de agendamento exibidas aos clientes' },
  { title: 'Publicação',         subtitle: 'Defina o link e publique seu App' },
]

export default function SmartFormAppCliente({ open, onClose, onSave, initialSlug = '' }: SmartFormAppClienteProps) {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName]     = useState('')
  const [primaryColor, setPrimaryColor]   = useState('#2563EB')
  const [theme, setTheme]                 = useState<'light' | 'dark'>('light')
  const [enabledSlides, setEnabledSlides] = useState<string[]>(['promocoes', 'pacotes', 'servicos', 'avaliacoes', 'afiliados'])
  const [cancelPolicy, setCancelPolicy]   = useState(CANCEL_OPTIONS[0])
  const [reschedulePolicy, setReschedulePolicy] = useState(RESCHEDULE_OPTIONS[0])
  const [minValue, setMinValue]           = useState(0)
  const [slug, setSlug]                   = useState(initialSlug)
  const [published, setPublished]         = useState(false)
  const [copied, setCopied]               = useState(false)
  const [saving, setSaving]               = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setDisplayName('')
    setPrimaryColor('#2563EB')
    setTheme('light')
    setEnabledSlides(['promocoes', 'pacotes', 'servicos', 'avaliacoes', 'afiliados'])
    setCancelPolicy(CANCEL_OPTIONS[0])
    setReschedulePolicy(RESCHEDULE_OPTIONS[0])
    setMinValue(0)
    setSlug(initialSlug)
    setPublished(false)
    setCopied(false)
    setSaving(false)
  }, [open, initialSlug])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function canAdvance() {
    if (step === 0) return displayName.trim().length > 0
    return true
  }

  function toggleSlide(id: string) {
    setEnabledSlides((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev
        return prev.filter((s) => s !== id)
      }
      return [...prev, id]
    })
  }

  function handleCopySlug() {
    void navigator.clipboard.writeText(`milliagenda.com/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSave() {
    setSaving(true)
    const config: AppClienteConfig = {
      displayName,
      primaryColor,
      theme,
      enabledSlides,
      cancelPolicy,
      reschedulePolicy,
      minValue,
      slug,
      published,
    }
    try {
      await onSave?.(config)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  if (!open) return null

  const { title, subtitle } = STEP_TITLES[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-md p-1 text-[#94A3B8] transition-colors hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex shrink-0 items-center justify-center gap-2 px-6 py-3">
          {STEP_TITLES.map((_, i) => (
            <span
              key={i}
              className={cn('h-2 rounded-full transition-all duration-150',
                i === step ? 'w-6 bg-[#2563EB]' : i < step ? 'w-2 bg-[#2563EB]/40' : 'w-2 bg-[#E2E8F0]'
              )}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
          {step === 0 && (
            <div className="space-y-5 py-2">
              {/* Nome exibido */}
              <div>
                <label htmlFor="app-display-name" className="mb-1.5 block text-[12px] font-medium text-[#475569]">
                  Nome exibido no app
                </label>
                <input
                  id="app-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Bella Vista Salão"
                  className={cn(
                    'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
                    'placeholder:text-[#94A3B8]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                    'transition-colors duration-150',
                  )}
                />
              </div>

              {/* Cor principal */}
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-[#475569]">Cor principal</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-md border border-[#E2E8F0]"
                    style={{ backgroundColor: primaryColor }}
                    aria-hidden="true"
                  />
                  <label className="sr-only" htmlFor="app-primary-color">Cor principal</label>
                  <input
                    id="app-primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-20 cursor-pointer rounded-md border border-[#E2E8F0] p-0.5"
                    aria-label="Selecionar cor principal"
                  />
                  <span className="text-[12px] text-[#64748B]">{primaryColor.toUpperCase()}</span>
                </div>
              </div>

              {/* Tema */}
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-[#475569]">Tema</p>
                <div className="flex gap-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors duration-150',
                        theme === t
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      )}
                    >
                      {t === 'light' ? '☀️' : '🌙'} {t === 'light' ? 'Claro' : 'Escuro'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="py-2">
              <ul className="space-y-2" aria-label="Tipos de slide do carrossel">
                {SLIDE_TYPES.map((slide) => {
                  const active = enabledSlides.includes(slide.id)
                  return (
                    <li key={slide.id}>
                      <button
                        type="button"
                        onClick={() => toggleSlide(slide.id)}
                        aria-pressed={active}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150',
                          active ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        )}
                      >
                        <span className="text-[16px]" aria-hidden="true">{slide.emoji}</span>
                        <span className={cn('flex-1 text-[13px] font-medium', active ? 'text-[#2563EB]' : 'text-[#475569]')}>
                          {slide.label}
                        </span>
                        {active && <Check size={14} className="shrink-0 text-[#2563EB]" aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-[11px] text-[#94A3B8]">
                {enabledSlides.length} de {SLIDE_TYPES.length} selecionados — mínimo 1
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-2">
              {/* Cancelamento */}
              <div>
                <label htmlFor="cancel-policy" className="mb-1.5 block text-[12px] font-medium text-[#475569]">
                  Cancelamento
                </label>
                <select
                  id="cancel-policy"
                  value={cancelPolicy}
                  onChange={(e) => setCancelPolicy(e.target.value)}
                  className={cn(
                    'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                    'transition-colors duration-150',
                  )}
                >
                  {CANCEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Reagendamento */}
              <div>
                <label htmlFor="reschedule-policy" className="mb-1.5 block text-[12px] font-medium text-[#475569]">
                  Reagendamento
                </label>
                <select
                  id="reschedule-policy"
                  value={reschedulePolicy}
                  onChange={(e) => setReschedulePolicy(e.target.value)}
                  className={cn(
                    'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                    'transition-colors duration-150',
                  )}
                >
                  {RESCHEDULE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Valor mínimo */}
              <div>
                <label htmlFor="min-value" className="mb-1.5 block text-[12px] font-medium text-[#475569]">
                  Valor mínimo para agendamento
                </label>
                <div className="flex items-center overflow-hidden rounded-md border border-[#E2E8F0] bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#DBEAFE]">
                  <span className="shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#94A3B8]">R$</span>
                  <input
                    id="min-value"
                    type="number"
                    min={0}
                    step={0.01}
                    value={minValue === 0 ? '' : minValue}
                    onChange={(e) => setMinValue(Number(e.target.value) || 0)}
                    placeholder="0,00"
                    className="min-w-0 flex-1 bg-white px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Deixe 0 para sem mínimo</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2">
              {/* Slug */}
              <div>
                <label htmlFor="app-slug" className="mb-1.5 block text-[12px] font-medium text-[#475569]">
                  URL do App
                </label>
                <div className="flex items-center overflow-hidden rounded-md border border-[#E2E8F0] bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#DBEAFE]">
                  <span className="shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#94A3B8]">milliagenda.com/</span>
                  <input
                    id="app-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="min-w-0 flex-1 bg-white px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    aria-label="Copiar URL"
                    className="flex shrink-0 items-center gap-1.5 border-l border-[#E2E8F0] px-3 py-2 text-[12px] text-[#475569] transition-colors hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    {copied ? <Check size={12} className="text-[#10B981]" aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Toggle publicado */}
              <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">App publicado</p>
                  <p className="text-[11px] text-[#64748B]">{published ? 'Publicado' : 'Rascunho'}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={published}
                  onClick={() => setPublished((v) => !v)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150',
                    published ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150',
                      published ? 'translate-x-4' : 'translate-x-0',
                    )}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Resumo */}
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Resumo</p>
                <dl className="space-y-1.5 text-[12px]">
                  <div className="flex gap-2">
                    <dt className="text-[#64748B]">Nome:</dt>
                    <dd className="font-medium text-[#0F172A]">{displayName || '—'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-[#64748B]">Cor:</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-sm border border-[#E2E8F0]" style={{ backgroundColor: primaryColor }} aria-hidden="true" />
                      <span className="font-medium text-[#0F172A]">{primaryColor.toUpperCase()}</span>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#64748B]">Tema:</dt>
                    <dd className="font-medium text-[#0F172A]">{theme === 'light' ? 'Claro' : 'Escuro'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#64748B]">Slides:</dt>
                    <dd className="font-medium text-[#0F172A]">{enabledSlides.length} ativos</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#64748B]">Cancelamento:</dt>
                    <dd className="font-medium text-[#0F172A]">{cancelPolicy}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#64748B]">Reagendamento:</dt>
                    <dd className="font-medium text-[#0F172A]">{reschedulePolicy}</dd>
                  </div>
                  {minValue > 0 && (
                    <div className="flex gap-2">
                      <dt className="text-[#64748B]">Valor mínimo:</dt>
                      <dd className="font-medium text-[#0F172A]">R$ {minValue.toFixed(2)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
          {step === 3 ? (
            <>
              <a
                href={`https://milliagenda.com/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1.5 text-[13px] text-[#2563EB] underline-offset-2 hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded',
                )}
              >
                <ExternalLink size={13} aria-hidden="true" />
                Abrir App
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={cn(
                    'rounded-md border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569]',
                    'transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    'rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white',
                    'transition-colors hover:bg-[#1D4ED8]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                >
                  {saving ? 'Salvando…' : 'Salvar configurações'}
                </button>
              </div>
            </>
          ) : (
            <>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className={cn(
                    'rounded-md border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569]',
                    'transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  Voltar
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className={cn(
                  'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white',
                  'transition-colors hover:bg-[#1D4ED8]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                Continuar
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
