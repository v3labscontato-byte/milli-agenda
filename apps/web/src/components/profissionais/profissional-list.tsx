'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Star, UserCheck, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profissional } from '@/lib/profissionais-mock'
import { formatBRL } from '@/lib/profissionais-mock'
import { ProfissionalAvatar, RoleBadge, StatusBadge } from './profissional-card'

type SortKey = 'name' | 'appointmentsThisMonth' | 'revenueThisMonth' | 'rating'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="text-[#CBD5E1]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[#2563EB]" aria-hidden="true" />
    : <ChevronDown size={12} className="text-[#2563EB]" aria-hidden="true" />
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] text-left'
const TH_SORT = cn(TH, 'cursor-pointer select-none hover:text-[#475569] transition-colors')

interface Props {
  profissionais: Profissional[]
  isFiltered?: boolean
  onView: (p: Profissional) => void
  onNovo?: () => void
}

function ProfissionalList({ profissionais, isFiltered = false, onView, onNovo }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir(k === 'name' ? 'asc' : 'desc') }
  }

  const sorted = useMemo(() => {
    const list = [...profissionais]
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'name')                  diff = a.name.localeCompare(b.name, 'pt-BR')
      if (sortKey === 'appointmentsThisMonth') diff = a.appointmentsThisMonth - b.appointmentsThisMonth
      if (sortKey === 'revenueThisMonth')      diff = a.revenueThisMonth - b.revenueThisMonth
      if (sortKey === 'rating')                diff = a.rating - b.rating
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th
              className={cn(TH_SORT, 'flex items-center gap-1')}
              onClick={() => handleSort('name')}
              aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              scope="col"
            >
              <span>Profissional</span>
              <SortIcon col="name" active={sortKey} dir={sortDir} />
            </th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={cn(TH, 'text-right')}>Hoje</th>
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
            <th scope="col" className={cn(TH, 'w-16')}><span className="sr-only">Ações</span></th>
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
                    <RoleBadge role={p.role} />
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>

              {/* Hoje */}
              <td className="px-4 py-3 text-right font-tabular font-medium text-[#0F172A]">
                {p.appointmentsToday > 0 ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-semibold text-[#2563EB]">
                    {p.appointmentsToday}
                  </span>
                ) : (
                  <span className="text-[#CBD5E1]">—</span>
                )}
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
                  <span className="font-tabular text-[13px] font-medium text-[#0F172A]">{p.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-[#94A3B8]">({p.ratingCount})</span>
                </div>
              </td>

              {/* Ação */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(p)}
                  aria-label={`Ver perfil de ${p.name}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 py-1.5',
                    'text-[12px] font-medium text-[#475569] transition-colors',
                    'hover:border-[#2563EB] hover:text-[#2563EB]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    'opacity-0 group-hover:opacity-100 motion-reduce:transition-none',
                  )}
                >
                  <Eye size={12} aria-hidden="true" />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(ProfissionalList)
