'use client'

import { useEffect, useState } from 'react'
import { X, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Servico } from '@/lib/servicos-mock'
import { formatBRL, formatDuration } from '@/lib/servicos-mock'
import { CategoryBadge, ServicoStatusBadge, DurationChip } from './servico-card'
import { FEATURES } from '@/lib/features'

type Tab = 'detalhes' | 'desempenho' | 'profissionais' | 'fotos'

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: 'detalhes',      label: 'Detalhes'     },
  { id: 'desempenho',    label: 'Desempenho'   },
  { id: 'profissionais', label: 'Profissionais' },
]

// ─── Tab: Detalhes ────────────────────────────────────────────────────────────

function TabDetalhes({ s }: { s: Servico }) {
  return (
    <div className="space-y-5">
      {/* Description */}
      {s.description && (
        <div>
          <p className="mb-2 text-[12px] font-medium text-[#64748B]">Descrição</p>
          <p className="rounded-lg bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#475569]">
            {s.description}
          </p>
        </div>
      )}

      {/* Info row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <span className="text-[11px] text-[#94A3B8]">Duração</span>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#475569]" aria-hidden="true" />
            <span className="font-tabular text-[14px] font-semibold text-[#0F172A]">
              {formatDuration(s.duration)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <span className="text-[11px] text-[#94A3B8]">Preço</span>
          <span className="font-tabular text-[14px] font-semibold text-[#0F172A]">
            {formatBRL(s.price)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <span className="text-[11px] text-[#94A3B8]">Categoria</span>
          <CategoryBadge category={s.category} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <span className="text-[11px] text-[#94A3B8]">Agendamentos este mês</span>
          <span className="font-tabular text-[16px] font-bold text-[#0F172A]">{s.bookingsThisMonth}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <span className="text-[11px] text-[#94A3B8]">Faturamento este mês</span>
          <span className="font-tabular text-[16px] font-bold text-[#0F172A]">{formatBRL(s.revenueThisMonth)}</span>
        </div>
      </div>

    </div>
  )
}

// ─── Tab: Desempenho ──────────────────────────────────────────────────────────

const DESEMPENHO_ROWS = [
  { label: 'Agendados',   getValue: (m: ReturnType<typeof getMonth>) => m.totalAgendamentos, color: '#0F172A', isCurrency: false },
  { label: 'Finalizados', getValue: (m: ReturnType<typeof getMonth>) => m.finalizados,        color: '#15803D', isCurrency: false },
  { label: 'Pendentes',   getValue: (m: ReturnType<typeof getMonth>) => m.pendentes,          color: '#92400E', isCurrency: false },
  { label: 'Cancelados',  getValue: (m: ReturnType<typeof getMonth>) => m.cancelados,         color: '#DC2626', isCurrency: false },
  { label: 'Faturado',    getValue: (m: ReturnType<typeof getMonth>) => m.revenue,            color: '#0F172A', isCurrency: true  },
] as const

function getMonth(m: Servico['monthlyData'][number]) {
  return {
    totalAgendamentos: m.totalAgendamentos ?? m.bookings,
    finalizados: m.finalizados ?? 0,
    pendentes: m.pendentes ?? 0,
    cancelados: m.cancelados ?? 0,
    revenue: m.revenue,
  }
}

function TabDesempenho({ s }: { s: Servico }) {
  if (!s.monthlyData.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[#E2E8F0]">
        <p className="text-[13px] text-[#94A3B8]">Sem histórico disponível</p>
      </div>
    )
  }

  return (
    <div className="mt-1 overflow-x-auto">
      <p className="mb-3 text-[13px] font-medium text-[#0F172A]">Histórico — últimos 6 meses</p>
      <table className="w-full text-[12px]" style={{ minWidth: 480 }}>
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className="w-28 py-2 pr-4 text-left font-medium text-[#94A3B8]" />
            {s.monthlyData.map((m, i) => (
              <th key={i} className="py-2 text-center font-medium capitalize text-[#475569]">
                {m.month}
              </th>
            ))}
            <th className="py-2 text-center font-semibold text-[#0F172A]">Total</th>
          </tr>
        </thead>
        <tbody>
          {DESEMPENHO_ROWS.map((row) => {
            const total = s.monthlyData.reduce((acc, m) => acc + row.getValue(getMonth(m)), 0)
            return (
              <tr key={row.label} className="border-b border-[#F8FAFC] hover:bg-[#FAFAFA]">
                <td className="py-2 pr-4 font-medium" style={{ color: row.color }}>{row.label}</td>
                {s.monthlyData.map((m, i) => {
                  const val = row.getValue(getMonth(m))
                  return (
                    <td key={i} className="py-2 text-center" style={{ color: row.color }}>
                      {val > 0
                        ? row.isCurrency ? `R$ ${val.toFixed(2).replace('.', ',')}` : val
                        : <span className="text-[#CBD5E1]">—</span>}
                    </td>
                  )
                })}
                <td className="py-2 text-center font-semibold" style={{ color: row.color }}>
                  {row.isCurrency ? `R$ ${total.toFixed(2).replace('.', ',')}` : total}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab: Profissionais ───────────────────────────────────────────────────────

interface ProfRaw { id: string; name: string; specialty?: string; enabledServices?: string[] }

function TabProfissionais({ serviceId }: { serviceId: string }) {
  const [profissionais, setProfissionais] = useState<ProfRaw[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!FEATURES.realProfissionais) { setLoading(false); return }
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/professionals`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((r: unknown) => {
        const all: ProfRaw[] = Array.isArray((r as { data?: unknown }).data)
          ? (r as { data: ProfRaw[] }).data
          : []
        setProfissionais(all.filter((p) => Array.isArray(p.enabledServices) && p.enabledServices.includes(serviceId)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [serviceId])

  if (!FEATURES.realProfissionais) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#E2E8F0]">
        <Users size={20} className="text-[#CBD5E1]" aria-hidden="true" />
        <p className="text-[13px] text-[#94A3B8]">Nenhum profissional habilitado para este serviço</p>
        <p className="text-[11px] text-[#CBD5E1]">Configure em Profissionais → aba Serviços</p>
      </div>
    )
  }

  if (loading) {
    return <div className="py-8 text-center text-[13px] text-[#94A3B8]">Carregando…</div>
  }

  if (profissionais.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#E2E8F0]">
        <Users size={20} className="text-[#CBD5E1]" aria-hidden="true" />
        <p className="text-[13px] text-[#94A3B8]">Nenhum profissional habilitado para este serviço</p>
        <p className="text-[11px] text-[#CBD5E1]">Configure em Profissionais → aba Serviços</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {profissionais.map((p) => {
        const initials = (p.name ?? '').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        return (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[12px] font-medium text-[#2563EB]">
              {initials}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">{p.name}</p>
              <p className="text-[11px] text-[#94A3B8]">{p.specialty || '—'}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab: Fotos ───────────────────────────────────────────────────────────────

function TabFotos({ s }: { s: Servico }) {
  if (s.photos.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#E2E8F0]">
        <p className="text-[13px] text-[#94A3B8]">Nenhuma foto cadastrada</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {s.photos.map((src, i) => (
        <div key={i} className="aspect-square overflow-hidden rounded-lg border border-[#E2E8F0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`${s.name} — foto ${i + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ServicoModalProps {
  servico: Servico | null
  onClose: () => void
}

export default function ServicoModal({ servico, onClose }: ServicoModalProps) {
  const [tab, setTab] = useState<Tab>('detalhes')

  const tabs = servico && servico.photos.length > 0
    ? [...BASE_TABS, { id: 'fotos' as Tab, label: `Fotos (${servico.photos.length})` }]
    : BASE_TABS

  useEffect(() => {
    if (servico) setTab('detalhes')
  }, [servico?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!servico) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [servico, onClose])

  if (!servico) return null
  const s = servico

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Serviço: ${s.name}`}
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start gap-4 border-b border-[#F1F5F9] px-6 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">{s.name}</h2>
              <CategoryBadge category={s.category} />
              <ServicoStatusBadge status={s.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-[#94A3B8]">
              <DurationChip minutes={s.duration} />
              <span className="font-tabular font-semibold text-[#0F172A]">{formatBRL(s.price)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-[#F1F5F9]" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 border-b-2 py-2.5 text-[12px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                tab === t.id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'detalhes'      && <TabDetalhes      s={s} />}
          {tab === 'desempenho'    && <TabDesempenho    s={s} />}
          {tab === 'profissionais' && <TabProfissionais serviceId={s.id} />}
          {tab === 'fotos'         && <TabFotos         s={s} />}
        </div>
      </div>
    </div>
  )
}
