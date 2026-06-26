'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Star, UserCheck, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profissional } from '@/lib/profissionais-mock'
import { formatBRL } from '@/lib/profissionais-mock'
import { ProfissionalAvatar, StatusBadge } from './profissional-card'

type SortKey = 'name' | 'appointmentsThisMonth' | 'revenueThisMonth' | 'rating'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="text-[#CBD5E1]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[#2563EB]" aria-hidden="true" />
    : <ChevronDown size={12} className="text-[#2563EB]" aria-hidden="true" />
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B] text-left'
const TH_SORT = cn(TH, 'cursor-pointer select-none hover:text-[#475569] transition-colors')

interface Props {
  profissionais: Profissional[]
  isFiltered?: boolean
  onView: (p: Profissional) => void
  onNovo?: () => void
  onToggleStatus?: (id: string, active: boolean) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

function ProfissionalList({ profissionais, isFiltered = false, onView, onNovo, onToggleStatus, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)

  async function handleDelete(id: string) {
    try {
      await onDelete!(id)
      setDeleteModal(null)
    } catch (err: unknown) {
      setDeleteModal(null)
      const status = err !== null && typeof err === 'object' && 'status' in err
        ? (err as { status: number }).status : 0
      if (status === 409) {
        alert(err instanceof Error ? err.message : 'Profissional possui agendamentos futuros.')
      } else {
        alert('Erro ao excluir profissional. Tente novamente.')
      }
    }
  }

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir(k === 'name' ? 'asc' : 'desc') }
  }

  const sorted = useMemo(() => {
    const list = [...profissionais]
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'name')                  diff = a.name.localeCompare(b.name, 'pt-BR')
      if (sortKey === 'appointmentsThisMonth') diff = Number(a.appointmentsThisMonth ?? 0) - Number(b.appointmentsThisMonth ?? 0)
      if (sortKey === 'revenueThisMonth')      diff = Number(a.revenueThisMonth ?? 0) - Number(b.revenueThisMonth ?? 0)
      if (sortKey === 'rating')                diff = Number(a.rating ?? 0) - Number(b.rating ?? 0)
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [profissionais, sortKey, sortDir])

  if (sorted.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-2">
          <p className="text-[14px] font-medium text-[#475569]">Nenhum profissional encontrado</p>
          <p className="text-[12px] text-[#94A3B8]">Tente ajustar os filtros</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UserCheck className="mb-4 h-12 w-12 text-[#CBD5E1]" aria-hidden="true" />
        <h3 className="text-[14px] font-medium text-[#475569]">Nenhum profissional cadastrado</h3>
        <p className="mt-1 text-[13px] text-[#94A3B8]">Adicione seu primeiro profissional para começar.</p>
        {onNovo && (
          <button
            type="button"
            onClick={onNovo}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
          >
            <Plus size={14} aria-hidden="true" />
            Novo Profissional
          </button>
        )}
      </div>
    )
  }

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th
              className={TH_SORT}
              onClick={() => handleSort('name')}
              aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              scope="col"
            >
              <span className="flex items-center gap-1">
                Profissional
                <SortIcon col="name" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={TH}>Especialidade</th>
            <th
              scope="col"
              className={cn(TH_SORT, 'text-right')}
              onClick={() => handleSort('appointmentsThisMonth')}
              aria-sort={sortKey === 'appointmentsThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Agend./Mês <SortIcon col="appointmentsThisMonth" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th
              scope="col"
              className={cn(TH_SORT, 'text-right')}
              onClick={() => handleSort('revenueThisMonth')}
              aria-sort={sortKey === 'revenueThisMonth' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Fat./Mês <SortIcon col="revenueThisMonth" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th
              scope="col"
              className={cn(TH_SORT, 'text-right')}
              onClick={() => handleSort('rating')}
              aria-sort={sortKey === 'rating' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className="flex items-center justify-end gap-1">
                Avaliação <SortIcon col="rating" active={sortKey} dir={sortDir} />
              </span>
            </th>
            <th scope="col" className={cn(TH, 'whitespace-nowrap')}>Detalhes</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="group transition-colors hover:bg-[#F8FAFC]"
            >
              {/* Nome + cargo */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <ProfissionalAvatar name={p.name} size={32} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#0F172A]">{p.name}</p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                {onToggleStatus ? (
                  <button
                    type="button"
                    onClick={() => void onToggleStatus(p.id, p.status !== 'active')}
                    aria-label={`Alternar status de ${p.name}`}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded-full"
                  >
                    <StatusBadge status={p.status} />
                  </button>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </td>

              {/* Especialidade */}
              <td className="px-4 py-3">
                <span className="text-[13px] text-[#475569]">
                  {p.role || '—'}
                </span>
              </td>

              {/* Agendamentos mês */}
              <td className="px-4 py-3 text-right font-tabular text-[#0F172A]">
                {p.appointmentsThisMonth || <span className="text-[#CBD5E1]">0</span>}
              </td>

              {/* Faturamento mês */}
              <td className="px-4 py-3 text-right font-tabular font-semibold text-[#0F172A]">
                {p.revenueThisMonth > 0 ? formatBRL(p.revenueThisMonth) : <span className="font-normal text-[#CBD5E1]">—</span>}
              </td>

              {/* Avaliação */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Star size={11} className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                  <span className="font-tabular text-[13px] font-medium text-[#0F172A]">{Number(p.rating ?? 0).toFixed(1)}</span>
                  <span className="text-[11px] text-[#94A3B8]">({p.ratingCount ?? 0})</span>
                </div>
              </td>

              {/* Detalhes */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onView(p)}
                    aria-label={`Ver perfil de ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded text-[#94A3B8] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ id: p.id, name: p.name })}
                      aria-label={`Excluir ${p.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <Trash2 size={14} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      {deleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 id="delete-modal-title" className="text-[15px] font-medium text-[#0F172A] mb-2">Excluir profissional</h3>
            <p className="text-[13px] text-[#475569] mb-6">
              Tem certeza que deseja excluir <strong>{deleteModal.name}</strong>?{' '}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-[13px] text-[#475569] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteModal.id)}
                className="px-4 py-2 text-[13px] text-white bg-[#DC2626] rounded-lg hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(ProfissionalList)
