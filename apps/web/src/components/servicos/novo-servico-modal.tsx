'use client'

import { useEffect, useState } from 'react'
import { X, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServicoStatus } from '@/lib/servicos-mock'
import type { ServicoInput } from '@/hooks/use-servicos'
import PhotoUpload from '@/components/shared/photo-upload'

const LABEL = 'text-sm font-medium text-[#64748B]'
const INPUT = cn(
  'w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px] text-[#0F172A]',
  'placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface FormState {
  nome: string
  categoryId: string
  duration: string
  price: string
  description: string
  status: ServicoStatus
  photos: string[]
}

const EMPTY: FormState = {
  nome: '', categoryId: '', duration: '60', price: '', description: '',
  status: 'active', photos: [],
}

interface NovoServicoModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: ServicoInput) => Promise<void>
}

export default function NovoServicoModal({ open, onClose, onCreate }: NovoServicoModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<Array<{ id: string; name: string }>>([])
  const [novaCategoria, setNovaCategoria] = useState(false)
  const [nomeCategoria, setNomeCategoria] = useState('')

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setSaving(false)
      setSubmitError(null)
      setNovaCategoria(false)
      setNomeCategoria('')
    }
  }, [open])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/services/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(r => setCategorias(r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  function setField<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleCriarCategoria() {
    if (!nomeCategoria.trim()) return
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/services/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: nomeCategoria.trim() }),
    })
    const data = await res.json()
    const nova = data.data ?? data
    if (nova?.id) {
      setCategorias(prev => [...prev, nova])
      setForm(f => ({ ...f, categoryId: nova.id }))
      setNovaCategoria(false)
      setNomeCategoria('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setSubmitError(null)
    try {
      await onCreate({
        name: form.nome.trim(),
        description: form.description.trim() || undefined,
        durationMin: Number(form.duration),
        price: Number(form.price),
        active: form.status === 'active',
        categoryId: form.categoryId || null,
      })
      onClose()
    } catch {
      setSubmitError('Erro ao cadastrar serviço. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo serviço"
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Scissors size={16} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Serviço</h2>
              <p className="text-[12px] text-[#64748B]">Preencha os dados do novo serviço</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="novo-serv-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">

            {/* Nome + Categoria */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="ns-nome" className={LABEL}>Nome do serviço *</label>
                <input
                  id="ns-nome" type="text" required
                  value={form.nome} onChange={setField('nome')}
                  placeholder="Ex.: Corte + Escova"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-category" className={LABEL}>Categoria</label>
                <select id="ns-category" value={form.categoryId} onChange={setField('categoryId')} className={INPUT}>
                  <option value="">Sem categoria</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {!novaCategoria && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setNovaCategoria(true) }}
                    className="text-[12px] text-[#2563EB] hover:underline mt-1"
                  >
                    + Nova categoria
                  </button>
                )}
                {novaCategoria && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={nomeCategoria}
                      onChange={e => setNomeCategoria(e.target.value)}
                      placeholder="Nome da categoria"
                      className={INPUT}
                    />
                    <button
                      type="button"
                      onClick={handleCriarCategoria}
                      className="rounded-xl bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white whitespace-nowrap hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovaCategoria(false)}
                      className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-[12px] font-medium text-[#64748B] whitespace-nowrap hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Duração + Preço + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="ns-duration" className={LABEL}>Duração (min) *</label>
                <input
                  id="ns-duration" type="number" required min="5" step="5"
                  value={form.duration} onChange={setField('duration')}
                  placeholder="60"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-price" className={LABEL}>Preço (R$) *</label>
                <input
                  id="ns-price" type="number" required min="0" step="0.01"
                  value={form.price} onChange={setField('price')}
                  placeholder="0,00"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-status" className={LABEL}>Status</label>
                <select id="ns-status" value={form.status} onChange={setField('status')} className={INPUT}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label htmlFor="ns-desc" className={LABEL}>Descrição</label>
              <textarea
                id="ns-desc" rows={3}
                value={form.description} onChange={setField('description')}
                placeholder="Descreva o serviço, técnicas utilizadas, resultados esperados…"
                className={cn(INPUT, 'resize-none')}
              />
            </div>

            {/* Fotos */}
            <div className="border-t border-[#E2E8F0] pt-5">
              <PhotoUpload
                photos={form.photos}
                onChange={(photos) => setForm((f) => ({ ...f, photos }))}
                maxPhotos={6}
                maxSizeMB={5}
                label="Fotos do Serviço (opcional)"
                sublabel="Mostre como ficam os resultados deste serviço"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#E2E8F0] px-5 py-4">
          {submitError && (
            <p className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#DC2626]" role="alert">{submitError}</p>
          )}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="novo-serv-form"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1 disabled:opacity-60"
            >
              <Scissors size={13} aria-hidden="true" />
              {saving ? 'Cadastrando…' : 'Cadastrar serviço'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
