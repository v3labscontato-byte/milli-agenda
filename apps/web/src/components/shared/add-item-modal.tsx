'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/business-rules'
import type { ComandaItem, ItemCategory } from '@/lib/comanda-mock'

type Tab = 'service' | 'product' | 'fee' | 'adjustment'

interface CatalogEntry {
  serviceId?: string
  productId?: string
  name: string
  unitPrice: number
  stock?: number
}

const FEE_CATALOG: CatalogEntry[] = [
  { name: 'Gorjeta',      unitPrice: 10 },
  { name: 'Taxa Cartão',  unitPrice: 5  },
  { name: 'Taxa Entrega', unitPrice: 8  },
]

const TAB_LABELS: Record<Tab, string> = {
  service:    'Serviços',
  product:    'Produtos',
  fee:        'Taxas',
  adjustment: 'Ajuste',
}

const TABS: Tab[] = ['service', 'product', 'fee', 'adjustment']

export interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<ComandaItem, 'id'> & { serviceId?: string; productId?: string }) => void
}

export default function AddItemModal({ open, onClose, onAdd }: AddItemModalProps) {
  const [tab, setTab]                         = useState<Tab>('service')
  const [search, setSearch]                   = useState('')
  const [selected, setSelected]               = useState<CatalogEntry | null>(null)
  const [quantity, setQuantity]               = useState('1')
  const [price, setPrice]                     = useState('')
  const [adjName, setAdjName]                 = useState('')
  const [adjPrice, setAdjPrice]               = useState('')
  const [apiServices, setApiServices]         = useState<CatalogEntry[]>([])
  const [apiProducts, setApiProducts]         = useState<CatalogEntry[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    if (!open) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) return
    const base = process.env.NEXT_PUBLIC_API_URL
    const headers = { Authorization: `Bearer ${token}` }

    setLoadingServices(true)
    fetch(`${base}/api/v1/services`, { headers })
      .then((r) => r.json())
      .then((res: { data?: { id?: string; name?: string; price?: number | string }[] }) => {
        setApiServices(
          (res.data ?? []).map((s) => ({
            serviceId: String(s.id ?? ''),
            name:      String(s.name ?? ''),
            unitPrice: Number(s.price ?? 0),
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoadingServices(false))

    setLoadingProducts(true)
    fetch(`${base}/api/v1/products?onlyActive=true`, { headers })
      .then((r) => r.json())
      .then((res: { data?: { id?: string; name?: string; price?: number | string; stockQuantity?: number }[] }) => {
        setApiProducts(
          (res.data ?? []).map((p) => ({
            productId: String(p.id ?? ''),
            name:      String(p.name ?? ''),
            unitPrice: Number(p.price ?? 0),
            stock:     Number(p.stockQuantity ?? 0),
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    setSelected(null)
    setSearch('')
    setQuantity('1')
    setPrice('')
    setAdjName('')
    setAdjPrice('')
  }, [tab, open])

  if (!open) return null

  function handleSelectEntry(entry: CatalogEntry) {
    if (tab === 'product' && (entry.stock ?? 1) === 0) return
    setSelected(entry)
    setPrice(String(entry.unitPrice))
  }

  function handleAdd() {
    if (tab === 'adjustment') {
      const val = parseFloat(adjPrice)
      if (!adjName.trim() || isNaN(val)) return
      onAdd({ name: adjName.trim(), category: 'adjustment', quantity: 1, unitPrice: val })
    } else {
      if (!selected) return
      const qty  = Math.max(1, parseInt(quantity) || 1)
      const unit = parseFloat(price) || selected.unitPrice
      onAdd({
        serviceId: selected.serviceId,
        productId: selected.productId,
        name: selected.name,
        category: tab as ItemCategory,
        quantity: qty,
        unitPrice: unit,
      })
    }
    onClose()
  }

  const catalog: CatalogEntry[] =
    tab === 'service'    ? apiServices :
    tab === 'product'    ? apiProducts :
    tab === 'fee'        ? FEE_CATALOG :
    []

  const q        = search.trim().toLowerCase()
  const entries  = q ? catalog.filter((e) => e.name.toLowerCase().includes(q)) : catalog
  const loading  = (tab === 'service' && loadingServices) || (tab === 'product' && loadingProducts)
  const canAdd   = tab === 'adjustment'
    ? adjName.trim().length > 0 && !isNaN(parseFloat(adjPrice))
    : selected !== null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Adicionar item">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-xl" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <p className="text-[15px] font-semibold text-[#0F172A]">Adicionar item</p>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-[#E2E8F0]" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 border-b-2 py-2.5 text-[12px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                tab === t ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#475569] hover:text-[#0F172A]',
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'adjustment' ? (
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#64748B]">Descrição</label>
                <input type="text" value={adjName} onChange={(e) => setAdjName(e.target.value)} placeholder="Ex: Gorjeta especial" className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#64748B]">Valor (R$)</label>
                <input type="number" min="0" step="0.01" value={adjPrice} onChange={(e) => setAdjPrice(e.target.value)} placeholder="0,00" className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[13px] font-tabular placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 px-4 pt-3 pb-2">
                <div className="relative">
                  <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…" className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3 text-[13px] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 text-[13px] text-[#94A3B8]">
                  Carregando…
                </div>
              ) : (
                <ul className="divide-y divide-[#F1F5F9]">
                  {entries.length === 0 && (
                    <li className="px-5 py-6 text-center text-[13px] text-[#94A3B8]">
                      Nenhum item encontrado
                    </li>
                  )}
                  {entries.map((entry) => {
                    const isSel     = selected?.name === entry.name
                    const outOfStock = tab === 'product' && (entry.stock ?? 1) === 0
                    return (
                      <li key={entry.productId ?? entry.serviceId ?? entry.name}>
                        <button
                          type="button"
                          onClick={() => handleSelectEntry(entry)}
                          disabled={outOfStock}
                          className={cn(
                            'flex w-full items-center justify-between px-5 py-3 text-left transition-colors',
                            'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                            outOfStock
                              ? 'cursor-not-allowed opacity-40'
                              : isSel
                                ? 'bg-[#EFF6FF] hover:bg-[#EFF6FF]'
                                : 'hover:bg-[#F8FAFC]',
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn('text-[13px]', isSel ? 'font-semibold text-[#2563EB]' : 'text-[#0F172A]')}>
                              {entry.name}
                            </span>
                            {tab === 'product' && (
                              <span className={cn('text-[11px]', (entry.stock ?? 0) === 0 ? 'text-[#DC2626]' : 'text-[#64748B]')}>
                                {(entry.stock ?? 0) === 0 ? 'Sem estoque' : `${entry.stock} em estoque`}
                              </span>
                            )}
                          </div>
                          <span className="font-tabular text-[13px] text-[#475569]">{formatBRL(entry.unitPrice)}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {selected && (
                <div className="flex gap-3 border-t border-[#E2E8F0] px-5 py-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-medium text-[#475569]">Qtd.</label>
                    <input type="number" min="1" max={tab === 'product' && selected?.stock != null ? selected.stock : undefined} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-[13px] font-tabular focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-medium text-[#475569]">Preço (R$)</label>
                    <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-[13px] font-tabular focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#E2E8F0] px-5 py-4">
          <button type="button" onClick={handleAdd} disabled={!canAdd} className={cn('w-full rounded-xl py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1', canAdd ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
