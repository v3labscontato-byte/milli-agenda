'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, X, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatBRL,
  type Servico,
  type ServicoCategory,
  type ServicoStatus,
} from '@/lib/servicos-mock'
import { useServicos } from '@/hooks/use-servicos'
import ServicoList from '@/components/servicos/servico-list'
import ServicoModal from '@/components/servicos/servico-modal'
import NovoServicoModal from '@/components/servicos/novo-servico-modal'
import SmartFormServico from '@/components/shared/smart-form-servico'
import { KpiCard, KpiPeriodFilter } from '@/components/shared/kpi-card'

type KpiPeriod = 'hoje' | 'semana' | 'mes' | '30d'

const KPI_PERIODOS: Array<{ key: KpiPeriod; label: string }> = [
  { key: 'hoje',   label: 'Hoje'            },
  { key: 'semana', label: 'Esta semana'     },
  { key: 'mes',    label: 'Este mês'        },
  { key: '30d',    label: 'Últimos 30 dias' },
]

// ─── Filter config ────────────────────────────────────────────────────────────

type CategoryFilter = ServicoCategory | null
type StatusFilter   = ServicoStatus | null

const CATEGORY_PILLS: { value: CategoryFilter; label: string }[] = [
  { value: null,         label: 'Todos'       },
  { value: 'Cabelo',     label: 'Cabelo'      },
  { value: 'Barba',      label: 'Barba'       },
  { value: 'Unhas',      label: 'Unhas'       },
  { value: 'Estética',   label: 'Estética'    },
  { value: 'Sobrancelha',label: 'Sobrancelha' },
]

const STATUS_PILLS: { value: ServicoStatus; label: string }[] = [
  { value: 'active',   label: 'Ativos'  },
  { value: 'inactive', label: 'Inativos'},
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicosPage() {
  const [search, setSearch]             = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)
  const [selected, setSelected]         = useState<Servico | null>(null)
  const [novoOpen, setNovoOpen]         = useState(false)
  const [smartOpen, setSmartOpen]       = useState(false)
  const [kpiPeriod, setKpiPeriod]       = useState<KpiPeriod>('mes')

  const { data: servicos, loading, error, create, update, remove, toggleStatus } = useServicos()
  const stats = useMemo(() => {
    const ativos = servicos.filter((s) => s.status === 'active')
    const inativos = servicos.filter((s) => s.status === 'inactive').length
    const precos = ativos.map((s) => s.price)
    const avgPrice = precos.length > 0 ? precos.reduce((a, b) => a + b, 0) / precos.length : 0
    const top = [...servicos].sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth)[0]
    const totalBookings = servicos.reduce((s, sv) => s + sv.bookingsThisMonth, 0)
    return {
      total: servicos.length,
      ativos: ativos.length,
      inativos,
      avgPrice: Math.round(avgPrice * 100) / 100,
      topServico: top ?? null,
      totalBookings,
    }
  }, [servicos])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return servicos.filter((s) => {
      if (categoryFilter !== null && s.category !== categoryFilter) return false
      if (statusFilter   !== null && s.status   !== statusFilter)   return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    })
  }, [servicos, search, categoryFilter, statusFilter])

  const isFiltered = search.trim().length > 0 || categoryFilter !== null || statusFilter !== null

  function clearFilters() {
    setSearch('')
    setCategoryFilter(null)
    setStatusFilter(null)
  }

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
          <button
            type="button"
            onClick={() => setSmartOpen(true)}
            aria-label="Novo serviço"
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5',
              'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
            )}
          >
            <Plus size={13} aria-hidden="true" />
            Novo Serviço
          </button>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total" value={stats.total} sub="serviços cadastrados" color="blue" />
          <KpiCard label="Ativos" value={stats.ativos} sub={`de ${stats.total} cadastrados`} color="green" />
          <KpiCard
            label="Inativos"
            value={stats.inativos}
            sub="fora de catálogo"
            color={stats.inativos > 0 ? 'red' : 'default'}
          />
          <KpiCard label="Ticket Médio" value={formatBRL(stats.avgPrice)} sub="média dos ativos" />
          <KpiCard label="Agend./Mês" value={stats.totalBookings} sub="total de agendamentos" />
          <KpiCard
            label="Mais Pedido"
            value={
              stats.topServico
                ? <span className="block truncate text-[18px] leading-tight">{stats.topServico.name}</span>
                : '—'
            }
            sub={stats.topServico ? `${stats.topServico.bookingsThisMonth} agend. este mês` : 'sem dados'}
          />
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="shrink-0 space-y-2.5 border-b border-[var(--color-border-primary)] bg-white px-6 py-3">
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
              placeholder="Buscar por nome ou categoria…"
              aria-label="Buscar serviço"
              className={cn(
                'w-64 rounded-md border border-[var(--color-border-primary)] bg-white py-1.5 pl-8 pr-8 text-[13px] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-secondary)]',
                'focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]',
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoria">
            {CATEGORY_PILLS.map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategoryFilter(value === categoryFilter ? null : value)}
                aria-pressed={categoryFilter === value}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                  categoryFilter === value
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
            {STATUS_PILLS.map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setStatusFilter(statusFilter === value ? null : value)}
                aria-pressed={statusFilter === value}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                  statusFilter === value
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {isFiltered && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded text-[12px] text-[var(--color-text-tertiary)] underline-offset-2 hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
              >
                <X size={11} aria-hidden="true" />
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white">
        {filtered.length === 0 && !isFiltered ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)]">
              <Scissors size={20} className="text-[var(--color-text-tertiary)]" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">Nenhum serviço cadastrado</p>
              <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">Cadastre seu primeiro serviço para começar.</p>
            </div>
            <button
              type="button"
              onClick={() => setSmartOpen(true)}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] focus-visible:ring-offset-1"
            >
              <Plus size={14} aria-hidden="true" />
              Novo Serviço
            </button>
          </div>
        ) : (
          <ServicoList
            servicos={filtered}
            isFiltered={isFiltered}
            onView={setSelected}
            onUpdate={update}
            onToggleStatus={toggleStatus}
            onDelete={remove}
          />
        )}
      </div>

      {/* ── Modals ── */}
      <ServicoModal
        servico={selected}
        onClose={() => setSelected(null)}
      />
      <NovoServicoModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={create}
      />
      <SmartFormServico
        open={smartOpen}
        onClose={() => setSmartOpen(false)}
        onCreated={create}
      />
    </div>
  )
}
