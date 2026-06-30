'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, X, Package, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProdutos, type Product } from '@/hooks/use-produtos'
import ProdutoModal from '@/components/produtos/produto-modal'

const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps { label: string; value: React.ReactNode; sub: string; accent?: 'default' | 'warn' | 'danger' }

function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  const colors = {
    default: { border: 'border-[var(--color-border-primary)] bg-white', val: 'text-[var(--color-text-primary)]', label: 'text-[var(--color-text-primary)]', sub: 'text-[var(--color-text-tertiary)]' },
    warn:    { border: 'border-[#F59E0B] bg-[#FFFBEB]', val: 'text-[#B45309]', label: 'text-[#92400E]', sub: 'text-[#A16207]' },
    danger:  { border: 'border-[#EF4444] bg-[#FFF5F5]', val: 'text-[#DC2626]', label: 'text-[#991B1B]', sub: 'text-[#B91C1C]' },
  }[accent ?? 'default']
  return (
    <div className={cn('flex flex-col rounded-xl border p-5', colors.border)}>
      <span className={cn('font-tabular text-3xl font-bold leading-none', colors.val)}>{value}</span>
      <span className={cn('mt-1.5 text-sm font-semibold', colors.label)}>{label}</span>
      <span className={cn('mt-0.5 text-[11px]', colors.sub)}>{sub}</span>
    </div>
  )
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ product }: { product: Product }) {
  if (product.stockQuantity === 0) {
    return <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">Sem estoque</span>
  }
  if (product.stockQuantity <= product.minStockAlert) {
    return <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">Estoque baixo</span>
  }
  return <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">OK</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const [search, setSearch] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [outOfStockFilter, setOutOfStockFilter] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>(null)

  const { data: products, loading, error, stats, create, update } = useProdutos()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (outOfStockFilter && p.stockQuantity !== 0) return false
      if (lowStockFilter && !outOfStockFilter && !(p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert)) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [products, search, lowStockFilter, outOfStockFilter])

  const isFiltered = search.trim().length > 0 || lowStockFilter || outOfStockFilter

  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[var(--color-border-primary)] bg-white px-6 py-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0,1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--color-surface-tertiary)]" />)}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0,1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-tertiary)]" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-[var(--color-danger)]">{error}</p>
    </div>
  )

  return (
    <div className="flex h-full flex-col">

      {/* ── KPI strip ── */}
      <div className="shrink-0 border-b border-[var(--color-border-primary)] bg-white">
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Visão geral</p>
          <button
            type="button"
            onClick={() => setModalProduct('new')}
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-3 py-1.5',
              'text-[12px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] focus-visible:ring-offset-1',
            )}
          >
            <Plus size={13} aria-hidden="true" />
            Novo Produto
          </button>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 px-6 pb-5 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Total" value={stats.totalProducts} sub="produtos ativos" />
          <KpiCard label="Estoque baixo" value={stats.lowStockCount} sub="abaixo do mínimo" accent={stats.lowStockCount > 0 ? 'warn' : 'default'} />
          <KpiCard label="Sem estoque" value={stats.outOfStockCount} sub="quantidade zero" accent={stats.outOfStockCount > 0 ? 'danger' : 'default'} />
          <KpiCard label="Valor em estoque" value={<span className="text-[22px]">{formatBRL(stats.totalStockValue)}</span>} sub="preço × quantidade" />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="shrink-0 border-b border-[var(--color-border-primary)] bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" aria-hidden="true" />
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, SKU, marca…"
              aria-label="Buscar produto"
              className={cn(
                'w-64 rounded-md border border-[var(--color-border-primary)] bg-white py-1.5 pl-8 pr-8 text-[13px] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-secondary)]',
                'focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]',
              )}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5" role="group" aria-label="Filtros de estoque">
            {[
              { label: 'Estoque baixo', active: lowStockFilter, toggle: () => { setLowStockFilter(v => !v); if (!lowStockFilter) setOutOfStockFilter(false) } },
              { label: 'Sem estoque',   active: outOfStockFilter, toggle: () => { setOutOfStockFilter(v => !v); if (!outOfStockFilter) setLowStockFilter(false) } },
            ].map(({ label, active, toggle }) => (
              <button key={label} type="button" onClick={toggle} aria-pressed={active}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                  active
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >{label}</button>
            ))}
          </div>

          {isFiltered && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--color-text-tertiary)]">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
              <button type="button" onClick={() => { setSearch(''); setLowStockFilter(false); setOutOfStockFilter(false) }}
                className="flex items-center gap-1 rounded text-[12px] text-[var(--color-text-tertiary)] underline-offset-2 hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                <X size={11} aria-hidden="true" /> Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white">
        {products.length === 0 && !isFiltered ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)]">
              <Package size={20} className="text-[var(--color-text-tertiary)]" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">Nenhum produto cadastrado</p>
              <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">Cadastre seu primeiro produto para começar.</p>
            </div>
            <button type="button" onClick={() => setModalProduct('new')}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] focus-visible:ring-offset-1">
              <Plus size={14} aria-hidden="true" /> Novo Produto
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2">
            <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">Nenhum produto encontrado</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">Tente ajustar os filtros</p>
          </div>
        ) : (
          <table className="w-full min-w-[780px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                {['Produto', 'Categoria', 'Estoque', 'Preço', 'Status', ''].map((h, i) => (
                  <th key={i} scope="col" className={cn(
                    'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] text-left',
                    i >= 2 && i <= 3 ? 'text-right' : '',
                    i === 5 ? 'w-12' : '',
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-tertiary)]">
              {filtered.map(p => (
                <tr key={p.id} className="group transition-colors hover:bg-[var(--color-surface-secondary)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.imageUrl} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--color-border-primary)]" aria-hidden="true">
                          <Package size={14} className="text-[var(--color-text-tertiary)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{p.name}</p>
                        {(p.sku || p.brand) && (
                          <p className="text-[11px] text-[var(--color-text-tertiary)]">
                            {[p.sku && `SKU: ${p.sku}`, p.brand].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category
                      ? <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: p.category.color + '22', color: p.category.color }}>{p.category.name}</span>
                      : <span className="text-[12px] italic text-[#94A3B8]">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-tabular font-semibold text-[var(--color-text-primary)]">{p.stockQuantity}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">mín. {p.minStockAlert}</span>
                        <StockBadge product={p} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-tabular font-semibold text-[var(--color-text-primary)]">
                    {formatBRL(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                      p.active
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]',
                    )}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setModalProduct(p)}
                      aria-label={`Editar ${p.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ── */}
      <ProdutoModal
        open={modalProduct !== null}
        product={modalProduct === 'new' ? null : modalProduct}
        onClose={() => setModalProduct(null)}
        onSave={async (input) => {
          if (modalProduct === 'new' || modalProduct === null) {
            await create(input)
          } else {
            await update(modalProduct.id, input)
          }
        }}
      />
    </div>
  )
}
