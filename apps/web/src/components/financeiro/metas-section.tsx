'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, Bar, Line, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { Plus, X, Pencil, Trash2, Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_METAS_HISTORICO, type MetaHistorico } from '@/lib/financeiro-historico'
import MonthFilter, { CURRENT_MONTH, MONTHS } from './month-filter'
import { FEATURES } from '@/lib/features'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function MetaTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  const realizado = payload.find((p) => p.name === 'Realizado')?.value ?? 0
  const meta      = payload.find((p) => p.name === 'Meta')?.value      ?? 0
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[11px] text-[#2563EB]">Realizado: {fmtBRL(realizado)}</p>
      <p className="text-[11px] text-[#F59E0B]">Meta: {fmtBRL(meta)}</p>
    </div>
  )
}

function PctTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-semibold text-[#0F172A]">{label}</p>
      <p className="text-[11px] font-semibold text-[#7C3AED]">{payload[0].value}% atingido</p>
    </div>
  )
}

function StatusChip({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">Atingida</span>
  if (pct >= 80)  return <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">Em andamento</span>
  return <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">Abaixo da meta</span>
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

type MetaTipo = 'diaria' | 'semanal' | 'mensal'
const TIPO_LABELS: Record<MetaTipo, string> = { diaria: 'Diária', semanal: 'Semanal', mensal: 'Mensal' }

interface ModalProps {
  open: boolean
  editingKey: string | null
  metas: MetaHistorico[]
  onClose: () => void
  onSave: (mesKey: string, valor: number) => void
}

function MetaModal({ open, editingKey, metas, onClose, onSave }: ModalProps) {
  const editing = editingKey ? (metas.find((m) => m.mesKey === editingKey) ?? null) : null
  const [tipo, setTipo]     = useState<MetaTipo>('mensal')
  const [mesKey, setMesKey] = useState<string>(CURRENT_MONTH)
  const [valor, setValor]   = useState('')

  useEffect(() => {
    if (editing) { setTipo('mensal'); setMesKey(editing.mesKey); setValor(String(editing.meta)) }
    else         { setTipo('mensal'); setMesKey(CURRENT_MONTH);  setValor('') }
  }, [open, editingKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const title = editing ? `Editar Meta — ${editing.mes}` : 'Nova Meta'
  const INPUT = cn('w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] placeholder:text-[#64748B]')
  const LABEL = 'block text-[12px] font-medium text-[#475569]'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = Number(valor)
    if (!v) return
    onSave(mesKey, v)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Target size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <span className={LABEL}>Tipo de meta</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Tipo">
              {(['diaria','semanal','mensal'] as const).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tipo === t} onClick={() => setTipo(t)}
                  className={cn('flex-1 rounded-md border py-2 text-[12px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    tipo === t ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
                  {TIPO_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mm-mes" className={LABEL}>Mês de referência</label>
            <select id="mm-mes" value={mesKey} onChange={(e) => setMesKey(e.target.value)}
              disabled={!!editing}
              className={cn(INPUT, editing && 'cursor-not-allowed opacity-60')}>
              {MONTHS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mm-valor" className={LABEL}>Valor da meta (R$)</label>
            <input id="mm-valor" type="number" min="1" step="100" required placeholder="Ex.: 15000"
              value={valor} onChange={(e) => setValor(e.target.value)} className={INPUT} />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Salvar Meta ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function MetasSection() {
  // TODO: conectar endpoint /reports/goals (tabela Goal no banco) quando disponível
  if (FEATURES.realRelatorios) return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center text-[#94A3B8]">
      <p className="text-[13px] font-medium text-[#475569]">Metas Financeiras em breve</p>
      <p className="mt-1 text-[12px]">Defina e acompanhe suas metas de faturamento aqui.</p>
    </div>
  )
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [mounted, setMounted] = useState(false)
  const [metas, setMetas]     = useState<MetaHistorico[]>(MOCK_METAS_HISTORICO)
  const [modal, setModal]     = useState<{ open: boolean; editingKey: string | null }>({ open: false, editingKey: null })
  const [deleteKey, setDeleteKey] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  function openEdit(mesKey: string) { setModal({ open: true, editingKey: mesKey }) }
  function closeModal() { setModal({ open: false, editingKey: null }) }

  function handleSave(mesKey: string, valor: number) {
    setMetas((prev) => {
      const idx = prev.findIndex((m) => m.mesKey === mesKey)
      if (idx >= 0) {
        const m = prev[idx]
        return prev.map((x, i) => i === idx ? { ...m, meta: valor, pct: Math.round((m.realizado / valor) * 100) } : x)
      }
      const info = MONTHS.find((m) => m.key === mesKey)!
      const order = (k: string) => MONTHS.findIndex((m) => m.key === k)
      return [...prev, { mesKey, mes: info.label, meta: valor, realizado: 0, pct: 0 }]
        .sort((a, b) => order(a.mesKey) - order(b.mesKey))
    })
  }

  function handleDelete(mesKey: string) {
    setMetas((prev) => prev.filter((m) => m.mesKey !== mesKey))
    setDeleteKey(null)
    if (selectedMonth === mesKey) setSelectedMonth(CURRENT_MONTH)
  }

  const selected  = metas.find((m) => m.mesKey === selectedMonth) ?? metas.at(-1)
  const chartData = useMemo(() => metas.map((m) => ({ mes: m.mes, Realizado: m.realizado, Meta: m.meta })), [metas])
  const lineData  = useMemo(() => metas.map((m) => ({ mes: m.mes, pct: m.pct })), [metas])

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-8 w-72 animate-pulse rounded-md bg-[#F1F5F9]" />
        {[1,2,3].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-[#F1F5F9]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Metas &amp; Evolução</h3>
        <button type="button" onClick={() => setModal({ open: true, editingKey: null })}
          className="flex items-center gap-2 rounded-md bg-[#2563EB] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
          <Plus size={13} aria-hidden="true" /> Nova Meta
        </button>
      </div>

      <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />

      {/* Realizado vs Meta chart */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Realizado vs Meta</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">Evolução jan–jun/26</p>
        </div>
        <div className="px-4 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={52}
                tickFormatter={(v: number) => `R$${Math.round(v / 1000)}k`} />
              <Tooltip content={<MetaTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="Realizado" fill="#2563EB" radius={[3,3,0,0]} maxBarSize={52} isAnimationActive={false} />
              <Line dataKey="Meta" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* % Atingimento chart */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Taxa de Atingimento</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">% da meta mensal alcançado</p>
        </div>
        <div className="px-4 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={lineData} margin={{ top: 4, right: 28, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v: number) => `${v}%`} domain={[0, 120]} />
              <Tooltip content={<PctTooltip />} />
              <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: '100%', position: 'insideRight', fontSize: 10, fill: '#16A34A' }} />
              <Line dataKey="pct" stroke="#7C3AED" strokeWidth={2}
                dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                activeDot={{ r: 5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI cards */}
      {selected && (
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            { label:'Meta',          value:fmtBRL(selected.meta),     icon:Target,      color:'text-[#F59E0B]', bg:'bg-[#FFFBEB]'  },
            { label:'Realizado',     value:fmtBRL(selected.realizado), icon:TrendingUp,  color:'text-[#2563EB]', bg:'bg-[#EFF6FF]'  },
            {
              label: '% Atingimento',
              value: `${selected.pct}%`,
              icon:  selected.pct >= 100 ? CheckCircle2 : AlertCircle,
              color: selected.pct >= 100 ? 'text-[#16A34A]' : selected.pct >= 80 ? 'text-[#2563EB]' : 'text-[#DC2626]',
              bg:    selected.pct >= 100 ? 'bg-[#F0FDF4]'   : selected.pct >= 80 ? 'bg-[#EFF6FF]'   : 'bg-[#FEF2F2]',
            },
          ] as const).map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', bg)}>
                  <Icon size={14} className={color} aria-hidden="true" />
                </div>
                <p className="text-[12px] text-[#475569]">{label}</p>
              </div>
              <p className={cn('mt-3 font-tabular text-[22px] font-bold', color)}>{value}</p>
              <p className="mt-1 text-[11px] text-[#94A3B8]">{selected.mes}</p>
            </div>
          ))}
        </div>
      )}

      {/* Histórico table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Histórico Mensal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]" aria-label="Histórico de metas">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Mês','Meta','Realizado','% Ating.','Status','Ações'].map((h) => (
                  <th key={h} className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                    ['Meta','Realizado','% Ating.'].includes(h) ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metas.map((m, i) => (
                <tr key={m.mesKey}
                  className={cn('transition-colors hover:bg-[#F8FAFC]',
                    i < metas.length - 1 && 'border-b border-[#F1F5F9]',
                    m.mesKey === selectedMonth && 'bg-[#EFF6FF]')}>
                  <td className="px-5 py-3 text-[13px] font-medium text-[#0F172A]">{m.mes}</td>
                  <td className="px-5 py-3 text-right font-tabular text-[12px] text-[#475569]">{fmtBRL(m.meta)}</td>
                  <td className="px-5 py-3 text-right font-tabular text-[12px] font-semibold text-[#0F172A]">{fmtBRL(m.realizado)}</td>
                  <td className={cn('px-5 py-3 text-right font-tabular text-[12px] font-bold',
                    m.pct >= 100 ? 'text-[#16A34A]' : m.pct >= 80 ? 'text-[#2563EB]' : 'text-[#DC2626]')}>{m.pct}%</td>
                  <td className="px-5 py-3"><StatusChip pct={m.pct} /></td>
                  <td className="px-5 py-3">
                    {deleteKey === m.mesKey ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#DC2626]">Remover {m.mes}?</span>
                        <button type="button" onClick={() => handleDelete(m.mesKey)}
                          className="rounded-sm bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FECACA]">
                          Sim
                        </button>
                        <button type="button" onClick={() => setDeleteKey(null)}
                          className="rounded-sm bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#475569] hover:bg-[#E2E8F0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CBD5E1]">
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [tr:hover_&]:opacity-100">
                        <button type="button" onClick={() => openEdit(m.mesKey)} aria-label={`Editar meta de ${m.mes}`}
                          className="rounded-sm p-1 text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DBEAFE]">
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setDeleteKey(m.mesKey)} aria-label={`Remover meta de ${m.mes}`}
                          className="rounded-sm p-1 text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FECACA]">
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {metas.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-[13px] text-[#94A3B8]">Nenhuma meta cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MetaModal
        open={modal.open}
        editingKey={modal.editingKey}
        metas={metas}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  )
}
