'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_BOOKING_SITE, type BookingSiteConfig } from '@/lib/configuracoes-mock'
import { Toggle, TextInput, FieldLabel, SectionCard, SaveButton, useSaveState } from './_primitives'

export default function SectionSiteBooking() {
  const [cfg, setCfg] = useState<BookingSiteConfig>(MOCK_BOOKING_SITE)
  const [saveState, triggerSave] = useSaveState()
  const [copied, setCopied] = useState(false)
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  function set<K extends keyof BookingSiteConfig>(field: K, value: BookingSiteConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
  }

  function handleCopy() {
    void navigator.clipboard.writeText(`milliagenda.com/${cfg.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleVerifyDomain() {
    setDomainStatus('checking')
    await new Promise((r) => setTimeout(r, 1200))
    setDomainStatus('ok')
  }

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
            <div className="rounded-md border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2">
              <p className="text-[12px] text-[#92400E]">
                Disponível nos planos Business. Você está no plano Growth.
              </p>
            </div>
            <div className="flex gap-2">
              <TextInput
                id="custom-domain"
                value={cfg.customDomain}
                onChange={(v) => set('customDomain', v)}
                placeholder="agenda.seusalao.com.br"
                disabled
              />
              <button
                type="button"
                disabled
                aria-label="Verificar domínio"
                className="shrink-0 rounded-md border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#CBD5E1] cursor-not-allowed"
              >
                {domainStatus === 'checking' ? 'Verificando…' : domainStatus === 'ok' ? 'Verificado' : 'Verificar'}
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
                { field: 'showPrices'            as const, label: 'Mostrar preços no site'                   },
                { field: 'showProfessionals'     as const, label: 'Mostrar profissionais disponíveis'         },
                { field: 'allowProfessionalChoice' as const, label: 'Permitir que o cliente escolha o profissional' },
              ] as const
            ).map(({ field, label }) => (
              <div key={field} className="flex items-center gap-3">
                <Toggle
                  checked={cfg[field]}
                  onChange={(v) => set(field, v)}
                  label={label}
                />
                <span className="text-[13px] text-[#0F172A]">{label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Preview */}
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
    </div>
  )
}
