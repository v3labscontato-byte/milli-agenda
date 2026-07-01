'use client'

import { useEffect, useState } from 'react'
import { X, Phone, Mail, CreditCard, Calendar, Clock, Trash2, User, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Cliente } from '@/lib/clientes-mock'
import { formatDate, age, clienteSinceLabel } from '@/lib/clientes-mock'
import { ClienteAvatar, ClienteTagBadge } from './cliente-card'

type Tab = 'perfil' | 'historico' | 'financeiro'
const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil',    label: 'Perfil'     },
  { id: 'historico', label: 'Histórico'  },
  { id: 'financeiro', label: 'Financeiro' },
]

const inputCls = 'w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB] placeholder:text-[#94A3B8]'
const btnSave = 'rounded-xl bg-[#2563EB] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]'
const btnCancel = 'rounded-xl border border-[#E2E8F0] px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]'

function TabPerfil({ c, profissionais }: { c: Cliente; profissionais: Array<{ id: string; name: string }> }) {
  const [editingDados, setEditingDados] = useState(false)
  const [editName,  setEditName]  = useState(c.name)
  const [editEmail, setEditEmail] = useState(c.email)
  const [editPhone, setEditPhone] = useState(c.phone)
  const [editCpf,   setEditCpf]   = useState(c.cpf ?? '')
  const [editBirth, setEditBirth] = useState(() => {
    if (!c.birthDate) return ''
    const d = new Date(c.birthDate as unknown as string)
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  })
  const [editNotes, setEditNotes] = useState(c.notes ?? '')
  const [saving, setSaving] = useState(false)

  const [editingPref, setEditingPref] = useState(false)
  const [editFavProf, setEditFavProf] = useState(c.favoriteProfessional ?? '')
  const [savingPref, setSavingPref] = useState(false)

  async function saveDados() {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail, phone: editPhone, cpf: editCpf, birthDate: editBirth || null, notes: editNotes }),
      })
      setEditingDados(false)
    } finally {
      setSaving(false)
    }
  }

  async function savePrefs() {
    setSavingPref(true)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ favoriteProfessionalId: editFavProf }),
      })
      setEditingPref(false)
    } finally {
      setSavingPref(false)
    }
  }

  const profFavoritoNome = profissionais.find((p) => p.id === editFavProf)?.name ?? ''

  return (
    <div className="space-y-4">
      {/* Dados Pessoais */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#DBEAFE]">
              <User size={12} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <p className="text-[13px] font-semibold text-[#0F172A]">Dados Pessoais</p>
          </div>
          {!editingDados && (
            <button type="button" onClick={() => setEditingDados(true)} className="text-[12px] font-medium text-[#2563EB] hover:underline focus-visible:outline-none">
              Editar
            </button>
          )}
        </div>

        {editingDados ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Nome</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Email</label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Telefone</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">CPF</label>
              <input value={editCpf} onChange={e => setEditCpf(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Nascimento</label>
              <input type="date" value={editBirth} onChange={e => setEditBirth(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Observações</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={saveDados} disabled={saving} className={btnSave}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setEditingDados(false)} disabled={saving} className={btnCancel}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-3">
            {[
              { icon: Phone,      label: 'Telefone', value: c.phone },
              { icon: Mail,       label: 'E-mail',   value: c.email },
              { icon: CreditCard, label: 'CPF',      value: c.cpf },
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
            {c.notes && (
              <div>
                <dt className="text-[11px] text-[#94A3B8]">Observações</dt>
                <dd className="mt-0.5 rounded-lg bg-[#FFFBEB] px-3 py-2 text-[12px] leading-relaxed text-[#475569]">
                  {c.notes}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Preferências */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FCE7F3]">
              <Heart size={12} className="text-[#DB2777]" aria-hidden="true" />
            </div>
            <p className="text-[13px] font-semibold text-[#0F172A]">Preferências</p>
          </div>
          {!editingPref && (
            <button type="button" onClick={() => setEditingPref(true)} className="text-[12px] font-medium text-[#2563EB] hover:underline focus-visible:outline-none">
              Editar
            </button>
          )}
        </div>

        {editingPref ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#64748B] block mb-1">Profissional favorito</label>
              <select value={editFavProf} onChange={e => setEditFavProf(e.target.value)} className={inputCls}>
                <option value="">Nenhum</option>
                {profissionais.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={savePrefs} disabled={savingPref} className={btnSave}>
                {savingPref ? 'Salvando…' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setEditingPref(false)} disabled={savingPref} className={btnCancel}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#64748B]">Profissional favorito</span>
              <span className="font-medium text-[#0F172A]">{profFavoritoNome || '—'}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#64748B]">Serviço mais frequente</span>
              <span className="text-[#94A3B8]">— (calculado do histórico)</span>
            </div>
            {c.tags.length > 0 && (
              <div className="pt-1">
                <p className="mb-1.5 text-[12px] font-medium text-[#64748B]">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => <ClienteTagBadge key={t} tag={t} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TabHistorico({ c }: { c: Cliente }) {
  if (!c.history || c.history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-[13px] text-[#94A3B8]">Nenhum atendimento registrado ainda.</p>
      </div>
    )
  }

  const TH = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]'

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            <th className={TH}>Data</th>
            <th className={TH}>Hora</th>
            <th className={TH}>Serviço</th>
            <th className={TH}>Pagamento</th>
            <th className={cn(TH, 'text-right')}>Valor</th>
            <th className={TH}>Atendimento</th>
          </tr>
        </thead>
        <tbody>
          {c.history.map((h) => {
            const date = new Date(h.date + 'T12:00:00')
            const isPago      = h.status === 'COMPLETED'
            const isCancelado = h.status === 'CANCELLED'
            return (
              <tr key={h.id} className="border-b border-[#F8FAFC] transition-colors hover:bg-[#FAFAFA]">
                <td className="px-3 py-2 text-[#475569]">
                  {date.toLocaleDateString('pt-BR')}
                </td>
                <td className="px-3 py-2 font-tabular text-[#475569]">—</td>
                <td className="px-3 py-2 text-[#0F172A]">{h.service || '—'}</td>
                <td className="px-3 py-2">
                  {isCancelado ? (
                    <span className="text-[#94A3B8]">—</span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                      style={isPago
                        ? { backgroundColor: '#DCFCE7', color: '#16A34A', borderColor: '#BBF7D0' }
                        : { backgroundColor: '#FEF9C3', color: '#CA8A04', borderColor: '#FDE68A' }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isPago ? '#16A34A' : '#CA8A04' }}
                      />
                      {isPago ? 'Pago' : 'Pendente'}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {isCancelado ? (
                    <span className="text-[#94A3B8] line-through">
                      R$ {h.amount.toFixed(2).replace('.', ',')}
                    </span>
                  ) : (
                    <span className="text-[#0F172A]">
                      R$ {h.amount.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={isPago
                      ? { backgroundColor: '#DCFCE7', color: '#16A34A' }
                      : isCancelado
                        ? { backgroundColor: '#FEE2E2', color: '#DC2626' }
                        : { backgroundColor: '#DBEAFE', color: '#2563EB' }}
                  >
                    {isPago ? 'Realizado' : isCancelado ? 'Cancelado' : 'Pendente'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


function TabFinanceiro({ c }: { c: Cliente }) {
  if (c.history.length === 0 && c.serviceFreq.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-[13px] text-[#94A3B8]">Sem movimentação financeira registrada.</p>
      </div>
    )
  }

  const maxFreq = Math.max(...c.serviceFreq.map((s) => s.totalSpent), 1)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Gasto',  value: `R$ ${c.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Ticket Médio', value: `R$ ${c.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Visitas',      value: c.visitCount.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[#E2E8F0] bg-white p-4">
            <p className="text-[11px] text-[#94A3B8]">{label}</p>
            <p className="mt-1 font-tabular text-[20px] font-bold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      {c.serviceFreq.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-medium text-[#64748B]">Serviços</p>
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
                  <div className="h-full rounded-full bg-[#2563EB] transition-all duration-300 motion-reduce:transition-none"
                    style={{ width: `${(s.totalSpent / maxFreq) * 100}%` }}
                    role="progressbar" aria-valuenow={s.totalSpent} aria-valuemax={maxFreq} aria-label={s.service} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[12px] font-medium text-[#64748B]">Últimos pagamentos</p>
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
  onDelete?: (id: string) => Promise<void>
}

export default function ClienteModal({ cliente, onClose, onDelete }: ClienteModalProps) {
  const [tab, setTab] = useState<Tab>('perfil')
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [profissionais, setProfissionais] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (cliente) { setTab('perfil'); setConfirming(false); setDeleting(false) }
  }, [cliente?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/professionals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((r: unknown) => {
        const list = Array.isArray((r as { data?: unknown }).data)
          ? (r as { data: { id: string; name: string }[] }).data
          : []
        setProfissionais(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!cliente) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [cliente, onClose])

  if (!cliente) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Perfil: ${cliente.name}`}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

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
          {onDelete && (
            confirming ? (
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[12px] text-[#475569]">Excluir?</span>
                <button type="button" disabled={deleting}
                  onClick={async () => { setDeleting(true); try { await onDelete(cliente.id) } finally { setDeleting(false); setConfirming(false) } }}
                  className="rounded-xl bg-[#FEE2E2] px-2.5 py-1.5 text-[12px] font-medium text-[#DC2626] transition-colors hover:bg-[#FECACA] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                  {deleting ? 'Excluindo…' : 'Confirmar'}
                </button>
                <button type="button" disabled={deleting} onClick={() => setConfirming(false)}
                  className="rounded-xl border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} aria-label="Excluir cliente"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#DC2626] hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )
          )}
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6" role="tablist" aria-label="Seções do perfil">
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'border-b-2 px-4 py-3 text-[13px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                  tab === t.id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#94A3B8] hover:text-[#475569]',
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" role="tabpanel">
          {tab === 'perfil'     && <TabPerfil key={cliente.id} c={cliente} profissionais={profissionais} />}
          {tab === 'historico'  && <TabHistorico  c={cliente} />}
          {tab === 'financeiro' && <TabFinanceiro c={cliente} />}
        </div>
      </div>
    </div>
  )
}
