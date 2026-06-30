'use client'

import { useEffect, useState } from 'react'
import { X, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoUpload from '@/components/shared/photo-upload'
import type { Product, ProductInput, ProductUnit, ProductClassification } from '@/hooks/use-produtos'

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'UNIT', label: 'Unidade' },
  { value: 'ML', label: 'mL' },
  { value: 'G', label: 'g' },
  { value: 'KG', label: 'kg' },
  { value: 'LITER', label: 'L' },
]

const CLASSIFICATION_OPTIONS: { value: ProductClassification; label: string }[] = [
  { value: 'RESALE', label: 'Revenda' },
  { value: 'INTERNAL_USE', label: 'Uso Interno' },
  { value: 'PROCEDURE', label: 'Procedimento' },
  { value: 'CONSUMABLE', label: 'Consumível' },
]

interface FormState {
  name: string
  categoryId: string
  sku: string
  brand: string
  supplierName: string
  unit: ProductUnit
  price: string
  active: boolean
  stockQuantity: string
  minStockAlert: string
  maxStock: string
  location: string
  classifications: ProductClassification[]
  description: string
  notes: string
  imageUrl: string
}

const EMPTY: FormState = {
  name: '', categoryId: '', sku: '', brand: '', supplierName: '',
  unit: 'UNIT', price: '', active: true,
  stockQuantity: '0', minStockAlert: '0', maxStock: '',
  location: '', classifications: [], description: '', notes: '', imageUrl: '',
}

function toFormState(p: Product): FormState {
  return {
    name: p.name,
    categoryId: p.categoryId ?? '',
    sku: p.sku,
    brand: p.brand,
    supplierName: p.supplierName,
    unit: p.unit,
    price: String(p.price),
    active: p.active,
    stockQuantity: String(p.stockQuantity),
    minStockAlert: String(p.minStockAlert),
    maxStock: p.maxStock !== null ? String(p.maxStock) : '',
    location: p.location,
    classifications: p.classifications ?? [],
    description: p.description,
    notes: p.notes,
    imageUrl: p.imageUrl,
  }
}

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (input: ProductInput) => Promise<void>
}

export default function ProdutoModal({ open, product, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (open) {
      setForm(product ? toFormState(product) : EMPTY)
      setSaving(false)
      setError(null)
    }
  }, [open, product])

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
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function toggleClassification(c: ProductClassification) {
    setForm(f => ({
      ...f,
      classifications: f.classifications.includes(c)
        ? f.classifications.filter(x => x !== c)
        : [...f.classifications, c],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity) || 0,
        minStockAlert: Number(form.minStockAlert) || 0,
        maxStock: form.maxStock ? Number(form.maxStock) : null,
        categoryId: form.categoryId || null,
        sku: form.sku.trim() || undefined,
        brand: form.brand.trim() || undefined,
        supplierName: form.supplierName.trim() || undefined,
        unit: form.unit,
        imageUrl: form.imageUrl || undefined,
        classifications: form.classifications,
        location: form.location.trim() || undefined,
        active: form.active,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={product ? 'Editar produto' : 'Novo produto'}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Package size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="produto-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">

            {/* Nome + Categoria */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="p-nome" className={LABEL}>Nome do produto *</label>
                <input id="p-nome" type="text" required value={form.name} onChange={setField('name')} placeholder="Ex.: Shampoo Hidratante 300mL" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-cat" className={LABEL}>Categoria</label>
                <select id="p-cat" value={form.categoryId} onChange={setField('categoryId')} className={INPUT}>
                  <option value="">Sem categoria</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* SKU + Marca + Fornecedor */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="p-sku" className={LABEL}>SKU</label>
                <input id="p-sku" type="text" value={form.sku} onChange={setField('sku')} placeholder="Ex.: SH-001" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-brand" className={LABEL}>Marca</label>
                <input id="p-brand" type="text" value={form.brand} onChange={setField('brand')} placeholder="Ex.: L'Oréal" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-supplier" className={LABEL}>Fornecedor</label>
                <input id="p-supplier" type="text" value={form.supplierName} onChange={setField('supplierName')} placeholder="Nome do fornecedor" className={INPUT} />
              </div>
            </div>

            {/* Unidade + Preço + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="p-unit" className={LABEL}>Unidade</label>
                <select id="p-unit" value={form.unit} onChange={setField('unit')} className={INPUT}>
                  {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-price" className={LABEL}>Preço (R$) *</label>
                <input id="p-price" type="number" required min="0.01" step="0.01" value={form.price} onChange={setField('price')} placeholder="0,00" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-status" className={LABEL}>Status</label>
                <select id="p-status" value={form.active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))} className={INPUT}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            {/* Estoque: Qtd + Mín + Máx + Localização */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label htmlFor="p-qty" className={LABEL}>Estoque atual</label>
                <input id="p-qty" type="number" min="0" step="1" value={form.stockQuantity} onChange={setField('stockQuantity')} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-min" className={LABEL}>Estoque mín.</label>
                <input id="p-min" type="number" min="0" step="1" value={form.minStockAlert} onChange={setField('minStockAlert')} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-max" className={LABEL}>Estoque máx.</label>
                <input id="p-max" type="number" min="0" step="1" value={form.maxStock} onChange={setField('maxStock')} placeholder="—" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-loc" className={LABEL}>Localização</label>
                <input id="p-loc" type="text" value={form.location} onChange={setField('location')} placeholder="Ex.: Prateleira A3" className={INPUT} />
              </div>
            </div>

            {/* Classificações */}
            <div className="space-y-2">
              <p className={LABEL}>Classificações</p>
              <div className="flex flex-wrap gap-2">
                {CLASSIFICATION_OPTIONS.map(({ value, label }) => {
                  const active = form.classifications.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleClassification(value)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        active
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Descrição + Obs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="p-desc" className={LABEL}>Descrição</label>
                <textarea id="p-desc" rows={3} value={form.description} onChange={setField('description')} placeholder="Descreva o produto…" className={cn(INPUT, 'resize-none')} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p-notes" className={LABEL}>Observações</label>
                <textarea id="p-notes" rows={3} value={form.notes} onChange={setField('notes')} placeholder="Uso interno, validade, etc." className={cn(INPUT, 'resize-none')} />
              </div>
            </div>

            {/* Imagem */}
            <div className="border-t border-[#F1F5F9] pt-5">
              <PhotoUpload
                photos={form.imageUrl ? [form.imageUrl] : []}
                onChange={(photos) => setForm(f => ({ ...f, imageUrl: photos[0] ?? '' }))}
                maxPhotos={1}
                maxSizeMB={5}
                label="Imagem do Produto (opcional)"
                sublabel="JPG, PNG ou WEBP · máx. 5MB"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#F1F5F9] px-5 py-4">
          {error && <p className="text-[12px] text-[#DC2626]" role="alert">{error}</p>}
          <div className="flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" form="produto-form" disabled={saving} className="flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1 disabled:opacity-50">
              <Package size={13} aria-hidden="true" />
              {saving ? 'Salvando…' : product ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
