'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfiguracoes } from '@/hooks/use-configuracoes'

type Step = 1 | 2 | 3

interface SalaoForm {
  nomeFantasia: string
  razaoSocial: string
  telefone: string
  whatsapp: string
  email: string
  cnpj: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

const EMPTY: SalaoForm = {
  nomeFantasia: '', razaoSocial: '',
  telefone: '', whatsapp: '', email: '', cnpj: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
}

interface SmartFormSalaoProps {
  open: boolean
  onClose: () => void
}

export default function SmartFormSalao({ open, onClose }: SmartFormSalaoProps) {
  const { settings, update } = useConfiguracoes()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<SalaoForm>(EMPTY)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (open) {
      setStep(1)
      setSaveError('')
      setCepError('')
      setForm({
        ...EMPTY,
        nomeFantasia: settings?.name ?? '',
        email: settings?.email ?? '',
        telefone: settings?.phone ?? '',
        cnpj: settings?.document ?? '',
      })
    }
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  function set<K extends keyof SalaoForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json() as Record<string, string>
      if (data.erro) { setCepError('CEP não encontrado'); return }
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro ?? prev.logradouro,
        bairro:     data.bairro     ?? prev.bairro,
        cidade:     data.localidade ?? prev.cidade,
        uf:         data.uf         ?? prev.uf,
      }))
    } catch {
      setCepError('Erro ao buscar CEP')
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const result = await update({
      name:     form.nomeFantasia,
      phone:    form.telefone || form.whatsapp,
      email:    form.email,
      document: form.cnpj,
    })
    if (result.success) {
      onClose()
    } else {
      setSaveError(result.error ?? 'Erro ao salvar')
      setSaving(false)
    }
  }

  if (!open) return null

  const step1Valid = form.nomeFantasia.trim().length > 0
  const step2Valid = form.email.trim().length > 0 || form.telefone.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Assistente de configuração do salão">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              {step === 1 ? 'Identidade' : step === 2 ? 'Contato e endereço' : 'Resumo'}
            </p>
            <div className="mt-1 flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <span key={s} className={cn('h-1.5 rounded-full transition-all duration-150',
                  s === step ? 'w-5 bg-[#2563EB]' : s < step ? 'w-1.5 bg-[#2563EB]/40' : 'w-1.5 bg-[#E2E8F0]')} />
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Identidade do salão</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Como seu salão aparece para os clientes</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Nome fantasia *</label>
                <input type="text" value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)}
                  placeholder="Ex: Studio Bella Vista"
                  autoFocus
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Razão social</label>
                <input type="text" value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)}
                  placeholder="Ex: Bella Vista Serviços de Beleza LTDA"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Contato e endereço</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Informações de contato e localização</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Telefone</label>
                  <input type="tel" value={form.telefone} onChange={(e) => set('telefone', e.target.value)}
                    placeholder="(11) 3333-4444"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">E-mail</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  placeholder="contato@salao.com"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">CNPJ</label>
                <input type="text" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">CEP</label>
                <div className="relative">
                  <input type="text" value={form.cep}
                    onChange={(e) => { set('cep', e.target.value); setCepError('') }}
                    onBlur={() => { void handleCepBlur() }}
                    placeholder="00000-000" maxLength={9}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                  {cepLoading && <Loader2 size={14} className="absolute right-3 top-2.5 animate-spin text-[#64748B]" />}
                </div>
                {cepError && <p className="text-[11px] text-[#DC2626]">{cepError}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Logradouro</label>
                <input type="text" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)}
                  placeholder="Rua, Avenida..."
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Número</label>
                  <input type="text" value={form.numero} onChange={(e) => set('numero', e.target.value)}
                    placeholder="123"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Complemento</label>
                  <input type="text" value={form.complemento} onChange={(e) => set('complemento', e.target.value)}
                    placeholder="Sala, Bloco..."
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Cidade</label>
                  <input type="text" value={form.cidade} onChange={(e) => set('cidade', e.target.value)}
                    placeholder="São Paulo"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">UF</label>
                  <input type="text" value={form.uf} onChange={(e) => set('uf', e.target.value)}
                    placeholder="SP" maxLength={2}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Resumo</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Revise as informações antes de salvar</p>
              </div>
              <div className="divide-y divide-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
                {[
                  { label: 'Nome fantasia',  value: form.nomeFantasia  },
                  { label: 'Razão social',   value: form.razaoSocial   },
                  { label: 'Telefone',       value: form.telefone      },
                  { label: 'WhatsApp',       value: form.whatsapp      },
                  { label: 'E-mail',         value: form.email         },
                  { label: 'CNPJ',           value: form.cnpj          },
                  { label: 'Endereço',       value: [form.logradouro, form.numero, form.bairro, form.cidade, form.uf].filter(Boolean).join(', ') },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3">
                    <span className="text-[12px] text-[#64748B] shrink-0">{row.label}</span>
                    <span className="text-[13px] font-medium text-[#0F172A] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              {saveError && <p className="text-[12px] text-[#DC2626]">{saveError}</p>}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#F1F5F9] px-5 py-4">
          <button type="button"
            onClick={() => {
              if (step === 1) onClose()
              else setStep((prev) => (prev - 1) as Step)
            }}
            className="rounded text-[13px] text-[#64748B] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < 3 ? (
            <button type="button"
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={step === 1 ? !step1Valid : !step2Valid}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Próximo <ChevronRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={() => { void handleSave() }} disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Salvando…</> : <><Check size={13} /> Salvar configurações</>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
