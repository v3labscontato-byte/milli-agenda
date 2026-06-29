'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Star, UserCheck, Plus, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profissional } from '@/lib/profissionais-mock'
import { formatBRL } from '@/lib/profissionais-mock'
import { api } from '@/lib/api/client'
import { FEATURES } from '@/lib/features'
import { ProfissionalAvatar, StatusBadge } from './profissional-card'

interface Specialty { id: string; name: string; professionals: { professional: { id: string } }[] }

type SortKey = 'name' | 'appointmentsThisMonth' | 'revenueThisMonth' | 'rating'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={12} className="text-[var(--color-border-secondary)]" aria-hidden="true" />
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[var(--color-brand)]" aria-hidden="true" />
    : <ChevronDown size={12} className="text-[var(--color-brand)]" aria-hidden="true" />
}

const TH = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] text-left'
const TH_SORT = cn(TH, 'cursor-pointer select-none hover:text-[var(--color-text-secondary)] transition-colors')

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
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [editingSpecProfId, setEditingSpecProfId] = useState<string | null>(null)
  const [editingSpecIds, setEditingSpecIds] = useState<string[]>([])
  const [savingSpec, setSavingSpec] = useState(false)
  const specDropdownRef = useRef<HTMLDivElement>(null)

  const fetchSpecialties = useCallback(async () => {
    if (!FEATURES.realProfissionais) return
    try {
      const res = await api.get<Specialty[]>('/api/v1/professionals/specialties')
      setSpecialties(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { void fetchSpecialties() }, [fetchSpecialties])

  useEffect(() => {
    if (!editingSpecProfId) return
    function handleClick(e: MouseEvent) {
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target as Node)) {
        setEditingSpecProfId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [editingSpecProfId])

  function openSpecEdit(profId: string) {
    const current = specialties
      .filter((sp) => sp.professionals.some((r) => r.professional.id === profId))
      .map((sp) => sp.id)
    setEditingSpecIds(current)
    setEditingSpecProfId(profId)
  }

  function toggleSpec(id: string) {
    setEditingSpecIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function saveSpec(profId: string) {
    setSavingSpec(true)
    try {
      await api.patch(`/api/v1/professionals/${profId}/specialties`, { specialtyIds: editingSpecIds })
      await fetchSpecialties()
      setEditingSpecProfId(null)
    } catch { /* ignore */ } finally {
      setSavingSpec(false)
    }
  }

  function getSpecsForProf(profId: string): Specialty[] {
    return specialties.filter((sp) => sp.professionals.some((r) => r.professional.id === profId))
  }

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
          <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">Nenhum profissional encontrado</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">Tente ajustar os filtros</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UserCheck className="mb-4 h-12 w-12 text-[var(--color-border-secondary)]" aria-hidden="true" />
        <h3 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Nenhum profissional cadastrado</h3>
        <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">Adicione seu primeiro profissional para começar.</p>
        {onNovo && (
          <button
            type="button"
            onClick={onNovo}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] focus-visible:ring-offset-1"
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
          <tr className="border-b border-[var(--color-border-primary)]">
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

        <tbody className="divide-y divide-[var(--color-surface-tertiary)]">
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="group transition-colors hover:bg-[var(--color-surface-secondary)]"
            >
              {/* Nome + cargo */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <ProfissionalAvatar name={p.name} size={32} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--color-text-primary)]">{p.name}</p>
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
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] rounded-full"
                  >
                    <StatusBadge status={p.status} />
                  </button>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </td>

              {/* Especialidade */}
              <td className="px-4 py-3">
                {FEATURES.realProfissionais ? (
                  <div className="relative" ref={editingSpecProfId === p.id ? specDropdownRef : undefined}>
                    <button
                      type="button"
                      onClick={() => editingSpecProfId === p.id ? setEditingSpecProfId(null) : openSpecEdit(p.id)}
                      className={cn(
                        'flex flex-wrap items-center gap-1 rounded px-1 py-0.5 text-left transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                        'hover:bg-[var(--color-surface-secondary)]',
                      )}
                      aria-label={`Editar especialidades de ${p.name}`}
                    >
                      {getSpecsForProf(p.id).length > 0 ? (
                        getSpecsForProf(p.id).map((sp) => (
                          <span key={sp.id} className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
                            {sp.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] text-[var(--color-text-tertiary)]">—</span>
                      )}
                    </button>

                    {editingSpecProfId === p.id && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                        <div className="max-h-48 overflow-y-auto p-1">
                          {specialties.length === 0 && (
                            <p className="px-3 py-2 text-[12px] text-[#94A3B8]">Nenhuma especialidade</p>
                          )}
                          {specialties.map((sp) => {
                            const checked = editingSpecIds.includes(sp.id)
                            return (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => toggleSpec(sp.id)}
                                className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-[12px] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                              >
                                <div className={cn(
                                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                  checked ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1]',
                                )}>
                                  {checked && <Check size={10} className="text-white" aria-hidden="true" />}
                                </div>
                                <span className={checked ? 'text-[#0F172A]' : 'text-[#475569]'}>{sp.name}</span>
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-[#F1F5F9] px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setEditingSpecProfId(null)}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                            aria-label="Cancelar"
                          >
                            <X size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={savingSpec}
                            onClick={() => void saveSpec(p.id)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:opacity-50"
                            aria-label="Salvar"
                          >
                            <Check size={12} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    {p.role || '—'}
                  </span>
                )}
              </td>

              {/* Agendamentos mês */}
              <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">
                {p.appointmentsThisMonth || <span className="text-[var(--color-border-secondary)]">0</span>}
              </td>

              {/* Faturamento mês */}
              <td className="px-4 py-3 text-right font-tabular font-semibold text-[var(--color-text-primary)]">
                {p.revenueThisMonth > 0 ? formatBRL(p.revenueThisMonth) : <span className="font-normal text-[var(--color-border-secondary)]">—</span>}
              </td>

              {/* Avaliação */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Star size={11} className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                  <span className="font-tabular text-[13px] font-medium text-[var(--color-text-primary)]">{Number(p.rating ?? 0).toFixed(1)}</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">({p.ratingCount ?? 0})</span>
                </div>
              </td>

              {/* Detalhes */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onView(p)}
                    aria-label={`Ver perfil de ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-brand)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ id: p.id, name: p.name })}
                      aria-label={`Excluir ${p.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
                    >
                      <Trash2 size={14} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors" />
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
            <h3 id="delete-modal-title" className="text-[15px] font-medium text-[var(--color-text-primary)] mb-2">Excluir profissional</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
              Tem certeza que deseja excluir <strong>{deleteModal.name}</strong>?{' '}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] rounded-lg hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteModal.id)}
                className="px-4 py-2 text-[13px] text-white bg-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
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
