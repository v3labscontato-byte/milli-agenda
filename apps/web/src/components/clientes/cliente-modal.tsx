'use client'

import { useEffect, useState } from 'react'
import { X, Phone, Mail, CreditCard, Calendar, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente, VisitHistory, UpcomingAppt } from '@/lib/clientes-mock'
import { formatDate, age, clienteSinceLabel } from '@/lib/clientes-mock'
import { ClienteAvatar, ClienteTagBadge } from './cliente-card'

type Tab = 'perfil' | 'historico' | 'agendamentos' | 'financeiro'
const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil',        label: 'Perfil' },
  { id: 'historico',     label: 'Histórico' },
  { id: 'agendamentos',  label: 'Agendamentos' },
  { id: 'financeiro',    label: 'Financeiro' },
]
const PAGE_SIZE = 5

// ─── Status chips ─────────────────────────────────────────────────────────────

function VisitStatusChip({ status }: { status: VisitHistory['status'] }) {
  if (status === 'COMPLETED') return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
      <CheckCircle size={11} aria-hidden="true" /> Concluído
    </span>
  )
  if (status === 'NO_SHOW') return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-[#DC2626]">
      <XCircle size={11} aria-hidden="true" /> No-show
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-[#94A3B8]">
      <XCircle size={11} aria-hidden="true" /> Cancelado
    </span>
  )
}

function ApptStatusBadge({ status }: { status: UpcomingAppt['status'] }) {
  const map: Record<UpcomingAppt['status'], { bg: string; text: string; label: string }> = {
    SCHEDULED:  { bg: '#F1F5F9', text: '#475569', label: 'Agendado' },
    CONFIRMED:  { bg: '#EFF6FF', text: '#2563EB', label: 'Confirmado' },
    COMPLETED:  { bg: '#F0FDF4', text: '#16A34A', label: 'Concluído' },
    CANCELLED:  { bg: '#FEF2F2', text: '#DC2626', label: 'Cancelado' },
  }
  const s = map[status]
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function TabPerfil({ c }: { c: Cliente }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Dados Pessoais */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Dados Pessoais</p>
        <dl className="space-y-3">
          {[
            { icon: Phone, label: 'Telefone', value: c.phone },
            { icon: Mail,  label: 'E-mail',   value: c.email },
            { icon: CreditCard, label: 'CPF', value: c.cpf },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon size={14} className="mt-0.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
              <div>
                <dt className="text-[11px] text-[#94A3B8]">{label}</dt>
                <dd className="text-[13px] font-medium text-[#0F172A]">{value || '—'}</dd>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-2.5">
            <Calendar size={14} className="mt-0.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <div>
              <dt className="text-[11px] text-[#94A3B8]">Nascimento</dt>
              <dd className="text-[13px] font-medium text-[#0F172A]">
                {formatDate(c.birthDate)} · {age(c.birthDate)} anos
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={14} className="mt-0.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <div>
              <dt className="text-[11px] text-[#94A3B8]">Cliente desde</dt>
              <dd className="text-[13px] font-medium text-[#0F172A]">{clienteSinceLabel(c.clienteSince)}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Preferências */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Preferências</p>
        <dl className="space-y-3">
          <div>
            <dt className="text-[11px] text-[#94A3B8]">Profissional favorito</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-[#0F172A]">{c.favoriteProfessional || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#94A3B8]">Serviço mais frequente</dt>
            <dd className="mt-0.5 text-[13px] font-medium text-[#0F172A]">
              {c.serviceFreq[0]?.service ?? '—'}
            </dd>
          </div>
          {c.tags.length > 0 && (
            <div>
              <dt className="mb-1.5 text-[11px] text-[#94A3B8]">Tags</dt>
              <dd className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => <ClienteTagBadge key={t} tag={t} />)}
              </dd>
            </div>
          )}
          {c.notes && (
            <div>
              <dt className="text-[11px] text-[#94A3B8]">Observações</dt>
              <dd className="mt-0.5 rounded-lg bg-[#FFFBEB] px-3 py-2 text-[12px] leading-relaxed text-[#475569]">
                {c.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

function TabHistorico({ c }: { c: Cliente }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(c.history.length / PAGE_SIZE)
  const slice = c.history.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="space-y-3">
      {slice.map((h) => (
        <div key={h.id} className="flex items-start gap-3 rounded-lg border border-[#F1F5F9] bg-white p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
            <Calendar size={14} className="text-[#475569]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-[#0F172A]">{h.service}</p>
                <p className="text-[12px] text-[#94A3B8]">{h.professional} · {formatDate(h.date)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                  {h.status === 'COMPLETED' ? `R$ ${h.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                </span>
                <VisitStatusChip status={h.status} />
              </div>
            </div>
            {h.paymentMethod && (
              <p className="mt-1 text-[11px] text-[#94A3B8]">{h.paymentMethod}</p>
            )}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-[12px] text-[#94A3B8]">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, c.history.length)} de {c.history.length}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Página anterior"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Próxima página"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TabAgendamentos({ c }: { c: Cliente }) {
  const upcoming = c.upcoming.filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
  const past = c.upcoming.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED').slice(0, 5)

  function ApptRow({ a }: { a: UpcomingAppt }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F1F5F9] bg-white px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
            <Calendar size={14} className="text-[#475569]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">{a.service}</p>
            <p className="text-[12px] text-[#94A3B8]">{a.professional} · {formatDate(a.date)} {a.time}</p>
          </div>
        </div>
        <ApptStatusBadge status={a.status} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-[12px] font-medium text-[#64748B]">
          Próximos ({upcoming.length})
        </p>
        {upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((a) => <ApptRow key={a.id} a={a} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-[#E2E8F0] py-6 text-center text-[12px] text-[#94A3B8]">
            Nenhum agendamento futuro
          </p>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <p className="mb-2.5 text-[12px] font-medium text-[#64748B]">
            Passados (últimos {past.length})
          </p>
          <div className="space-y-2">
            {past.map((a) => <ApptRow key={a.id} a={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function TabFinanceiro({ c }: { c: Cliente }) {
  const maxFreq = Math.max(...c.serviceFreq.map((s) => s.totalSpent), 1)

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Gasto', value: `R$ ${c.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Ticket Médio', value: `R$ ${c.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Visitas', value: c.visitCount.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[#E2E8F0] bg-white p-4">
            <p className="text-[11px] text-[#94A3B8]">{label}</p>
            <p className="mt-1 font-tabular text-[20px] font-bold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      {/* Services bar chart */}
      {c.serviceFreq.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-medium text-[#64748B]">
            Serviços
          </p>
          <div className="space-y-2.5">
            {c.serviceFreq.map((s) => (
              <div key={s.service}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#475569]">{s.service}</span>
                  <span className="font-tabular text-[12px] text-[#94A3B8]">
                    {s.count}× · R$ {s.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all duration-300 motion-reduce:transition-none"
                    style={{ width: `${(s.totalSpent / maxFreq) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={s.totalSpent}
                    aria-valuemax={maxFreq}
                    aria-label={s.service}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimos pagamentos */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">
          Últimos pagamentos
        </p>
        <div className="space-y-2">
          {c.history.filter((h) => h.status === 'COMPLETED').slice(0, 5).map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2">
              <div>
                <p className="text-[12px] font-medium text-[#0F172A]">{h.service}</p>
                <p className="text-[11px] text-[#94A3B8]">{formatDate(h.date)} · {h.paymentMethod}</p>
              </div>
              <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                R$ {h.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ClienteModalProps {
  cliente: Cliente | null
  onClose: () => void
}

export default function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  const [tab, setTab] = useState<Tab>('perfil')

  useEffect(() => {
    if (cliente) setTab('perfil')
  }, [cliente?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cliente) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [cliente, onClose])

  if (!cliente) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil: ${cliente.name}`}
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#F1F5F9] px-6 py-4">
          <ClienteAvatar name={cliente.name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[16px] font-semibold text-[#0F172A]">{cliente.name}</h2>
              {cliente.tags.slice(0, 2).map((t) => <ClienteTagBadge key={t} tag={t} />)}
            </div>
            <p className="text-[12px] text-[#94A3B8]">{cliente.email} · {cliente.phone}</p>
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
        <div className="shrink-0 border-b border-[#F1F5F9] px-6" role="tablist" aria-label="Seções do perfil">
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'border-b-2 px-4 py-3 text-[13px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                  tab === t.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#475569]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" role="tabpanel">
          {tab === 'perfil'       && <TabPerfil        c={cliente} />}
          {tab === 'historico'    && <TabHistorico      c={cliente} />}
          {tab === 'agendamentos' && <TabAgendamentos   c={cliente} />}
          {tab === 'financeiro'   && <TabFinanceiro     c={cliente} />}
        </div>
      </div>
    </div>
  )
}
