'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Mail, Phone, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profissional } from '@/lib/profissionais-mock'
import { formatBRL, formatDate, age, hireSince } from '@/lib/profissionais-mock'
import { ProfissionalAvatar, RoleBadge, StatusBadge } from './profissional-card'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'

type Tab = 'perfil' | 'desempenho' | 'comissao' | 'servicos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil',     label: 'Perfil'      },
  { id: 'desempenho', label: 'Desempenho'  },
  { id: 'comissao',   label: 'Comissão'    },
  { id: 'servicos',   label: 'Serviços'    },
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const TIMES = Array.from({ length: 32 }, (_, i) => {
  const total = i * 30 + 360
  const h = Math.floor(total / 60).toString().padStart(2, '0')
  const m = (total % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})
const SVG_ARROW_SM = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"
const VINCULOS = ['Funcionário', 'Comissionado', 'Parceiro', 'Autônomo']

function EditActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex gap-2 justify-end mt-2">
      <button type="button" onClick={onCancel}
        className="px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] rounded-md hover:bg-[var(--color-surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
        Cancelar
      </button>
      <button type="button" onClick={onSave}
        className="px-2.5 py-1 text-[11px] text-white bg-[var(--color-brand)] rounded-md hover:bg-[var(--color-brand-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
        Salvar
      </button>
    </div>
  )
}

// ─── Tab: Perfil ──────────────────────────────────────────────────────────────

function TabPerfil({ p, onUpdate }: { p: Profissional; onUpdate?: () => void }) {
  const [editingHorario,  setEditingHorario]  = useState(false)
  const [editDays,        setEditDays]         = useState<number[]>(p.workDays ?? [])
  const [editStart,       setEditStart]        = useState(p.workStart || '08:00')
  const [editEnd,         setEditEnd]          = useState(p.workEnd   || '18:00')
  const [editingDados,    setEditingDados]     = useState(false)
  const [editName,        setEditName]         = useState(p.name)
  const [editEmail,       setEditEmail]        = useState(p.email)
  const [editPhone,       setEditPhone]        = useState(p.phone)
  const [editCpf,         setEditCpf]          = useState(p.cpf ?? '')
  const [editBirth,       setEditBirth]        = useState(p.birthDate ?? '')
  const [editVinculo,     setEditVinculo]      = useState(p.vinculo ?? '')
  const [editingEspec,    setEditingEspec]     = useState(false)
  const [editEspec,       setEditEspec]        = useState(p.specialties.join(', '))
  const [editingComissao, setEditingComissao]  = useState(false)
  const [editComissao,    setEditComissao]     = useState(String(p.commissionPct))
  const [roles,           setRoles]            = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/professionals/roles`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(r => { const list = Array.isArray(r.data) ? r.data : []; setRoles(list.map((x: { name: string }) => x.name)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setEditDays(p.workDays ?? []);  setEditStart(p.workStart || '08:00'); setEditEnd(p.workEnd || '18:00')
    setEditingHorario(false)
    setEditName(p.name);            setEditEmail(p.email);                setEditPhone(p.phone)
    setEditCpf(p.cpf ?? '');       setEditBirth(p.birthDate ?? '')
    setEditVinculo(p.vinculo ?? '')
    setEditingDados(false)
    setEditEspec(p.specialties.join(', '));                               setEditingEspec(false)
    setEditComissao(String(p.commissionPct));                             setEditingComissao(false)
  }, [p.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveHorario() {
    if (!FEATURES.realProfissionais) { setEditingHorario(false); return }
    await profissionaisApi.update(p.id, { workDays: editDays, workStart: editStart, workEnd: editEnd })
    setEditingHorario(false)
    onUpdate?.()
  }
  async function saveDados() {
    if (!FEATURES.realProfissionais) { setEditingDados(false); return }
    await profissionaisApi.update(p.id, {
      name: editName, email: editEmail, phone: editPhone,
      cpf: editCpf, birthDate: editBirth || null, vinculo: editVinculo || null,
    })
    setEditingDados(false)
    onUpdate?.()
  }
  async function saveEspec() {
    if (!FEATURES.realProfissionais) { setEditingEspec(false); return }
    await profissionaisApi.update(p.id, { specialty: editEspec })
    setEditingEspec(false)
    onUpdate?.()
  }
  async function saveComissao() {
    if (!FEATURES.realProfissionais) { setEditingComissao(false); return }
    await profissionaisApi.update(p.id, { commissionPct: Number(editComissao) })
    setEditingComissao(false)
    onUpdate?.()
  }

  const viewRows: [string, string][] = [
    ['E-mail',          p.email || '—'],
    ['Telefone',        p.phone || '—'],
    ['CPF',             p.cpf   || '—'],
    ['Nascimento',      p.birthDate ? `${formatDate(p.birthDate)} (${age(p.birthDate)} anos)` : '—'],
    ['Contratação',     p.hireDate  ? `${formatDate(p.hireDate)} · ${hireSince(p.hireDate)} no salão` : '—'],
    ['Tipo de vínculo', p.vinculo || 'Não definido'],
  ]

  const dadosInputs = [
    { label: 'Nome',       id: 'edit-nome',  value: editName,  set: setEditName,  type: 'text'  },
    { label: 'E-mail',     id: 'edit-mail',  value: editEmail, set: setEditEmail, type: 'email' },
    { label: 'Telefone',   id: 'edit-fone',  value: editPhone, set: setEditPhone, type: 'tel'   },
    { label: 'CPF',        id: 'edit-cpf',   value: editCpf,   set: setEditCpf,   type: 'text'  },
    { label: 'Nascimento', id: 'edit-nasc',  value: editBirth, set: setEditBirth, type: 'date'  },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        {/* Esquerda — Contato e dados */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">Contato e dados</p>
            {!editingDados && (
              <button type="button" onClick={() => setEditingDados(true)}
                className="text-[11px] text-[var(--color-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] rounded">
                Editar
              </button>
            )}
          </div>
          {!editingDados ? (
            <ul className="space-y-2.5">
              {viewRows.map(([label, value]) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="mt-px min-w-[100px] shrink-0 text-[11px] text-[var(--color-text-tertiary)]">{label}</span>
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)] break-words">{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2">
              {dadosInputs.map(({ label, id, value, set, type }) => (
                <div key={label}>
                  <label htmlFor={id} className="block text-[11px] text-[var(--color-text-tertiary)] mb-0.5">{label}</label>
                  <input id={id} type={type} value={value} onChange={e => set(e.target.value)}
                    className="w-full border border-[var(--color-border-primary)] rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-[var(--color-brand)]" />
                </div>
              ))}
              <div>
                <label htmlFor="edit-vinculo" className="block text-[11px] text-[var(--color-text-tertiary)] mb-0.5">Tipo de vínculo</label>
                <select id="edit-vinculo" value={editVinculo} onChange={e => setEditVinculo(e.target.value)}
                  className="w-full border border-[var(--color-border-primary)] rounded-md px-2 py-1.5 text-[12px] bg-white appearance-none focus:outline-none focus:border-[var(--color-brand)]">
                  <option value="">Selecionar...</option>
                  {VINCULOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <EditActions onCancel={() => setEditingDados(false)} onSave={() => void saveDados()} />
            </div>
          )}
          {p.bio && !editingDados && (
            <div className="mt-4 rounded-lg bg-[var(--color-surface-secondary)] px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{p.bio}</p>
            </div>
          )}
        </div>

        {/* Direita — Horário de trabalho */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">Horário de trabalho</p>
            {!editingHorario && (
              <button type="button" onClick={() => setEditingHorario(true)}
                className="text-[11px] text-[var(--color-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] rounded">
                Editar
              </button>
            )}
          </div>
          {!editingHorario ? (
            <table className="w-full text-[12px] mt-2">
              <thead>
                <tr className="border-b border-[var(--color-surface-tertiary)]">
                  <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)] w-10">Dia</th>
                  <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)]">Entrada</th>
                  <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)]">Saída</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, i) => {
                  const ativo = (editDays ?? []).includes(i)
                  return (
                    <tr key={i} className="border-b border-[var(--color-surface-secondary)] last:border-0">
                      <td className="py-1.5 font-medium text-[var(--color-text-secondary)]">{day}</td>
                      <td className="py-1.5 text-[var(--color-text-primary)]">
                        {ativo ? editStart : <span className="text-[var(--color-border-secondary)] text-[11px]">Folga</span>}
                      </td>
                      <td className="py-1.5 text-[var(--color-text-primary)]">{ativo ? editEnd : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <>
              <table className="w-full text-[12px] mt-2">
                <thead>
                  <tr className="border-b border-[var(--color-surface-tertiary)]">
                    <th className="pb-1.5 w-5"></th>
                    <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)] w-10">Dia</th>
                    <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)]">Entrada</th>
                    <th className="pb-1.5 text-left text-[11px] font-medium text-[var(--color-text-tertiary)]">Saída</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, i) => {
                    const ativo = editDays.includes(i)
                    return (
                      <tr key={i} className="border-b border-[var(--color-surface-secondary)] last:border-0">
                        <td className="py-1.5">
                          <input type="checkbox" checked={ativo}
                            aria-label={`${day} — ${ativo ? 'ativo' : 'folga'}`}
                            onChange={() => setEditDays(prev =>
                              prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort((a, b) => a - b)
                            )}
                            className="accent-[var(--color-brand)] w-3.5 h-3.5"
                          />
                        </td>
                        <td className={cn('py-1.5 font-medium', ativo ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-border-secondary)]')}>
                          {day}
                        </td>
                        <td className="py-1.5">
                          {ativo ? (
                            <select value={editStart} onChange={e => setEditStart(e.target.value)}
                              className="border border-[var(--color-border-primary)] rounded px-1.5 py-0.5 text-[11px] bg-white appearance-none pr-5 focus:outline-none focus:border-[var(--color-brand)]"
                              style={{ backgroundImage: SVG_ARROW_SM, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}>
                              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          ) : <span className="text-[var(--color-border-secondary)]">—</span>}
                        </td>
                        <td className="py-1.5">
                          {ativo ? (
                            <select value={editEnd} onChange={e => setEditEnd(e.target.value)}
                              className="border border-[var(--color-border-primary)] rounded px-1.5 py-0.5 text-[11px] bg-white appearance-none pr-5 focus:outline-none focus:border-[var(--color-brand)]"
                              style={{ backgroundImage: SVG_ARROW_SM, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}>
                              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          ) : <span className="text-[var(--color-border-secondary)]">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="flex gap-2 justify-end mt-3">
                <button type="button" onClick={() => setEditingHorario(false)}
                  className="px-3 py-1.5 text-[11px] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] rounded-md hover:bg-[var(--color-surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                  Cancelar
                </button>
                <button type="button" onClick={() => void saveHorario()}
                  className="px-3 py-1.5 text-[11px] text-white bg-[var(--color-brand)] rounded-md hover:bg-[var(--color-brand-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]">
                  Salvar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ZONA 2 — Especialidades + Comissão */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--color-border-primary)] px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">Especialidade</p>
            {!editingEspec && (
              <button type="button" onClick={() => setEditingEspec(true)}
                className="text-[11px] text-[var(--color-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] rounded">
                Editar
              </button>
            )}
          </div>
          {!editingEspec ? (
            <div className="flex flex-wrap gap-1">
              {p.specialties.length > 0
                ? p.specialties.map(s => (
                    <span key={s} className="rounded-full border border-[var(--color-border-primary)] px-2.5 py-0.5 text-[11px] text-[var(--color-text-secondary)]">{s}</span>
                  ))
                : <span className="text-[12px] text-[var(--color-text-tertiary)]">—</span>
              }
            </div>
          ) : (
            <div className="space-y-2">
              {roles.length > 0 ? (
                <select value={editEspec} onChange={e => setEditEspec(e.target.value)}
                  className="w-full border border-[var(--color-border-primary)] rounded-md px-2 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[var(--color-brand)]">
                  <option value="">Selecionar especialidade...</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <p className="text-[12px] text-[var(--color-text-tertiary)]">
                  Nenhum cargo cadastrado.
                  <a href="/configuracoes" className="text-[var(--color-brand)] hover:underline ml-1">Cadastrar agora</a>
                </p>
              )}
              <EditActions onCancel={() => setEditingEspec(false)} onSave={() => void saveEspec()} />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[var(--color-border-primary)] px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">Comissão</p>
            {!editingComissao && (
              <button type="button" onClick={() => setEditingComissao(true)}
                className="text-[11px] text-[var(--color-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)] rounded">
                Editar
              </button>
            )}
          </div>
          {!editingComissao ? (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-[11px] font-bold text-[var(--color-brand)]">
                {p.commissionPct}%
              </span>
              <div>
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{p.commissionPct}% sobre serviços</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  Est. este mês: {formatBRL((p.revenueThisMonth ?? 0) * Number(p.commissionPct ?? 0) / 100)}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" min="0" max="100" value={editComissao}
                  onChange={e => setEditComissao(e.target.value)}
                  className="w-20 border border-[var(--color-border-primary)] rounded-md px-2 py-1 text-[13px] text-center focus:outline-none focus:border-[var(--color-brand)]" />
                <span className="text-[13px] text-[var(--color-text-secondary)]">% sobre serviços</span>
              </div>
              <EditActions onCancel={() => setEditingComissao(false)} onSave={() => void saveComissao()} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Desempenho ──────────────────────────────────────────────────────────

function TabDesempenho({ p }: { p: Profissional }) {
  const [monthModal, setMonthModal] = useState<{ month: string; label: string } | null>(null)
  const [monthAppts, setMonthAppts] = useState<Record<string, unknown>[]>([])
  const [loadingAppts, setLoadingAppts] = useState(false)

  function deriveMonthKey(label: string): string {
    const months: Record<string, string> = {
      jan: '01', fev: '02', mar: '03', abr: '04',
      mai: '05', jun: '06', jul: '07', ago: '08',
      set: '09', out: '10', nov: '11', dez: '12',
    }
    const parts = label.split(/[\s./]+/).filter(Boolean)
    const mon = (parts[0] ?? '').toLowerCase().replace('.', '').slice(0, 3)
    const yr = parts[parts.length - 1] ?? ''
    return `20${yr}-${months[mon] ?? '01'}`
  }

  async function handleMonthClick(monthKey: string, label: string) {
    setMonthModal({ month: monthKey, label })
    setLoadingAppts(true)
    try {
      const token = localStorage.getItem('accessToken') ?? ''
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/professionals/${p.id}/appointments?month=${monthKey}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const json = (await res.json()) as { data?: unknown }
      const arr = Array.isArray(json.data) ? json.data : Array.isArray(json) ? (json as unknown[]) : []
      setMonthAppts(arr as Record<string, unknown>[])
    } catch { setMonthAppts([]) }
    finally { setLoadingAppts(false) }
  }

  const kpis = [
    { label: 'Total de visitas',   value: p.appointmentsTotal.toString() },
    { label: 'Faturamento total',  value: formatBRL(p.revenueTotal) },
    { label: 'Ticket médio',       value: formatBRL(p.avgTicket) },
  ]

  return (
    <>
      <div className="space-y-5">
        {/* KPI chips */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[var(--color-border-primary)] bg-white px-4 py-3">
              <p className="text-[11px] text-[var(--color-text-tertiary)]">{label}</p>
              <p className="mt-1 font-tabular text-[16px] font-bold text-[var(--color-text-primary)]">{value}</p>
            </div>
          ))}
        </div>

        {/* Resumo por status */}
        <div className="rounded-lg border border-[var(--color-border-primary)] bg-white px-4 py-3 space-y-2">
          <p className="text-[12px] font-medium text-[#64748B] mb-3">Resumo de agendamentos</p>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#64748B]">Total agendados</span>
            <span className="font-medium text-[#0F172A]">{p.totalAgendados ?? 0}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#64748B]">Finalizados</span>
            <span className="font-medium text-[#15803D]">{p.totalFinalizados ?? 0}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#64748B]">Pendentes</span>
            <span className="font-medium text-[#92400E]">{p.totalPendentes ?? 0}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#64748B]">Cancelados</span>
            <span className="font-medium text-[#DC2626]">{p.totalCancelados ?? 0}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-primary)] bg-white px-4 py-3">
          <Star size={16} className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
          <div>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Avaliação dos clientes</p>
            <p className="font-tabular text-[15px] font-bold text-[var(--color-text-primary)]">
              {Number(p.rating ?? 0).toFixed(1)} <span className="text-[12px] font-normal text-[var(--color-text-tertiary)]">/ 5.0 · {p.ratingCount ?? 0} avaliações</span>
            </p>
          </div>
        </div>

        {/* Tabela transposta — histórico mensal */}
        <div className="mt-4 overflow-x-auto">
          <p className="text-[13px] font-medium text-[#0F172A] mb-3">Histórico — últimos 6 meses</p>
          <table className="w-full text-[12px]" style={{ minWidth: 520 }}>
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-2 pr-4 text-left font-medium text-[#94A3B8] w-28"></th>
                {p.monthlyData.map((m, i) => (
                  <th
                    key={i}
                    onClick={() => void handleMonthClick(deriveMonthKey(m.month), m.month)}
                    className="py-2 text-center font-medium text-[#2563EB] capitalize cursor-pointer hover:underline"
                  >
                    {m.month}
                  </th>
                ))}
                <th className="py-2 text-center font-semibold text-[#0F172A]">Total</th>
              </tr>
            </thead>
            <tbody>
              {([
                { label: 'Agendados',   key: 'totalAgendamentos', color: '#0F172A', isCurrency: false },
                { label: 'Finalizados', key: 'finalizados',        color: '#15803D', isCurrency: false },
                { label: 'Pendentes',   key: 'pendentes',          color: '#92400E', isCurrency: false },
                { label: 'Cancelados',  key: 'cancelados',         color: '#DC2626', isCurrency: false },
                { label: 'Faturado',    key: 'revenue',            color: '#0F172A', isCurrency: true  },
                { label: 'Comissão',    key: 'commission',         color: '#7C3AED', isCurrency: true  },
              ] as { label: string; key: string; color: string; isCurrency: boolean }[]).map((row) => {
                const vals = p.monthlyData.map((m) => {
                  if (row.key === 'commission') return Number(m.commission ?? m.revenue * p.commissionPct / 100)
                  return Number((m as unknown as Record<string, unknown>)[row.key] ?? 0)
                })
                const total = vals.reduce((s, v) => s + v, 0)
                return (
                  <tr key={row.key} className="border-b border-[#F8FAFC] hover:bg-[#FAFAFA]">
                    <td className="py-2 pr-4 font-medium" style={{ color: row.color }}>{row.label}</td>
                    {vals.map((val, i) => (
                      <td key={i} className="py-2 text-center font-tabular" style={{ color: row.color }}>
                        {val > 0
                          ? row.isCurrency ? `R$ ${val.toFixed(2).replace('.', ',')}` : String(val)
                          : <span className="text-[#CBD5E1]">—</span>}
                      </td>
                    ))}
                    <td className="py-2 text-center font-tabular font-semibold" style={{ color: row.color }}>
                      {total > 0
                        ? row.isCurrency ? `R$ ${total.toFixed(2).replace('.', ',')}` : String(total)
                        : <span className="font-normal text-[#CBD5E1]">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-modal: agendamentos do mês selecionado */}
      {monthModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/50" onClick={() => setMonthModal(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">
                Agendamentos — {monthModal.label} · {p.name}
              </h3>
              <button
                type="button"
                onClick={() => setMonthModal(null)}
                className="text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
              >✕</button>
            </div>

            {loadingAppts ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[13px] text-[#94A3B8]">Carregando...</p>
              </div>
            ) : monthAppts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[13px] text-[#94A3B8]">Nenhum agendamento neste mês.</p>
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Data</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Hora</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Cliente</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Serviço</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Pagamento</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Valor</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Atendimento</th>
                  </tr>
                </thead>
                <tbody>
                  {monthAppts.map((a) => {
                    const status = String(a.status ?? '')
                    const isPago = status === 'COMPLETED'
                    const isCancelado = status === 'CANCELLED'
                    const value = Number(a.value ?? 0)
                    return (
                      <tr key={String(a.id)} className="border-b border-[#F8FAFC] hover:bg-[#FAFAFA]">
                        <td className="px-4 py-3 text-[#475569]">
                          {new Date(String(a.date) + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-[#475569] font-tabular">{String(a.startTime ?? '—')}</td>
                        <td className="px-4 py-3 text-[#0F172A] font-medium">{String(a.client ?? '—')}</td>
                        <td className="px-4 py-3 text-[#475569]">{String(a.service ?? '—')}</td>
                        <td className="px-4 py-3">
                          {isCancelado ? <span className="text-[#94A3B8]">—</span> : (
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                              isPago ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                            )}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', isPago ? 'bg-[#22C55E]' : 'bg-[#F59E0B]')} />
                              {isPago ? 'Pago' : 'Pendente'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#0F172A]">
                          R$ {value.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                            isPago ? 'bg-[#F5F3FF] text-[#7C3AED]' :
                            isCancelado ? 'bg-[#FEF2F2] text-[#DC2626]' :
                            'bg-[#EFF6FF] text-[#1D4ED8]'
                          )}>
                            {isPago ? 'Realizado' : isCancelado ? 'Cancelado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Tab: Comissão ────────────────────────────────────────────────────────────

function TabComissao({ p }: { p: Profissional }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-primary)] bg-white px-5 py-4">
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">Comissão este mês</p>
          <p className="mt-1 font-tabular text-[22px] font-bold text-[var(--color-text-primary)]">
            {formatBRL((p.revenueThisMonth ?? 0) * Number(p.commissionPct ?? 0) / 100)}
          </p>
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            {p.commissionPct}% de {formatBRL(p.revenueThisMonth ?? 0)} faturados
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)]">
          <span className="text-[15px] font-bold text-[var(--color-brand)]">{p.commissionPct}%</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[12px] font-medium text-[var(--color-text-secondary)]">Histórico por mês</p>
        <div className="overflow-hidden rounded-lg border border-[var(--color-border-primary)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)] bg-[#F8FAFC]">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Mês</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Fat.</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {[...p.monthlyData].reverse().map((m) => (
                <tr key={m.month} className="hover:bg-[var(--color-surface-secondary)]">
                  <td className="px-4 py-2.5 font-medium text-[var(--color-text-primary)]">{m.month} 2026</td>
                  <td className="px-4 py-2.5 text-right font-tabular text-[var(--color-text-secondary)]">
                    {m.revenue > 0 ? formatBRL(m.revenue) : <span className="text-[var(--color-border-secondary)]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-tabular font-semibold text-[var(--color-text-primary)]">
                    {m.revenue > 0 ? formatBRL((m.revenue ?? 0) * Number(p.commissionPct ?? 0) / 100) : <span className="font-normal text-[var(--color-border-secondary)]">—</span>}
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

// ─── Tab: Serviços ───────────────────────────────────────────────────────────

interface RawService { id: string; name: string }

function TabServicos({ p, onUpdate }: { p: Profissional; onUpdate?: () => void }) {
  const [allServices, setAllServices] = useState<RawService[]>([])
  const [enabled, setEnabled]         = useState<string[]>(p.enabledServices ?? [])
  const [saving, setSaving]           = useState<string | null>(null)

  useEffect(() => { setEnabled(p.enabledServices ?? []) }, [p.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!FEATURES.realProfissionais) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((r: unknown) => {
        const list = Array.isArray((r as { data?: unknown }).data)
          ? (r as { data: RawService[] }).data
          : []
        setAllServices(list)
      })
      .catch(() => {})
  }, [])

  async function toggleServico(serviceId: string) {
    const original = enabled
    const next = enabled.includes(serviceId)
      ? enabled.filter((id) => id !== serviceId)
      : [...enabled, serviceId]
    setEnabled(next)
    setSaving(serviceId)
    try {
      if (FEATURES.realProfissionais) {
        await profissionaisApi.update(p.id, { enabledServices: next })
      }
    } catch {
      setEnabled(original)
    } finally {
      setSaving(null)
    }
  }

  if (!FEATURES.realProfissionais) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border-primary)]">
        <p className="text-[13px] text-[var(--color-text-tertiary)]">Disponível com API real</p>
        <p className="text-[11px] text-[var(--color-text-disabled)]">Configure NEXT_PUBLIC_USE_REAL_API=true</p>
      </div>
    )
  }

  if (allServices.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border-primary)]">
        <p className="text-[13px] text-[var(--color-text-tertiary)]">Nenhum serviço cadastrado</p>
        <p className="text-[11px] text-[var(--color-text-disabled)]">Configure em Serviços → Novo Serviço</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {allServices.map((s) => {
        const habilitado = enabled.includes(s.id)
        return (
          <button
            key={s.id}
            type="button"
            onClick={(e) => { e.stopPropagation(); void toggleServico(s.id) }}
            disabled={saving === s.id}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors',
              habilitado
                ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)]'
                : 'border-[var(--color-border-primary)] bg-white hover:bg-[var(--color-surface-secondary)]',
            )}
          >
            <p className={cn('text-[13px] font-medium', habilitado ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-primary)]')}>
              {s.name}
            </p>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              habilitado
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]',
            )}>
              {saving === s.id ? 'Salvando…' : habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ProfissionalModalProps {
  profissional: Profissional | null
  onClose: () => void
  onUpdate?: () => void
}

export default function ProfissionalModal({ profissional, onClose, onUpdate }: ProfissionalModalProps) {
  const [tab, setTab] = useState<Tab>('perfil')
  const openedIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (profissional && profissional.id !== openedIdRef.current) {
      openedIdRef.current = profissional.id
      setTab('perfil')
    }
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
        className="absolute inset-0 bg-[var(--color-text-primary)]/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[var(--color-surface-tertiary)] px-6 py-4">
          <ProfissionalAvatar name={p.name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">{p.name}</h2>
              <RoleBadge role={p.role} />
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1"><Mail size={11} aria-hidden="true" />{p.email}</span>
              <span className="flex items-center gap-1"><Phone size={11} aria-hidden="true" />{p.phone}</span>
              <span className="flex items-center gap-1"><Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />{Number(p.rating ?? 0).toFixed(1)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-[var(--color-surface-tertiary)]" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 border-b-2 py-2.5 text-[12px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                tab === t.id
                  ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === 'perfil'     && <TabPerfil      p={p} onUpdate={onUpdate} />}
          {tab === 'desempenho' && <TabDesempenho  p={p} />}
          {tab === 'comissao'   && <TabComissao    p={p} />}
          {tab === 'servicos'   && <TabServicos    p={p} onUpdate={onUpdate} />}
        </div>
      </div>
    </div>
  )
}
