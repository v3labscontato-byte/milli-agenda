'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfiguracoes } from '@/hooks/use-configuracoes'
import { FieldLabel, TextInput, SectionCard, SaveButton, type SaveState } from './_primitives'

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

interface SalonForm {
  name: string
  phone: string
  email: string
  document: string
}

const EMPTY_FORM: SalonForm = { name: '', phone: '', email: '', document: '' }

// ── Component ─────────────────────────────────────────────────────────────────

export default function SectionMeuSalao() {
  const { settings, loading, error, saving, update } = useConfiguracoes()

  const [form, setForm]           = useState<SalonForm>(EMPTY_FORM)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState('')

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

  useEffect(() => {
    if (settings) {
      setForm({
        name:     settings.name ?? '',
        phone:    settings.phone ?? '',
        email:    settings.email ?? '',
        document: settings.document ?? '',
      })
      setLogoPreview(settings.logoUrl ?? null)
    }
  }, [settings])

  function set<K extends keyof SalonForm>(field: K, value: SalonForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaveError('')
    setSaveState('saving')
    const result = await update({
      name:     form.name,
      phone:    form.phone,
      email:    form.email,
      document: form.document,
      logoUrl:  logoPreview ?? undefined,
    })
    if (result.success) {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } else {
      setSaveError(result.error ?? 'Erro ao salvar')
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
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

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
          <div className="h-6 w-48 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-40 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#E2E8F0]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-8 py-6">
          <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-[13px] text-[#DC2626]" role="alert">
            {error}
          </div>
        </div>
      </div>
    )
  }

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
                          <span aria-hidden="true">✓ </span>Imagem carregada! Clique em salvar para aplicar.
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

            {/* Cover — TODO: conectar API quando endpoint /settings/cover existir */}
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
                      {coverStatus === 'saved'  && <p className="text-[11px] text-[#10B981]"><span aria-hidden="true">✓ </span>Imagem carregada!</p>}
                    </div>
                    {coverError && <p className="text-[11px] text-[#DC2626]" role="alert">{coverError}</p>}
                  </div>
                </div>
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
              <FieldLabel htmlFor="salon-document">CNPJ / CPF</FieldLabel>
              <TextInput
                id="salon-document"
                value={form.document}
                onChange={(v) => set('document', v)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col items-end gap-2 pb-6">
          {saveError && (
            <p className="text-[12px] text-[#DC2626]" role="alert">{saveError}</p>
          )}
          <SaveButton state={saving ? 'saving' : saveState} onClick={() => { void handleSave() }} />
        </div>
      </div>
    </div>
  )
}
