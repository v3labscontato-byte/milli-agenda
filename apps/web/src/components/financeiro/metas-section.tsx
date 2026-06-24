'use client'

import { useState } from 'react'
import { Plus, X, Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_METAS, type Meta, type MetaTipo } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

type MetaStatus = 'atingida' | 'andamento' | 'nao_atingida'

function metaStatus(m: Meta): MetaStatus {
  if (m.atual >= m.valor) return 'atingida'
  const now = new Date()
  const fim = new Date(m.dataFim + 'T23:59:59')
  if (now > fim) return 'nao_atingida'
  return 'andamento'
}

function diasRestantes(m: Meta): number {
  const now = new Date(); now.setHours(0,0,0,0)
  const fim = new Date(m.dataFim + 'T00:00:00')
  const diff = Math.ceil((fim.getTime() - now.getTime()) / 86400000)
  return Math.max(diff, 0)
}

const STATUS_STYLE = {
  atingida:     { bar: 'bg-[#16A34A]', text: 'text-[#16A34A]', badge: 'bg-[#F0FDF4] text-[#16A34A]', label: 'Atingida'     },
  andamento:    { bar: 'bg-[#2563EB]', text: 'text-[#2563EB]', badge: 'bg-[#EFF6FF] text-[#2563EB]', label: 'Em andamento' },
  nao_atingida: { bar: 'bg-[#EF4444]', text: 'text-[#DC2626]', badge: 'bg-[#FEF2F2] text-[#DC2626]', label: 'Não atingida' },
}

const TIPO_LABEL: Record<MetaTipo, string> = { diaria: 'Diária', semanal: 'Semanal', mensal: 'Mensal' }

// ─── Dashboard summary card (exported for use in main view) ──────────────────

export function MetaDashboardCard({ meta }: { meta: Meta }) {
  const s = metaStatus(meta)
  const style = STATUS_STYLE[s]
  const pct = Math.min(Math.round((meta.atual / meta.valor) * 100), 100)
  const faltam = Math.max(meta.valor - meta.atual, 0)
  const dias = diasRestantes(meta)
  const porDia = dias > 0 ? Math.ceil(faltam / dias) : 0

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
            <Target size={14} className="text-[#2563EB]" aria-hidden="true" />
          </div>
          <p className="text-[13px] font-semibold text-[#0F172A]">Meta {TIPO_LABEL[meta.tipo]}</p>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', style.badge)}>{style.label}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn('font-tabular text-[22px] font-bold', style.text)}>{fmtBRL(meta.atual)}</span>
        <span className="text-[13px] text-[#94A3B8]">/ {fmtBRL(meta.valor)}</span>
      </div>

      <div className="mt-2.5">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]" aria-label={`${pct}% da meta`}>
          <div className={cn('h-full rounded-full transition-all motion-reduce:transition-none', style.bar)}
            style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-right text-[11px] font-medium text-[#475569]">{pct}%</p>
      </div>

      {s === 'andamento' && (
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#475569]">
          {faltam > 0 && <span>Faltam <strong className="text-[#0F172A]">{fmtBRL(faltam)}</strong></span>}
          {porDia > 0 && <span>· Nec. <strong className="text-[#0F172A]">{fmtBRL(porDia)}/dia</strong></span>}
          {dias > 0   && <span>· {dias}d restantes</span>}
        </div>
      )}
      {s === 'atingida' && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
          <CheckCircle2 size={12} aria-hidden="true" /> Meta alcançada!
        </p>
      )}
    </div>
  )
}

// ─── Nova Meta Modal ──────────────────────────────────────────────────────────

interface NovaMetaModalProps {
  open: boolean
  onClose: () => void
  onSave: (m: Omit<Meta, 'id' | 'atual'>) => void
}

const EMPTY_FORM = { tipo: 'semanal' as MetaTipo, valor: '', dataInicio: '', dataFim: '', ativa: true }

function NovaMetaModal({ open, onClose, onSave }: NovaMetaModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valor = Number(form.valor)
    if (!valor || !form.dataInicio || !form.dataFim) return
    onSave({ tipo: form.tipo, valor, dataInicio: form.dataInicio, dataFim: form.dataFim, ativa: form.ativa })
    setForm(EMPTY_FORM)
    onClose()
  }

  const INPUT = cn('w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] placeholder:text-[#64748B]')
  const LABEL = 'text-[12px] font-medium text-[#475569]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Nova meta">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Target size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Nova Meta</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="nm-tipo" className={LABEL}>Tipo</label>
            <select id="nm-tipo" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as MetaTipo }))} className={INPUT}>
              <option value="diaria">Diária</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nm-valor" className={LABEL}>Valor da meta (R$)</label>
            <input id="nm-valor" type="number" min="1" step="100" required placeholder="Ex.: 4000"
              value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="nm-inicio" className={LABEL}>Início</label>
              <input id="nm-inicio" type="date" required value={form.dataInicio}
                onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nm-fim" className={LABEL}>Fim</label>
              <input id="nm-fim" type="date" required value={form.dataFim}
                onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))} className={INPUT} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
            <span className="text-[13px] font-medium text-[#0F172A]">Meta ativa</span>
            <button type="button" role="switch" aria-checked={form.ativa}
              onClick={() => setForm((f) => ({ ...f, ativa: !f.ativa }))}
              className={cn('relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                form.ativa ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
              <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                form.ativa ? 'translate-x-4' : 'translate-x-0.5')} />
            </button>
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Metas Section (full tab) ─────────────────────────────────────────────────

export default function MetasSection() {
  const [metas, setMetas] = useState<Meta[]>(MOCK_METAS)
  const [modalOpen, setModalOpen] = useState(false)

  function handleSave(data: Omit<Meta, 'id' | 'atual'>) {
    setMetas((prev) => [...prev, { ...data, id: `m-${Date.now()}`, atual: 0 }])
  }

  function toggleAtiva(id: string) {
    setMetas((prev) => prev.map((m) => m.id === id ? { ...m, ativa: !m.ativa } : m))
  }

  const ativas = metas.filter((m) => m.ativa)
  const inativas = metas.filter((m) => !m.ativa)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Metas Cadastradas</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{ativas.length} ativas · {inativas.length} inativas</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-[#2563EB] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
          <Plus size={13} aria-hidden="true" /> Nova Meta
        </button>
      </div>

      {metas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E2E8F0] py-16 text-center">
          <Target size={32} className="mx-auto text-[#CBD5E1]" aria-hidden="true" />
          <p className="mt-3 text-[13px] text-[#64748B]">Nenhuma meta cadastrada.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metas.map((m) => {
            const s = metaStatus(m)
            const style = STATUS_STYLE[s]
            const pct = Math.min(Math.round((m.atual / m.valor) * 100), 100)
            const StatusIcon = s === 'atingida' ? CheckCircle2 : s === 'nao_atingida' ? AlertCircle : TrendingUp
            return (
              <div key={m.id} className={cn('rounded-lg border bg-white p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]',
                m.ativa ? 'border-[#E2E8F0]' : 'border-[#F1F5F9] opacity-60')}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wide', style.text)}>
                      {TIPO_LABEL[m.tipo]}
                    </span>
                    <p className="mt-0.5 font-tabular text-[18px] font-bold text-[#0F172A]">{fmtBRL(m.valor)}</p>
                  </div>
                  <button type="button" role="switch" aria-checked={m.ativa} onClick={() => toggleAtiva(m.id)}
                    aria-label={m.ativa ? 'Desativar meta' : 'Ativar meta'}
                    className={cn('relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      m.ativa ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                      m.ativa ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>{fmtBRL(m.atual)} atual</span><span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                    <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                  <StatusIcon size={11} className={style.text} aria-hidden="true" />
                  <span className={style.text}>{style.label}</span>
                  <span className="ml-auto text-[#94A3B8]">
                    {m.dataInicio.split('-').reverse().join('/')} → {m.dataFim.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NovaMetaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
