'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Cliente, type ClientTag } from '@/lib/clientes-mock'
import { useClientes } from '@/hooks/use-clientes'
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

  const { data: clientes, loading, error, create, remove } = useClientes()
  const [toast, setToast] = useState<string | null>(null)

  async function handleDelete(id: string) {
    try {
      await remove(id)
      setSelected(null)
      setToast('Cliente excluído com sucesso.')
    } catch (e) {
      const status = (e as { status?: number })?.status
      setToast(
        status === 409
          ? 'Cliente possui agendamentos e não pode ser excluído'
          : 'Não foi possível excluir o cliente.',
      )
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const stats = useMemo(() => {
    const total = clientes.length
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30)
    const novos = clientes.filter((c) => new Date(c.clienteSince) >= thirtyAgo).length
    const returners = clientes.filter((c) => c.visitCount > 1).length
    const retorno = total > 0 ? Math.round((returners / total) * 100) : 0
    const avgTicket = total > 0 ? Math.round(clientes.reduce((s, c) => s + c.avgTicket, 0) / total) : 0
    return { total, novos, retorno, avgTicket }
  }, [clientes])

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

  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-[#F1F5F9]" />)}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0,1,2,3,4,5,6,7].map((i) => <div key={i} className="h-12 rounded-lg bg-[#F1F5F9]" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-[#DC2626]">{error}</p>
    </div>
  )

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
                  key={tag ?? 'all'}
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

      {/* ── Table / Empty ── */}
      <div className="flex-1 overflow-auto bg-white">
        {clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-[#CBD5E1]" aria-hidden="true" />
            <h3 className="text-[14px] font-medium text-[#475569]">Nenhum cliente cadastrado</h3>
            <p className="mt-1 text-[12px] text-[#94A3B8]">Cadastre seu primeiro cliente para começar.</p>
            <button
              type="button"
              onClick={() => setNovoOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <Plus size={14} aria-hidden="true" />
              Novo Cliente
            </button>
          </div>
        ) : (
          <ClienteList
            clientes={filtered}
            isFiltered={isFiltered}
            onView={setSelected}
          />
        )}
      </div>

      {/* ── Modals ── */}
      <ClienteModal
        cliente={selectedCliente}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
      />
      <NovoClienteModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreate={create}
      />

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
