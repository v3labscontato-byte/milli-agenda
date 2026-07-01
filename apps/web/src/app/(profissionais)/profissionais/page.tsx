'use client'

import { useCallback, useMemo, useState } from 'react'
import { Search, Plus, X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatBRL,
  type Profissional,
  type ProfissionalRole,
  type ProfissionalStatus,
} from '@/lib/profissionais-mock'
import { useProfissionais } from '@/hooks/use-profissionais'
import ProfissionalList from '@/components/profissionais/profissional-list'
import ProfissionalModal from '@/components/profissionais/profissional-modal'
import NovoProfissionalModal from '@/components/profissionais/novo-profissional-modal'
import SmartFormProfissional from '@/components/shared/smart-form-profissional'
import NovaEspecialidadeModal from '@/components/profissionais/nova-especialidade-modal'
import { KpiCard, KpiPeriodFilter } from '@/components/shared/kpi-card'

type KpiPeriod = 'hoje' | 'semana' | 'mes' | '30d'

const KPI_PERIODOS: Array<{ key: KpiPeriod; label: string }> = [
  { key: 'hoje',   label: 'Hoje'            },
  { key: 'semana', label: 'Esta semana'     },
  { key: 'mes',    label: 'Este mês'        },
  { key: '30d',    label: 'Últimos 30 dias' },
]

// ─── Filter config ────────────────────────────────────────────────────────────

type RoleFilter = ProfissionalRole | 'Cabeleireiro/a' | null
type StatusFilter = ProfissionalStatus | null

const ROLE_PILLS: { value: RoleFilter; label: string }[] = [
  { value: null,             label: 'Todos'         },
  { value: 'Cabeleireiro/a', label: 'Cabeleireiro/a'},
  { value: 'Colorista',      label: 'Colorista'     },
  { value: 'Barbeiro',       label: 'Barbeiro'      },
  { value: 'Manicure',       label: 'Manicure'      },
  { value: 'Esteticista',    label: 'Esteticista'   },
]

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: null,      label: 'Todos'   },
  { value: 'active',  label: 'Ativos'  },
  { value: 'vacation',label: 'Férias'  },
  { value: 'inactive',label: 'Inativos'},
]

function matchesRoleFilter(p: Profissional, f: RoleFilter): boolean {
  if (f === null) return true
  if (f === 'Cabeleireiro/a') return p.role === 'Cabeleireira' || p.role === 'Cabeleireiro'
  return p.role === f
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfissionaisPage() {
  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState<RoleFilter>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)
  const [selected, setSelected]       = useState<Profissional | null>(null)
  const [novoOpen, setNovoOpen]             = useState(false)
  const [smartOpen, setSmartOpen]           = useState(false)
  const [especialidadeOpen, setEspecialidadeOpen] = useState(false)
  const [kpiPeriod, setKpiPeriod]           = useState<KpiPeriod>('mes')

  const { data: profissionais, loading, error, create, toggleStatus, remove, refetch } = useProfissionais()
  const stats = useMemo(() => {
    const todayDay = new Date().getDay()
    const ativos = profissionais.filter((p) => p.status === 'active')
    const ativosHoje = ativos.filter((p) => p.workDays.includes(todayDay))
    const faturamento = profissionais.reduce((s, p) => s + Number(p.revenueThisMonth ?? 0), 0)
    const totalRating = profissionais.reduce((s, p) => s + Number(p.rating ?? 0) * Number(p.ratingCount ?? 0), 0)
    const totalRatingCount = profissionais.reduce((s, p) => s + Number(p.ratingCount ?? 0), 0)
    const emFerias = profissionais.filter((p) => p.status === 'vacation').length
    const inativos = profissionais.filter((p) => p.status === 'inactive').length
    return {
      total: profissionais.length,
      ativos: ativos.length,
      ativosHoje: ativosHoje.length,
      faturamentoMes: faturamento,
      avgRating: totalRatingCount > 0 ? Math.round((totalRating / totalRatingCount) * 10) / 10 : 0,
      emFerias,
      inativos,
    }
  }, [profissionais])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return profissionais.filter((p) => {
      if (!matchesRoleFilter(p, roleFilter)) return false
      if (statusFilter !== null && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.specialties.some((s) => s.toLowerCase().includes(q))
      )
    })
  }, [profissionais, search, roleFilter, statusFilter])

  const isFiltered = search.trim().length > 0 || roleFilter !== null || statusFilter !== null

  const handleUpdate = useCallback(async () => {
    const novos = await refetch()
    if (novos && selected) {
      const atualizado = novos.find(p => p.id === selected.id)
      if (atualizado) setSelected(atualizado)
    }
  }, [refetch, selected])

  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[var(--color-border-primary)] bg-white px-6 py-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-[var(--color-surface-tertiary)]" />)}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0,1,2,3,4,5,6,7].map((i) => <div key={i} className="h-12 rounded-lg bg-[var(--color-surface-tertiary)]" />)}
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
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 pb-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
              Visão geral
            </p>
            <KpiPeriodFilter
              options={KPI_PERIODOS}
              active={kpiPeriod}
              onChange={(k) => setKpiPeriod(k as KpiPeriod)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEspecialidadeOpen(true)}
              aria-label="Gerenciar especialidades"
              className={cn(
                'flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5',
                'text-[12px] font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              )}
            >
              <Plus size={13} aria-hidden="true" />
              Nova Especialidade
            </button>
            <button
              type="button"
              onClick={() => setSmartOpen(true)}
              aria-label="Novo profissional"
              className={cn(
                'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5',
                'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              )}
            >
              <Plus size={13} aria-hidden="true" />
              Novo Profissional
            </button>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total" value={stats.total} sub="profissionais" color="blue" />
          <KpiCard label="Ativos" value={stats.ativos} sub="status ativo" color="green" />
          <KpiCard label="Trabalham Hoje" value={stats.ativosHoje} sub={`de ${stats.ativos} ativos`} />
          <KpiCard label="Faturamento/Mês" value={formatBRL(stats.faturamentoMes)} sub="soma de todos" />
          <KpiCard
            label="Avaliação Média"
            value={
              <span className="flex items-center gap-1.5">
                <Star size={16} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                {stats.avgRating.toFixed(1)}
              </span>
            }
            sub="média ponderada"
          />
          <KpiCard
            label="Em Férias / Inativos"
            value={stats.emFerias + stats.inativos}
            sub={`${stats.emFerias} férias · ${stats.inativos} inativos`}
            color={stats.emFerias + stats.inativos > 0 ? 'red' : 'default'}
          />
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="shrink-0 border-b border-[var(--color-border-primary)] bg-white px-6 py-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou especialidade…"
              aria-label="Buscar profissional"
              className={cn(
                'w-64 rounded-md border border-[var(--color-border-primary)] bg-white py-1.5 pl-8 pr-8 text-[13px] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-secondary)]',
                'focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]',
              )}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Role pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por cargo">
            {ROLE_PILLS.map(({ value, label }) => (
              <button key={label} type="button" onClick={() => setRoleFilter(value === roleFilter ? null : value)}
                aria-pressed={roleFilter === value}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                  roleFilter === value
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]',
                )}>
                {label}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
            {STATUS_PILLS.slice(1).map(({ value, label }) => (
              <button key={label} type="button" onClick={() => setStatusFilter(statusFilter === value ? null : value)}
                aria-pressed={statusFilter === value}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                  statusFilter === value
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]',
                )}>
                {label}
              </button>
            ))}
          </div>

          {isFiltered && (
            <span className="text-[12px] text-[var(--color-text-tertiary)]">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white">
        <ProfissionalList
          profissionais={filtered}
          isFiltered={isFiltered}
          onView={setSelected}
          onNovo={() => setSmartOpen(true)}
          onToggleStatus={toggleStatus}
          onDelete={remove}
        />
      </div>

      {/* ── Modals ── */}
      <ProfissionalModal
        profissional={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />
      <NovoProfissionalModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={create}
      />
      <SmartFormProfissional
        open={smartOpen}
        onClose={() => setSmartOpen(false)}
        onCreated={create}
      />
      <NovaEspecialidadeModal
        open={especialidadeOpen}
        onClose={() => setEspecialidadeOpen(false)}
        profissionais={profissionais}
        onRefetch={refetch}
      />
    </div>
  )
}
