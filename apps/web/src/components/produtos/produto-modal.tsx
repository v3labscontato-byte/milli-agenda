'use client'

import { useEffect, useState } from 'react'
import { X, Package, Tag, Archive, Layers, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoUpload from '@/components/shared/photo-upload'
import type { Product, ProductInput, ProductUnit, ProductClassification } from '@/hooks/use-produtos'

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'UNIT', label: 'Unidade' },
  { value: 'ML',   label: 'mL'      },
  { value: 'G',    label: 'g'       },
  { value: 'KG',   label: 'kg'      },
  { value: 'LITER',label: 'L'       },
]

const CLASSIFICATION_OPTIONS: { value: ProductClassification; label: string }[] = [
  { value: 'RESALE',       label: 'Revenda'      },
  { value: 'INTERNAL_USE', label: 'Uso Interno'  },
  { value: 'PROCEDURE',    label: 'Procedimento' },
  { value: 'CONSUMABLE',   label: 'Consumível'   },
]

// ─── Shared style tokens ──────────────────────────────────────────────────────

const LABEL = 'mb-1.5 block text-[11px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

// ─── Section card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  badge?: string
  children: React.ReactNode
}

function SectionCard({ icon, title, badge, children }: SectionCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3.5">
        {icon}
        <span className="text-[14px] font-semibold text-[#0F172A]">{title}</span>
        {badge && (
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  )
}

function CardIcon({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: bg, color }}>
      {children}
    </div>
  )
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string; categoryId: string; sku: string; brand: string; supplierName: string
  unit: ProductUnit; price: string; active: boolean
  stockQuantity: string; minStockAlert: string; maxStock: string; location: string
  classifications: ProductClassification[]; description: string; notes: string; imageUrl: string
}

const EMPTY: FormState = {
  name: '', categoryId: '', sku: '', brand: '', supplierName: '',
  unit: 'UNIT', price: '', active: true,
  stockQuantity: '0', minStockAlert: '0', maxStock: '',
  location: '', classifications: [], description: '', notes: '', imageUrl: '',
}

function toFormState(p: Product): FormState {
  return {
    name: p.name, categoryId: p.categoryId ?? '', sku: p.sku, brand: p.brand,
    supplierName: p.supplierName, unit: p.unit, price: String(p.price), active: p.active,
    stockQuantity: String(p.stockQuantity), minStockAlert: String(p.minStockAlert),
    maxStock: p.maxStock !== null ? String(p.maxStock) : '',
    location: p.location, classifications: p.classifications ?? [],
    description: p.description, notes: p.notes, imageUrl: p.imageUrl,
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (input: ProductInput) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProdutoModal({ open, product, onClose, onSave }: Props) {
  const [visible, setVisible] = useState(false)
  const [form, setForm]       = useState<FormState>(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [categorias, setCategorias] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-4"
      role="dialog" aria-modal="true"
      aria-label={product ? 'Editar produto' : 'Novo produto'}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose} aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 flex w-full max-w-2xl flex-col rounded-t-2xl bg-[#F1F5F9] shadow-2xl lg:rounded-xl',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 lg:translate-y-0',
        )}
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 rounded-t-2xl lg:rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Package size={20} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                {product ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                {product ? `Editando ${product.name}` : 'Preencha os dados do produto'}
              </p>
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <form id="produto-form" onSubmit={handleSubmit} className="space-y-4 p-5">

            {/* ── Card 1: Informações Gerais ── */}
            <SectionCard
              icon={<CardIcon bg="#EFF6FF" color="#2563EB"><Package size={14} aria-hidden /></CardIcon>}
              title="Informações Gerais"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="p-nome" className={LABEL}>Nome do produto *</label>
                  <input id="p-nome" type="text" required value={form.name} onChange={setField('name')}
                    placeholder="Ex.: Shampoo Hidratante 300mL" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-cat" className={LABEL}>Categoria</label>
                  <select id="p-cat" value={form.categoryId} onChange={setField('categoryId')} className={INPUT}>
                    <option value="">Sem categoria</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="p-sku" className={LABEL}>SKU</label>
                  <input id="p-sku" type="text" value={form.sku} onChange={setField('sku')}
                    placeholder="Ex.: SH-001" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-brand" className={LABEL}>Marca</label>
                  <input id="p-brand" type="text" value={form.brand} onChange={setField('brand')}
                    placeholder="Ex.: L'Oréal" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-supplier" className={LABEL}>Fornecedor</label>
                  <input id="p-supplier" type="text" value={form.supplierName} onChange={setField('supplierName')}
                    placeholder="Nome do fornecedor" className={INPUT} />
                </div>
              </div>
            </SectionCard>

            {/* ── Card 2: Preço e Unidade ── */}
            <SectionCard
              icon={<CardIcon bg="#ECFDF5" color="#16A34A"><Tag size={14} aria-hidden /></CardIcon>}
              title="Preço e Unidade"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="p-price" className={LABEL}>Preço (R$) *</label>
                  <input id="p-price" type="number" required min="0.01" step="0.01"
                    value={form.price} onChange={setField('price')} placeholder="0,00" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-unit" className={LABEL}>Unidade</label>
                  <select id="p-unit" value={form.unit} onChange={setField('unit')} className={INPUT}>
                    {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="p-status" className={LABEL}>Status</label>
                  <select id="p-status" value={form.active ? 'true' : 'false'}
                    onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))} className={INPUT}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* ── Card 3: Estoque ── */}
            <SectionCard
              icon={<CardIcon bg="#FEF3C7" color="#B45309"><Archive size={14} aria-hidden /></CardIcon>}
              title="Estoque"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label htmlFor="p-qty" className={LABEL}>Qtd. atual</label>
                  <input id="p-qty" type="number" min="0" step="1"
                    value={form.stockQuantity} onChange={setField('stockQuantity')} className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-min" className={LABEL}>Mínimo</label>
                  <input id="p-min" type="number" min="0" step="1"
                    value={form.minStockAlert} onChange={setField('minStockAlert')} className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-max" className={LABEL}>Máximo</label>
                  <input id="p-max" type="number" min="0" step="1"
                    value={form.maxStock} onChange={setField('maxStock')} placeholder="—" className={INPUT} />
                </div>
                <div>
                  <label htmlFor="p-loc" className={LABEL}>Localização</label>
                  <input id="p-loc" type="text" value={form.location} onChange={setField('location')}
                    placeholder="Ex.: Prateleira A3" className={INPUT} />
                </div>
              </div>
            </SectionCard>

            {/* ── Card 4: Classificações ── */}
            <SectionCard
              icon={<CardIcon bg="#EDE9FE" color="#7C3AED"><Layers size={14} aria-hidden /></CardIcon>}
              title="Classificações"
              badge={form.classifications.length > 0 ? `${form.classifications.length} selecionada${form.classifications.length !== 1 ? 's' : ''}` : undefined}
            >
              <div className="flex flex-wrap gap-2" role="group" aria-label="Classificações do produto">
                {CLASSIFICATION_OPTIONS.map(({ value, label }) => {
                  const active = form.classifications.includes(value)
                  return (
                    <button
                      key={value} type="button"
                      onClick={() => toggleClassification(value)} aria-pressed={active}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        active
                          ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED] shadow-[0_0_0_1px_#7C3AED]'
                          : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#C4B5FD] hover:text-[#7C3AED]',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            {/* ── Card 5: Detalhes e Imagem ── */}
            <SectionCard
              icon={<CardIcon bg="#F1F5F9" color="#64748B"><FileText size={14} aria-hidden /></CardIcon>}
              title="Detalhes e Imagem"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="p-desc" className={LABEL}>Descrição</label>
                  <textarea id="p-desc" rows={3} value={form.description} onChange={setField('description')}
                    placeholder="Descreva o produto…" className={cn(INPUT, 'resize-none')} />
                </div>
                <div>
                  <label htmlFor="p-notes" className={LABEL}>Observações</label>
                  <textarea id="p-notes" rows={3} value={form.notes} onChange={setField('notes')}
                    placeholder="Uso interno, validade, etc." className={cn(INPUT, 'resize-none')} />
                </div>
              </div>
              <PhotoUpload
                photos={form.imageUrl ? [form.imageUrl] : []}
                onChange={(photos) => setForm(f => ({ ...f, imageUrl: photos[0] ?? '' }))}
                maxPhotos={1}
                maxSizeMB={5}
                label="Imagem do Produto (opcional)"
                sublabel="JPG, PNG ou WEBP · máx. 5MB"
              />
            </SectionCard>

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#E2E8F0] bg-white px-6 py-4 lg:rounded-b-xl">
          {error && <p className="text-[12px] text-[#DC2626]" role="alert">{error}</p>}
          <div className="flex items-center gap-2.5">
            <button
              type="button" onClick={onClose} disabled={saving}
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569]',
                'transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              Cancelar
            </button>
            <button
              type="submit" form="produto-form" disabled={saving}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-semibold text-white',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                saving
                  ? 'cursor-not-allowed bg-[#93C5FD]'
                  : 'bg-[#2563EB] shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:bg-[#1D4ED8]',
              )}
            >
              <Package size={14} aria-hidden="true" />
              {saving ? 'Salvando…' : product ? 'Salvar Produto' : 'Cadastrar Produto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
