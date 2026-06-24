'use client'

import { useState, useRef } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_SALON_INFO, STATES_BR, TIMEZONES, type SalonInfo } from '@/lib/configuracoes-mock'
import { FieldLabel, TextInput, SelectInput, SectionCard, SaveButton, useSaveState } from './_primitives'

// ── Upload helpers ────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml']

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('Failed to read file'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

type UploadStatus = 'idle' | 'saving' | 'saved'

// ── Component ─────────────────────────────────────────────────────────────────

export default function SectionMeuSalao() {
  const [form, setForm]         = useState<SalonInfo>(MOCK_SALON_INFO)
  const [saveState, triggerSave] = useSaveState()

  // Identidade visual
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null)
  const [coverPreview,  setCoverPreview]  = useState<string | null>(null)
  const [logoError,     setLogoError]     = useState('')
  const [coverError,    setCoverError]    = useState('')
  const [logoStatus,    setLogoStatus]    = useState<UploadStatus>('idle')
  const [coverStatus,   setCoverStatus]   = useState<UploadStatus>('idle')
  const logoInputRef  = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [confirmLogoRemove,  setConfirmLogoRemove]  = useState(false)
  const [confirmCoverRemove, setConfirmCoverRemove] = useState(false)

  function set<K extends keyof SalonInfo>(field: K, value: SalonInfo[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function processUpload(
    file: File,
    maxMB: number,
    extraTypes: string[],
    setPreview: (v: string | null) => void,
    setError:   (v: string)        => void,
    setStatus:  (v: UploadStatus)  => void,
  ) {
    setError('')
    const allowed = [...ALLOWED_IMAGE_TYPES, ...extraTypes].filter((v, i, a) => a.indexOf(v) === i)
    if (!allowed.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou SVG.')
      return
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxMB} MB.`)
      return
    }
    try {
      const dataUrl = await readFileAsDataURL(file)
      setPreview(dataUrl)
      setStatus('saving')
      await new Promise<void>((r) => setTimeout(r, 1000))
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setError('Erro ao processar a imagem. Tente novamente.')
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processUpload(file, 2, [], setLogoPreview, setLogoError, setLogoStatus)
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processUpload(file, 5, [], setCoverPreview, setCoverError, setCoverStatus)
  }

  function handleLogoRemove() {
    setLogoPreview(null)
    setLogoError('')
    setLogoStatus('idle')
    setConfirmLogoRemove(false)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function handleCoverRemove() {
    setCoverPreview(null)
    setCoverError('')
    setCoverStatus('idle')
    setConfirmCoverRemove(false)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const initials = form.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || '??'

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">

        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Informações do Salão</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Dados exibidos no site de agendamento e nas comunicações com clientes.
          </p>
        </div>

        {/* ── Identidade Visual ── */}
        <SectionCard title="Identidade Visual">
          <div className="space-y-6">

            {/* Logo */}
            <div>
              <p className="mb-3 text-[13px] font-medium text-[#0F172A]">Logo do Salão</p>
              <div className="rounded-lg border border-[#E2E8F0] p-4">
                <div className="flex items-start gap-4">
                  {/* Preview / avatar */}
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Preview do logo"
                      className="h-16 w-16 shrink-0 rounded-full border-2 border-[#E2E8F0] object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[18px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#0F172A]">{form.name || 'Salão'}</p>
                    <p className="mt-0.5 text-[12px] text-[#64748B]">
                      {logoPreview ? 'Clique para alterar o logo' : 'Clique para adicionar o logo'}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">Formatos: JPG, PNG, SVG · Máximo: 2 MB</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        ref={logoInputRef}
                        id="logo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        onChange={handleLogoChange}
                        className="sr-only"
                        aria-label="Selecionar arquivo do logo"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoStatus === 'saving'}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-[#475569]',
                          'transition-colors hover:border-[#2563EB] hover:text-[#2563EB]',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      >
                        <Camera size={12} aria-hidden="true" />
                        {logoPreview ? 'Alterar logo' : 'Adicionar logo'}
                      </button>

                      {logoPreview && !confirmLogoRemove && (
                        <button
                          type="button"
                          onClick={() => setConfirmLogoRemove(true)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-md border border-[#FEE2E2] px-3 py-1.5 text-[12px] text-[#DC2626]',
                            'transition-colors hover:bg-[#FEF2F2]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCA5A5]',
                          )}
                        >
                          <Trash2 size={12} aria-hidden="true" />
                          Remover
                        </button>
                      )}
                      {logoPreview && confirmLogoRemove && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleLogoRemove}
                            className="flex items-center gap-1 rounded-md bg-[#EF4444] px-2.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCA5A5]"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmLogoRemove(false)}
                            className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    <div role="status" aria-live="polite">
                      {logoStatus === 'saving' && (
                        <p className="mt-2 text-[11px] text-[#64748B]">Salvando…</p>
                      )}
                      {logoStatus === 'saved' && (
                        <p className="mt-2 text-[11px] text-[#10B981]">
                          <span aria-hidden="true">✓ </span>Imagem salva!
                        </p>
                      )}
                    </div>
                    {logoError && (
                      <p className="mt-2 text-[11px] text-[#DC2626]" role="alert">{logoError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover */}
            <div>
              <p className="mb-3 text-[13px] font-medium text-[#0F172A]">Foto de Capa</p>
              <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                {coverPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverPreview} alt="Preview da foto de capa" className="h-32 w-full object-cover" />
                    {!confirmCoverRemove ? (
                      <button
                        type="button"
                        onClick={() => setConfirmCoverRemove(true)}
                        className={cn(
                          'absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1',
                          'text-[11px] font-medium text-white',
                          'transition-colors hover:bg-black/70',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                        )}
                      >
                        <Trash2 size={11} aria-hidden="true" />
                        Remover
                      </button>
                    ) : (
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleCoverRemove}
                          className="rounded-md bg-[#EF4444] px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCoverRemove(false)}
                          className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className={cn(
                      'flex h-32 w-full flex-col items-center justify-center gap-1',
                      'border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]',
                      'transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                    )}
                    aria-label="Adicionar foto de capa"
                  >
                    <span className="text-[20px]" aria-hidden="true">📷</span>
                    <span className="text-[12px] text-[#94A3B8]">Clique para adicionar foto de capa</span>
                    <span className="text-[11px] text-[#CBD5E1]">Tamanho ideal: 1200×400 px</span>
                    <span className="text-[11px] text-[#CBD5E1]">Formatos: JPG, PNG · Máximo: 5 MB</span>
                  </button>
                )}

                <div className="flex items-center gap-2 border-t border-[#E2E8F0] bg-white px-3 py-2.5">
                  <input
                    ref={coverInputRef}
                    id="cover-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleCoverChange}
                    className="sr-only"
                    aria-label="Selecionar foto de capa"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverStatus === 'saving'}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-[#475569]',
                      'transition-colors hover:border-[#2563EB] hover:text-[#2563EB]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                  >
                    <Camera size={12} aria-hidden="true" />
                    {coverPreview ? 'Alterar foto de capa' : 'Adicionar foto de capa'}
                  </button>

                  <div className="ml-auto text-right">
                    <div role="status" aria-live="polite">
                      {coverStatus === 'saving' && <p className="text-[11px] text-[#64748B]">Salvando…</p>}
                      {coverStatus === 'saved'  && <p className="text-[11px] text-[#10B981]"><span aria-hidden="true">✓ </span>Imagem salva!</p>}
                    </div>
                    {coverError && <p className="text-[11px] text-[#DC2626]" role="alert">{coverError}</p>}
                  </div>
                </div>

                <p className="px-3 pb-2 text-[10px] text-[#CBD5E1]">
                  Em produção, a imagem será enviada para o servidor.
                </p>
              </div>
            </div>

          </div>
        </SectionCard>

        {/* ── Dados do Salão ── */}
        <SectionCard title="Dados do Salão">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-name">Nome do Salão</FieldLabel>
              <TextInput
                id="salon-name"
                value={form.name}
                onChange={(v) => set('name', v)}
                placeholder="Nome do salão"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-phone">Telefone</FieldLabel>
                <TextInput
                  id="salon-phone"
                  value={form.phone}
                  onChange={(v) => set('phone', v)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-email">E-mail</FieldLabel>
                <TextInput
                  id="salon-email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  placeholder="contato@salao.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-cnpj">CNPJ</FieldLabel>
              <TextInput
                id="salon-cnpj"
                value={form.cnpj}
                onChange={(v) => set('cnpj', v)}
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-address">Endereço</FieldLabel>
              <TextInput
                id="salon-address"
                value={form.address}
                onChange={(v) => set('address', v)}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <FieldLabel htmlFor="salon-neighborhood">Bairro</FieldLabel>
                <TextInput
                  id="salon-neighborhood"
                  value={form.neighborhood}
                  onChange={(v) => set('neighborhood', v)}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-cep">CEP</FieldLabel>
                <TextInput
                  id="salon-cep"
                  value={form.cep}
                  onChange={(v) => set('cep', v)}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <FieldLabel htmlFor="salon-city">Cidade</FieldLabel>
                <TextInput
                  id="salon-city"
                  value={form.city}
                  onChange={(v) => set('city', v)}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-state">UF</FieldLabel>
                <SelectInput
                  id="salon-state"
                  value={form.state}
                  onChange={(v) => set('state', v)}
                >
                  {STATES_BR.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </SelectInput>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-tz">Fuso horário</FieldLabel>
                <SelectInput
                  id="salon-tz"
                  value={form.timezone}
                  onChange={(v) => set('timezone', v)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </SelectInput>
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-currency">Moeda</FieldLabel>
                <SelectInput
                  id="salon-currency"
                  value={form.currency}
                  onChange={(v) => set('currency', v)}
                >
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                </SelectInput>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Redes Sociais ── */}
        <SectionCard title="Redes Sociais">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-instagram">Instagram</FieldLabel>
              <TextInput
                id="salon-instagram"
                value={form.instagram}
                onChange={(v) => set('instagram', v)}
                placeholder="@seusalao"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-whatsapp">WhatsApp</FieldLabel>
              <TextInput
                id="salon-whatsapp"
                value={form.whatsapp}
                onChange={(v) => set('whatsapp', v)}
                placeholder="(11) 99999-9999"
                type="tel"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} />
        </div>
      </div>
    </div>
  )
}
