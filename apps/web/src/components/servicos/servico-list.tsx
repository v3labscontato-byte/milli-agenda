'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Servico } from '@/lib/servicos-mock'
import { formatBRL, formatDuration } from '@/lib/servicos-mock'
import { CategoryBadge, ServicoStatusBadge, DurationChip } from './servico-card'

type SortKey = 'name' | 'price' | 'bookingsThisMonth' | 'revenueThisMonth'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="text-[#CBD5E1]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[#2563EB]" aria-hidden="true" />
    : <ChevronDown size={12} className="text-[#2563EB]" aria-hidden="true" />
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] text-left'
const TH_R = cn(TH, 'text-right')
const TH_S = cn(TH, 'cursor-pointer select-none hover:text-[#475569] transition-colors')

interface Props {
  servicos: Servico[]
  isFiltered?: boolean
  onView: (s: Servico) => void
  onUpdate?: (id: string, data: { durationMin?: number; price?: number }) => Promise<void>
}

function ServicoList({ servicos, isFiltered = false, onView, onUpdate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  type EditingCell = { id: string; field: 'duration' | 'price' } | null
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [editValue, setEditValue] = useState('')
  const [savingCell, setSavingCell] = useState<string | null>(null)

  function startEdit(id: string, field: 'duration' | 'price', currentValue: number) {
    setEditingCell({ id, field })
    setEditValue(field === 'price' ? currentValue.toFixed(2) : String(currentValue))
  }

  async function saveEdit(id: string, field: 'duration' | 'price') {
    if (!onUpdate) { setEditingCell(null); return }
    setSavingCell(id + field)
    try {
      if (field === 'duration') {
        await onUpdate(id, { durationMin: Number(editValue) })
      } else {
        await onUpdate(id, { price: parseFloat(editValue) })
      }
      setEditingCell(null)
    } catch {
      // user can try again
    } finally {
      setSavingCell(null)
    }
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
      if (sortKey === 'name')               diff = a.name.localeCompare(b.name, 'pt-BR')
      if (sortKey === 'price')              diff = a.price - b.price
      if (sortKey === 'bookingsThisMonth')  diff = a.bookingsThisMonth - b.bookingsThisMonth
      if (sortKey === 'revenueThisMonth')   diff = a.revenueThisMonth - b.revenueThisMonth
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [servicos, sortKey, sortDir])

  if (sorted.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2">
        <p className="text-[14px] font-medium text-[#475569]">
          {isFiltered ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
        </p>
        {isFiltered && <p className="text-[12px] text-[#94A3B8]">Tente ajustar os filtros</p>}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th
              scope="col"
              className={cn(TH_S, 'min-w-[180px]')}
              onClick={() => handleSort('name')}
              aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center gap-1">
                Serviço <SortIcon col="name" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th scope="col" className={TH}>Duração</th>
            <th
              scope="col"
              className={cn(TH_S, TH_R)}
              onClick={() => handleSort('price')}
              aria-sort={sortKey === 'price' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Preço <SortIcon col="price" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th
              scope="col"
              className={cn(TH_S, TH_R)}
              onClick={() => handleSort('bookingsThisMonth')}
              aria-sort={sortKey === 'bookingsThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Agend./Mês <SortIcon col="bookingsThisMonth" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th
              scope="col"
              className={cn(TH_S, TH_R)}
              onClick={() => handleSort('revenueThisMonth')}
              aria-sort={sortKey === 'revenueThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Fat./Mês <SortIcon col="revenueThisMonth" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={cn(TH, 'w-16')}>DETALHES</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {sorted.map((s) => (
            <tr key={s.id} className="group transition-colors hover:bg-[#F8FAFC]">

              {/* Serviço + categoria */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {s.photos.length > 0 ? (
                    <div className="relative shrink-0" title={`${s.photos.length} foto${s.photos.length !== 1 ? 's' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.photos[0]}
                        alt=""
                        aria-hidden="true"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[9px] font-bold text-white">
                        {s.photos.length}
                      </span>
                    </div>
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-[#E2E8F0]" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium text-[#0F172A]">{s.name}</p>
                    <div className="mt-1">
                      <CategoryBadge category={s.category} />
                    </div>
                  </div>
                </div>
              </td>

              {/* Duração */}
              <td className="px-4 py-3">
                {editingCell?.id === s.id && editingCell.field === 'duration' ? (
                  <span className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(s.id, 'duration')
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      className="w-20 rounded-md border border-[#2563EB] px-2 py-1 text-[13px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(s.id, 'duration')}
                      disabled={savingCell === s.id + 'duration'}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#059669] hover:bg-[#ECFDF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <Check size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#DC2626] hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <DurationChip minutes={s.duration} />
                    {onUpdate && (
                      <button
                        type="button"
                        onClick={() => startEdit(s.id, 'duration', s.duration)}
                        className="text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
                      >
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
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(s.id, 'price')
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      className="w-20 rounded-md border border-[#2563EB] px-2 py-1 text-[13px] text-right focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(s.id, 'price')}
                      disabled={savingCell === s.id + 'price'}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#059669] hover:bg-[#ECFDF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <Check size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#DC2626] hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center justify-end gap-1.5">
                    <span className="font-tabular font-semibold text-[#0F172A]">{formatBRL(s.price)}</span>
                    {onUpdate && (
                      <button
                        type="button"
                        onClick={() => startEdit(s.id, 'price', s.price)}
                        className="text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
                      >
                        <Pencil size={13} aria-hidden="true" />
                      </button>
                    )}
                  </span>
                )}
              </td>

              {/* Agendamentos mês */}
              <td className="px-4 py-3 text-right font-tabular text-[#0F172A]">
                {s.bookingsThisMonth > 0
                  ? s.bookingsThisMonth
                  : <span className="text-[#CBD5E1]">—</span>
                }
              </td>

              {/* Faturamento mês */}
              <td className="px-4 py-3 text-right font-tabular font-semibold text-[#0F172A]">
                {s.revenueThisMonth > 0
                  ? formatBRL(s.revenueThisMonth)
                  : <span className="font-normal text-[#CBD5E1]">—</span>
                }
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <ServicoStatusBadge status={s.status} />
              </td>

              {/* Detalhes */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(s)}
                  aria-label={`Ver detalhes de ${s.name}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2 py-1.5',
                    'text-[#94A3B8] transition-colors',
                    'hover:text-[#2563EB]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  )}
                >
                  <Eye size={15} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(ServicoList)
