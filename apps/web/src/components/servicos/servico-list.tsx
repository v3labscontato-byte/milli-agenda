'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Servico } from '@/lib/servicos-mock'
import { formatBRL } from '@/lib/servicos-mock'
import { CategoryBadge, DurationChip } from './servico-card'

type SortKey = 'name' | 'price' | 'bookingsThisMonth' | 'revenueThisMonth'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="text-[var(--color-text-disabled)]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[var(--color-brand)]" aria-hidden="true" />
    : <ChevronDown size={12} className="text-[var(--color-brand)]" aria-hidden="true" />
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] text-left'
const TH_R = cn(TH, 'text-right')
const TH_S = cn(TH, 'cursor-pointer select-none hover:text-[var(--color-text-secondary)] transition-colors')

interface Props {
  servicos: Servico[]
  isFiltered?: boolean
  onView: (s: Servico) => void
  onUpdate?: (id: string, data: { name?: string; durationMin?: number; price?: number; categoryId?: string | null }) => Promise<void>
  onToggleStatus?: (id: string, active: boolean) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

function ServicoList({ servicos, isFiltered = false, onView, onUpdate, onToggleStatus, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [categorias, setCategorias] = useState<Array<{ id: string; name: string }>>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

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

  type EditingCell = { id: string; field: 'duration' | 'price' } | null
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [editValue, setEditValue]     = useState('')
  const [savingCell, setSavingCell]   = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editNameVal, setEditNameVal] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)

  function startEdit(id: string, field: 'duration' | 'price', current: number) {
    setEditingCell({ id, field })
    setEditValue(field === 'price' ? current.toFixed(2) : String(current))
  }

  async function saveEdit(id: string, field: 'duration' | 'price') {
    if (!onUpdate) { setEditingCell(null); return }
    setSavingCell(id + field)
    try {
      if (field === 'duration') await onUpdate(id, { durationMin: Number(editValue) })
      else await onUpdate(id, { price: parseFloat(editValue) })
      setEditingCell(null)
    } catch { /* user can retry */ } finally {
      setSavingCell(null)
    }
  }

  async function handleSaveName(id: string) {
    const trimmed = editNameVal.trim()
    setEditingName(null)
    if (!onUpdate || !trimmed) return
    try { await onUpdate(id, { name: trimmed }) } catch { /* ignore */ }
  }

  async function handleDelete() {
    if (!deleteModal || !onDelete) return
    try { await onDelete(deleteModal.id) } catch { /* ignore */ }
    setDeleteModal(null)
  }

  function cancelEdit() { setEditingCell(null); setEditValue('') }

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir(k === 'name' ? 'asc' : 'desc') }
  }

  const sorted = useMemo(() => {
    const list = [...servicos]
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'name')              diff = a.name.localeCompare(b.name, 'pt-BR')
      if (sortKey === 'price')             diff = a.price - b.price
      if (sortKey === 'bookingsThisMonth') diff = a.bookingsThisMonth - b.bookingsThisMonth
      if (sortKey === 'revenueThisMonth')  diff = a.revenueThisMonth - b.revenueThisMonth
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [servicos, sortKey, sortDir])

  if (sorted.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2">
        <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">
          {isFiltered ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
        </p>
        {isFiltered && <p className="text-[12px] text-[var(--color-text-tertiary)]">Tente ajustar os filtros</p>}
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-border-primary)]">
              <th scope="col" className={cn(TH_S, 'min-w-[180px]')} onClick={() => handleSort('name')}
                aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="flex items-center gap-1">Serviço <SortIcon col="name" active={sortKey} dir={sortDir} /></span>
              </th>
              <th scope="col" className={TH}>Categoria</th>
              <th scope="col" className={TH}>Duração</th>
              <th scope="col" className={cn(TH_S, TH_R)} onClick={() => handleSort('price')}
                aria-sort={sortKey === 'price' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="flex items-center justify-end gap-1">Preço <SortIcon col="price" active={sortKey} dir={sortDir} /></span>
              </th>
              <th scope="col" className={cn(TH_S, TH_R)} onClick={() => handleSort('bookingsThisMonth')}
                aria-sort={sortKey === 'bookingsThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="flex items-center justify-end gap-1">Agend./Mês <SortIcon col="bookingsThisMonth" active={sortKey} dir={sortDir} /></span>
              </th>
              <th scope="col" className={cn(TH_S, TH_R)} onClick={() => handleSort('revenueThisMonth')}
                aria-sort={sortKey === 'revenueThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="flex items-center justify-end gap-1">Fat./Mês <SortIcon col="revenueThisMonth" active={sortKey} dir={sortDir} /></span>
              </th>
              <th scope="col" className={TH}>Status</th>
              <th scope="col" className={cn(TH, 'w-20')}>Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-surface-tertiary)]">
            {sorted.map((s) => (
              <tr key={s.id} className="group transition-colors hover:bg-[var(--color-surface-secondary)]">

                {/* Serviço — foto + nome editável */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.photos.length > 0 ? (
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.photos[0]} alt="" aria-hidden="true" className="h-10 w-10 rounded-lg object-cover" />
                        <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[9px] font-bold text-white">
                          {s.photos.length}
                        </span>
                      </div>
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-[var(--color-border-primary)]" aria-hidden="true" />
                    )}
                    {editingName === s.id ? (
                      <input
                        autoFocus
                        value={editNameVal}
                        onChange={(e) => setEditNameVal(e.target.value)}
                        onBlur={() => void handleSaveName(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSaveName(s.id)
                          if (e.key === 'Escape') setEditingName(null)
                        }}
                        className="w-36 rounded border border-[var(--color-brand)] px-2 py-0.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                      />
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        title="Clique para editar o nome"
                        onClick={() => { setEditingName(s.id); setEditNameVal(s.name) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setEditingName(s.id); setEditNameVal(s.name) } }}
                        className="cursor-pointer font-medium text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-brand)]"
                      >
                        {s.name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Categoria */}
                <td className="px-4 py-3">
                  {editingCategory === s.id ? (
                    <select
                      autoFocus
                      value={s.categoryId ?? ''}
                      onChange={async (e) => {
                        const categoryId = e.target.value || null
                        await onUpdate?.(s.id, { categoryId })
                        setEditingCategory(null)
                      }}
                      onBlur={() => setEditingCategory(null)}
                      className="rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[12px] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="">Sem categoria</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingCategory(s.id)}
                      className="text-left transition-opacity hover:opacity-70"
                      title="Clique para editar categoria"
                    >
                      {s.category
                        ? <CategoryBadge category={s.category} />
                        : <span className="text-[12px] italic text-[#94A3B8]">Sem categoria</span>
                      }
                    </button>
                  )}
                </td>

                {/* Duração */}
                <td className="px-4 py-3">
                  {editingCell?.id === s.id && editingCell.field === 'duration' ? (
                    <span className="flex items-center gap-1">
                      <input type="number" min="5" step="5" value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(s.id, 'duration'); if (e.key === 'Escape') cancelEdit() }}
                        autoFocus className="w-20 rounded-md border border-[var(--color-brand)] px-2 py-1 text-[13px] focus:outline-none" />
                      <button type="button" onClick={() => void saveEdit(s.id, 'duration')} disabled={savingCell === s.id + 'duration'}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#059669] hover:bg-[#ECFDF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                        <Check size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <DurationChip minutes={s.duration} />
                      {onUpdate && (
                        <button type="button" onClick={() => startEdit(s.id, 'duration', s.duration)}
                          className="rounded text-[var(--color-text-tertiary)] opacity-0 transition-colors group-hover:opacity-100 hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  )}
                </td>

                {/* Preço */}
                <td className="px-4 py-3 text-right">
                  {editingCell?.id === s.id && editingCell.field === 'price' ? (
                    <span className="flex items-center justify-end gap-1">
                      <span className="text-[12px] text-[#64748B]">R$</span>
                      <input type="number" min="0" step="0.01" value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(s.id, 'price'); if (e.key === 'Escape') cancelEdit() }}
                        autoFocus className="w-20 rounded-md border border-[var(--color-brand)] px-2 py-1 text-[13px] text-right focus:outline-none" />
                      <button type="button" onClick={() => void saveEdit(s.id, 'price')} disabled={savingCell === s.id + 'price'}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#059669] hover:bg-[#ECFDF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                        <Check size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="font-tabular font-semibold text-[var(--color-text-primary)]">{formatBRL(s.price)}</span>
                      {onUpdate && (
                        <button type="button" onClick={() => startEdit(s.id, 'price', s.price)}
                          className="rounded text-[var(--color-text-tertiary)] opacity-0 transition-colors group-hover:opacity-100 hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  )}
                </td>

                {/* Agendamentos mês */}
                <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">
                  {s.bookingsThisMonth > 0 ? s.bookingsThisMonth : <span className="text-[var(--color-text-disabled)]">—</span>}
                </td>

                {/* Faturamento mês */}
                <td className="px-4 py-3 text-right font-tabular font-semibold text-[var(--color-text-primary)]">
                  {s.revenueThisMonth > 0 ? formatBRL(s.revenueThisMonth) : <span className="font-normal text-[var(--color-text-disabled)]">—</span>}
                </td>

                {/* Status — clicável */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void onToggleStatus?.(s.id, s.status !== 'active')}
                    disabled={!onToggleStatus}
                    aria-label={`Status ${s.status === 'active' ? 'Ativo' : 'Inativo'} — clique para alternar`}
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                      onToggleStatus ? 'cursor-pointer' : 'cursor-default',
                      s.status === 'active'
                        ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]'
                        : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-primary)]',
                    )}
                  >
                    {s.status === 'active' ? 'Ativo' : 'Inativo'}
                  </button>
                </td>

                {/* Ações */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => onView(s)} aria-label={`Ver detalhes de ${s.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                      <Eye size={15} aria-hidden="true" />
                    </button>
                    {onDelete && (
                      <button type="button" onClick={() => setDeleteModal({ id: s.id, name: s.name })}
                        aria-label={`Excluir ${s.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal */}
      {deleteModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="del-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 id="del-title" className="text-[15px] font-semibold text-[var(--color-text-primary)]">Excluir serviço</h3>
            <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
              Tem certeza que deseja excluir <strong>{deleteModal.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button type="button" autoFocus onClick={() => setDeleteModal(null)}
                className="rounded-lg border border-[var(--color-border-primary)] px-4 py-2 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                Cancelar
              </button>
              <button type="button" onClick={() => void handleDelete()}
                className="rounded-lg bg-[var(--color-danger)] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[var(--color-danger-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ServicoList)
