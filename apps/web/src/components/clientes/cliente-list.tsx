'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente } from '@/lib/clientes-mock'
import { formatDate } from '@/lib/clientes-mock'
import { ClienteAvatar, ClienteTagBadge } from './cliente-card'

type SortKey = 'name' | 'lastVisit' | 'nextAppointment' | 'avgTicket'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={13} className="text-[#CBD5E1]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-[#2563EB]" aria-hidden="true" />
    : <ChevronDown size={13} className="text-[#2563EB]" aria-hidden="true" />
}

function Th({
  label, col, sortKey, sortDir, onSort,
}: {
  label: string
  col: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = sortKey === col
  return (
    <th scope="col" className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded',
          active ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#475569]',
        )}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <SortIcon col={col} active={sortKey} dir={sortDir} />
      </button>
    </th>
  )
}

const INLINE_INPUT = 'rounded border border-[#2563EB] bg-white px-2 py-0.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#DBEAFE]'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr aria-hidden="true">
      {[32, 40, 120, 100, 80, 80, 80, 48, 72, 56].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 animate-pulse motion-reduce:animate-none rounded bg-[#F1F5F9]"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <tr>
      <td colSpan={10} className="py-16 text-center">
        <p className="text-[14px] font-medium text-[#475569]">
          {filtered ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
        </p>
        <p className="mt-1 text-[12px] text-[#94A3B8]">
          {filtered ? 'Tente ajustar os filtros ou a busca.' : 'Comece adicionando um novo cliente.'}
        </p>
      </td>
    </tr>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClienteListProps {
  clientes: Cliente[]
  isLoading?: boolean
  isFiltered?: boolean
  onView: (c: Cliente) => void
  onUpdateField?: (id: string, field: string, value: string) => Promise<void>
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function ClienteList({
  clientes,
  isLoading = false,
  isFiltered = false,
  onView,
  onUpdateField,
}: ClienteListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editingField, setEditingField] = useState<{ id: string; field: 'name' | 'email' | 'phone' } | null>(null)
  const [editValue, setEditValue] = useState('')

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir('asc') }
  }

  async function handleSaveField(id: string, field: 'name' | 'email' | 'phone', value: string) {
    setEditingField(null)
    await onUpdateField?.(id, field, value)
  }

  const sorted = useMemo(() => {
    const list = [...clientes]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name, 'pt-BR')
      } else if (sortKey === 'lastVisit') {
        cmp = (a.lastVisit ?? '').localeCompare(b.lastVisit ?? '')
      } else if (sortKey === 'nextAppointment') {
        const av = a.nextAppointment ?? '9999'
        const bv = b.nextAppointment ?? '9999'
        cmp = av.localeCompare(bv)
      } else if (sortKey === 'avgTicket') {
        cmp = a.avgTicket - b.avgTicket
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [clientes, sortKey, sortDir])

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-separate border-spacing-0"
        aria-label="Lista de clientes"
      >
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-[#E2E8F0]">
            <th scope="col" className="w-10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">#</th>
            <th scope="col" className="w-10 px-4 py-3" aria-label="Avatar" />
            <Th label="Cliente"         col="name"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Email</th>
            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Telefone</th>
            <Th label="Último Agend."   col="lastVisit"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            <Th label="Próx. Agend."    col="nextAppointment" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Visitas</th>
            <Th label="Ticket Méd."     col="avgTicket"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Detalhes</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F1F5F9]">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : sorted.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            sorted.map((c) => (
              <tr
                key={c.id}
                className="group bg-white transition-colors hover:bg-[#F8FAFC]"
              >
                {/* # */}
                <td className="px-4 py-3">
                  <span className="text-[12px] font-medium text-[#94A3B8]">
                    {c.clientNumber ? `#${c.clientNumber}` : '—'}
                  </span>
                </td>

                {/* Avatar */}
                <td className="px-4 py-3">
                  <ClienteAvatar name={c.name} />
                </td>

                {/* Name + tags (email removed) */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {editingField?.id === c.id && editingField.field === 'name' ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => void handleSaveField(c.id, 'name', editValue)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveField(c.id, 'name', editValue) }}
                        className={cn(INLINE_INPUT, 'w-36 font-semibold')}
                      />
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        title="Clique para editar"
                        onClick={() => { setEditingField({ id: c.id, field: 'name' }); setEditValue(c.name) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setEditingField({ id: c.id, field: 'name' }); setEditValue(c.name) } }}
                        className="cursor-pointer text-[13px] font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:underline"
                      >
                        {c.name}
                      </span>
                    )}
                    {c.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.tags.map((t) => <ClienteTagBadge key={t} tag={t} />)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3">
                  {editingField?.id === c.id && editingField.field === 'email' ? (
                    <input
                      autoFocus
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => void handleSaveField(c.id, 'email', editValue)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveField(c.id, 'email', editValue) }}
                      className={cn(INLINE_INPUT, 'w-40')}
                    />
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      title="Clique para editar"
                      onClick={() => { setEditingField({ id: c.id, field: 'email' }); setEditValue(c.email) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setEditingField({ id: c.id, field: 'email' }); setEditValue(c.email) } }}
                      className="cursor-pointer text-[12px] text-[#94A3B8] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {c.email || <span className="text-[#CBD5E1]">—</span>}
                    </span>
                  )}
                </td>

                {/* Phone */}
                <td className="px-4 py-3">
                  {editingField?.id === c.id && editingField.field === 'phone' ? (
                    <input
                      autoFocus
                      type="tel"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => void handleSaveField(c.id, 'phone', editValue)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveField(c.id, 'phone', editValue) }}
                      className={cn(INLINE_INPUT, 'w-36')}
                    />
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      title="Clique para editar"
                      onClick={() => { setEditingField({ id: c.id, field: 'phone' }); setEditValue(c.phone) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setEditingField({ id: c.id, field: 'phone' }); setEditValue(c.phone) } }}
                      className="cursor-pointer font-tabular text-[13px] text-[#475569] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {c.phone || <span className="text-[#CBD5E1]">—</span>}
                    </span>
                  )}
                </td>

                {/* Last visit */}
                <td className="px-4 py-3 text-[13px] text-[#475569]">
                  {c.lastVisit ? (
                    <div className="flex flex-col gap-0.5">
                      <span>{formatDate(c.lastVisit)}</span>
                      <span className="text-[11px] text-[#94A3B8]">{c.lastVisitService}</span>
                    </div>
                  ) : (
                    <span className="text-[#CBD5E1]">—</span>
                  )}
                </td>

                {/* Next appointment */}
                <td className="px-4 py-3 text-[13px] text-[#475569]">
                  {c.nextAppointment ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#2563EB]">{formatDate(c.nextAppointment)}</span>
                      <span className="text-[11px] text-[#94A3B8]">{c.nextAppointmentTime} · {c.nextAppointmentService}</span>
                    </div>
                  ) : (
                    <span className="text-[#CBD5E1]">—</span>
                  )}
                </td>

                {/* Visit count */}
                <td className="px-4 py-3 font-tabular text-[13px] font-semibold text-[#0F172A]">
                  {c.visitCount}
                </td>

                {/* Avg ticket */}
                <td className="px-4 py-3 font-tabular text-[13px] font-semibold text-[#0F172A]">
                  R$ {c.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onView(c)}
                    aria-label={`Ver perfil de ${c.name}`}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 py-1.5',
                      'text-[12px] font-medium text-[#475569] transition-colors',
                      'hover:border-[#2563EB] hover:text-[#2563EB]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    )}
                  >
                    <Eye size={12} aria-hidden="true" />
                    Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default memo(ClienteList)
