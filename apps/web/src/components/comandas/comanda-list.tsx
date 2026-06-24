'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comanda, ComandasFilter } from '@/lib/comanda-mock'
import ComandaCard from './comanda-card'

const FILTER_LABELS: Record<ComandasFilter, string> = {
  ALL:              'Todas',
  OPEN_IN_PROGRESS: 'Abertas',
  OPEN:             'Só Abertas',
  IN_PROGRESS:      'Em Atend.',
  AWAITING_PAYMENT: 'Aguard. Pagto',
  PAID:             'Pagas',
  CANCELLED:        'Canceladas',
}

const FILTERS: ComandasFilter[] = ['ALL', 'OPEN_IN_PROGRESS', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED']

interface ComandaListProps {
  comandas: Comanda[]
  selectedId: string | null
  statusFilter: ComandasFilter
  onStatusFilterChange: (f: ComandasFilter) => void
  onSelect: (id: string) => void
}

export default function ComandaList({
  comandas,
  selectedId,
  statusFilter,
  onStatusFilterChange,
  onSelect,
}: ComandaListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return comandas.filter((c) => {
      const statusMatch =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN_IN_PROGRESS'
          ? c.status === 'OPEN' || c.status === 'IN_PROGRESS'
          : c.status === statusFilter)
      if (!statusMatch) return false
      if (!q) return true
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.number.includes(q)
      )
    })
  }, [comandas, statusFilter, search])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar cliente, serviço…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar comanda"
            className={cn(
              'w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3',
              'text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]',
              'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
            )}
          />
        </div>

        {/* Filter pills */}
        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
          role="group"
          aria-label="Filtrar por status"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onStatusFilterChange(f)}
              aria-pressed={statusFilter === f}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                statusFilter === f
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
              )}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="shrink-0 bg-white px-4 py-2 text-[11px] text-[#94A3B8]">
        {filtered.length} de {comandas.length} comanda{comandas.length !== 1 ? 's' : ''}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Lista de comandas">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-[13px] text-[#94A3B8]">
            Nenhuma comanda encontrada
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} role="listitem">
              <ComandaCard
                comanda={c}
                isSelected={c.id === selectedId}
                onClick={() => onSelect(c.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
