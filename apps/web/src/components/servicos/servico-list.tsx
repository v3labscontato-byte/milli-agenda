'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react'
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
}

function ServicoList({ servicos, isFiltered = false, onView }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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
            <th scope="col" className={cn(TH, 'w-16')}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {sorted.map((s) => (
            <tr key={s.id} className="group transition-colors hover:bg-[#F8FAFC]">

              {/* Serviço + categoria */}
              <td className="px-4 py-3">
                <p className="font-medium text-[#0F172A]">{s.name}</p>
                <div className="mt-1">
                  <CategoryBadge category={s.category} />
                </div>
              </td>

              {/* Duração */}
              <td className="px-4 py-3">
                <DurationChip minutes={s.duration} />
              </td>

              {/* Preço */}
              <td className="px-4 py-3 text-right font-tabular font-semibold text-[#0F172A]">
                {formatBRL(s.price)}
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

              {/* Ação */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(s)}
                  aria-label={`Ver detalhes de ${s.name}`}
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

export default memo(ServicoList)
