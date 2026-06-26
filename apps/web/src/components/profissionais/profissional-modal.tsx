'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Phone, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profissional } from '@/lib/profissionais-mock'
import { formatBRL, formatDate, age, hireSince } from '@/lib/profissionais-mock'
import { ProfissionalAvatar, RoleBadge, StatusBadge } from './profissional-card'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'

type Tab = 'perfil' | 'desempenho' | 'comissao'

const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil',     label: 'Perfil'      },
  { id: 'desempenho', label: 'Desempenho'  },
  { id: 'comissao',   label: 'Comissão'    },
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const TIMES = Array.from({ length: 32 }, (_, i) => {
  const total = i * 30 + 360
  const h = Math.floor(total / 60).toString().padStart(2, '0')
  const m = (total % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})
const SVG_ARROW = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

// ─── Tab: Perfil ──────────────────────────────────────────────────────────────

function TabPerfil({ p }: { p: Profissional }) {
  const [editingHorario, setEditingHorario] = useState(false)
  const [editDays, setEditDays] = useState<number[]>(p.workDays ?? [])
  const [editStart, setEditStart] = useState(p.workStart || '08:00')
  const [editEnd, setEditEnd] = useState(p.workEnd || '18:00')

  useEffect(() => {
    setEditDays(p.workDays ?? [])
    setEditStart(p.workStart || '08:00')
    setEditEnd(p.workEnd || '18:00')
    setEditingHorario(false)
  }, [p.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveHorario() {
    if (!FEATURES.realProfissionais) { setEditingHorario(false); return }
    await profissionaisApi.update(p.id, { workDays: editDays, workStart: editStart, workEnd: editEnd })
    setEditingHorario(false)
  }

  const infoRows: [string, string][] = [
    ['E-mail',      p.email],
    ['Telefone',    p.phone],
    ['CPF',         p.cpf],
    ['Nascimento',  `${formatDate(p.birthDate)} (${age(p.birthDate)} anos)`],
    ['Contratação', `${formatDate(p.hireDate)} · ${hireSince(p.hireDate)} no salão`],
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Dados */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Contato e dados</p>
        <ul className="space-y-2.5">
          {infoRows.map(([label, value]) => (
            <li key={label} className="flex items-start gap-2">
              <span className="mt-px min-w-[90px] shrink-0 text-[11px] text-[#94A3B8]">{label}</span>
              <span className="text-[13px] font-medium text-[#0F172A] break-words">{value}</span>
            </li>
          ))}
        </ul>
        {p.bio && (
          <div className="mt-4 rounded-lg bg-[#F8FAFC] px-3 py-2.5">
            <p className="text-[12px] leading-relaxed text-[#475569]">{p.bio}</p>
          </div>
        )}
      </div>

      {/* Horário, especialidades, comissão */}
      <div className="space-y-4">

        {/* Horário de trabalho */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[12px] font-medium text-[#64748B]">Horário de trabalho</p>
            {!editingHorario && (
              <button
                type="button"
                onClick={() => setEditingHorario(true)}
                className="text-[11px] text-[#2563EB] hover:underline focus-visible:outline-none"
              >
                Editar
              </button>
            )}
          </div>

          {!editingHorario ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px]">
              <p className="font-medium text-[#0F172A]">{editStart} – {editEnd}</p>
              <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                {editDays.length > 0 ? editDays.map(d => DAYS[d]).join(', ') : '—'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-3 space-y-3">
              {/* Dias */}
              <div>
                <p className="text-[11px] text-[#94A3B8] mb-1.5">Dias de trabalho</p>
                <div className="flex gap-1 flex-wrap">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditDays(prev =>
                        prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort((a, b) => a - b)
                      )}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        editDays.includes(i)
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {/* Seleção de horários */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8]">Entrada</span>
                  <select
                    value={editStart}
                    onChange={e => setEditStart(e.target.value)}
                    className="border border-[#E2E8F0] rounded-md px-2 py-1.5 text-[12px] bg-white appearance-none pr-6 min-w-[80px] focus:outline-none focus:border-[#2563EB]"
                    style={{ backgroundImage: SVG_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                  >
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <span className="text-[12px] text-[#94A3B8] pb-2">–</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8]">Saída</span>
                  <select
                    value={editEnd}
                    onChange={e => setEditEnd(e.target.value)}
                    className="border border-[#E2E8F0] rounded-md px-2 py-1.5 text-[12px] bg-white appearance-none pr-6 min-w-[80px] focus:outline-none focus:border-[#2563EB]"
                    style={{ backgroundImage: SVG_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                  >
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {/* Ações */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingHorario(false)}
                  className="px-3 py-1.5 text-[11px] text-[#475569] border border-[#E2E8F0] rounded-md hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void saveHorario()}
                  className="px-3 py-1.5 text-[11px] text-white bg-[#2563EB] rounded-md hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Especialidades */}
        <div>
          <p className="mb-2.5 text-[12px] font-medium text-[#64748B]">Especialidades</p>
          {p.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {p.specialties.map((s) => (
                <span key={s} className="rounded-full border border-[#E2E8F0] px-2.5 py-0.5 text-[11px] text-[#475569]">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#94A3B8]">—</p>
          )}
        </div>

        {/* Comissão */}
        <div>
          <p className="mb-2.5 text-[12px] font-medium text-[#64748B]">Comissão</p>
          <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
              <span className="text-[13px] font-bold text-[#2563EB]">{p.commissionPct}%</span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">{p.commissionPct}% sobre serviços</p>
              <p className="text-[11px] text-[#94A3B8]">
                Estimado este mês: {formatBRL((p.revenueThisMonth ?? 0) * Number(p.commissionPct ?? 0) / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Desempenho ──────────────────────────────────────────────────────────

function TabDesempenho({ p }: { p: Profissional }) {
  const maxRev = Math.max(...p.monthlyData.map((m) => m.revenue), 1)
  const kpis = [
    { label: 'Total de visitas',   value: p.appointmentsTotal.toString() },
    { label: 'Faturamento total',  value: formatBRL(p.revenueTotal) },
    { label: 'Ticket médio',       value: formatBRL(p.avgTicket) },
  ]
  return (
    <div className="space-y-5">
      {/* KPI chips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
            <p className="text-[11px] text-[#94A3B8]">{label}</p>
            <p className="mt-1 font-tabular text-[16px] font-bold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
        <Star size={16} className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
        <div>
          <p className="text-[11px] text-[#94A3B8]">Avaliação dos clientes</p>
          <p className="font-tabular text-[15px] font-bold text-[#0F172A]">
            {Number(p.rating ?? 0).toFixed(1)} <span className="text-[12px] font-normal text-[#94A3B8]">/ 5.0 · {p.ratingCount ?? 0} avaliações</span>
          </p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Faturamento — últimos 6 meses</p>
        <div className="flex h-28 items-end gap-2" role="img" aria-label="Gráfico de faturamento mensal">
          {p.monthlyData.map((m) => {
            const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-tabular text-[#94A3B8]">
                  {m.revenue > 0 ? `${Math.round(m.revenue / 1000)}k` : ''}
                </span>
                <div
                  className="w-full rounded-t-sm bg-[#2563EB] transition-all duration-300"
                  style={{ height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%`, opacity: m.revenue > 0 ? 1 : 0.15 }}
                  title={`${m.month}: ${formatBRL(m.revenue)}`}
                />
                <span className="text-[10px] text-[#94A3B8]">{m.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2 rounded-lg bg-[#F0FDF4] px-3 py-2.5">
        <TrendingUp size={14} className="text-[#16A34A]" aria-hidden="true" />
        <p className="text-[12px] text-[#166534]">
          Média mensal: <span className="font-semibold">{formatBRL(p.revenueTotal / Math.max(p.monthlyData.filter(m => m.revenue > 0).length, 1))}</span>
        </p>
      </div>
    </div>
  )
}

// ─── Tab: Comissão ────────────────────────────────────────────────────────────

function TabComissao({ p }: { p: Profissional }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
        <div>
          <p className="text-[12px] text-[#94A3B8]">Comissão este mês</p>
          <p className="mt-1 font-tabular text-[22px] font-bold text-[#0F172A]">
            {formatBRL((p.revenueThisMonth ?? 0) * Number(p.commissionPct ?? 0) / 100)}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            {p.commissionPct}% de {formatBRL(p.revenueThisMonth ?? 0)} faturados
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
          <span className="text-[15px] font-bold text-[#2563EB]">{p.commissionPct}%</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Histórico por mês</p>
        <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Mês</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Fat.</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {[...p.monthlyData].reverse().map((m) => (
                <tr key={m.month} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-2.5 font-medium text-[#0F172A]">{m.month} 2026</td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[#475569]">
                    {m.revenue > 0 ? formatBRL(m.revenue) : <span className="text-[#CBD5E1]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-tabular font-semibold text-[#0F172A]">
                    {m.revenue > 0 ? formatBRL((m.revenue ?? 0) * Number(p.commissionPct ?? 0) / 100) : <span className="font-normal text-[#CBD5E1]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ProfissionalModalProps {
  profissional: Profissional | null
  onClose: () => void
}

export default function ProfissionalModal({ profissional, onClose }: ProfissionalModalProps) {
  const [tab, setTab] = useState<Tab>('perfil')

  useEffect(() => {
    if (profissional) setTab('perfil')
  }, [profissional?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profissional) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [profissional, onClose])

  if (!profissional) return null
  const p = profissional

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil: ${p.name}`}
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
        <div className="flex shrink-0 items-center gap-4 border-b border-[#F1F5F9] px-6 py-4">
          <ProfissionalAvatar name={p.name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">{p.name}</h2>
              <RoleBadge role={p.role} />
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[12px] text-[#94A3B8]">
              <span className="flex items-center gap-1"><Mail size={11} aria-hidden="true" />{p.email}</span>
              <span className="flex items-center gap-1"><Phone size={11} aria-hidden="true" />{p.phone}</span>
              <span className="flex items-center gap-1"><Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />{Number(p.rating ?? 0).toFixed(1)}</span>
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
          {TABS.map((t) => (
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
          {tab === 'perfil'     && <TabPerfil      p={p} />}
          {tab === 'desempenho' && <TabDesempenho  p={p} />}
          {tab === 'comissao'   && <TabComissao    p={p} />}
        </div>
      </div>
    </div>
  )
}
