'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_CLIENTES, kpiStats, type Cliente, type ClientTag } from '@/lib/clientes-mock'
import ClienteList from '@/components/clientes/cliente-list'
import ClienteModal from '@/components/clientes/cliente-modal'
import NovoClienteModal from '@/components/clientes/novo-cliente-modal'

// ─── KPI strip ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
}

function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5">
      <span className="font-tabular text-3xl font-bold leading-none text-[#0F172A]">{value}</span>
      <span className="mt-1.5 text-sm font-semibold text-[#0F172A]">{label}</span>
      <span className="mt-0.5 text-[11px] text-[#94A3B8]">{sub}</span>
    </div>
  )
}

// ─── Filter pills ─────────────────────────────────────────────────────────────

const TAG_FILTERS: { tag: ClientTag | null; label: string }[] = [
  { tag: null,         label: 'Todos' },
  { tag: 'VIP',        label: 'VIP' },
  { tag: 'Novo',       label: 'Novos' },
  { tag: 'Fidelidade', label: 'Fidelidade' },
  { tag: 'Inativo',    label: 'Inativos' },
  { tag: 'Aniversário',label: 'Aniversário' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const [search, setSearch]             = useState('')
  const [tagFilter, setTagFilter]       = useState<ClientTag | null>(null)
  const [selectedCliente, setSelected]  = useState<Cliente | null>(null)
  const [novoOpen, setNovoOpen]         = useState(false)

  const clientes = MOCK_CLIENTES

  const stats = useMemo(() => kpiStats(clientes), [clientes])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clientes.filter((c) => {
      const matchTag = tagFilter === null || c.tags.includes(tagFilter)
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      return matchTag && matchSearch
    })
  }, [clientes, search, tagFilter])

  const isFiltered = search.trim().length > 0 || tagFilter !== null

  return (
    <div className="flex h-full flex-col">
      {/* ── KPI strip ── */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
            Visão geral
          </p>
          <button
            type="button"
            onClick={() => setNovoOpen(true)}
            aria-label="Novo cliente"
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5',
              'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
            )}
          >
            <Plus size={13} aria-hidden="true" />
            Novo Cliente
          </button>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 px-6 pb-5 lg:grid-cols-4 lg:gap-4">
          <KpiCard
            label="Total de Clientes"
            value={stats.total}
            sub="cadastrados"
          />
          <KpiCard
            label="Novos (30 dias)"
            value={stats.novos}
            sub={stats.novos === 1 ? '1 novo cadastro' : `${stats.novos} novos cadastros`}
          />
          <KpiCard
            label="Taxa de Retorno"
            value={`${stats.retorno}%`}
            sub="voltaram mais de 1×"
          />
          <KpiCard
            label="Ticket Médio"
            value={`R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            sub="por visita"
          />
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone…"
              aria-label="Buscar clientes"
              className={cn(
                'w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-8 pr-8 text-[13px] text-[#0F172A]',
                'placeholder:text-[#64748B]',
                'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB]',
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoria">
            {TAG_FILTERS.map(({ tag, label }) => {
              const active = tagFilter === tag
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTagFilter(active ? null : tag)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    active
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Result count */}
          {isFiltered && (
            <span className="text-[12px] text-[#94A3B8]">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto bg-white">
        <ClienteList
          clientes={filtered}
          isFiltered={isFiltered}
          onView={setSelected}
        />
      </div>

      {/* ── Modals ── */}
      <ClienteModal
        cliente={selectedCliente}
        onClose={() => setSelected(null)}
      />
      <NovoClienteModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
      />
    </div>
  )
}
