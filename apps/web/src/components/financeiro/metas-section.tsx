'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, Bar, BarChart, Cell, LabelList, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { Plus, X, Pencil, Trash2, Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_METAS_HISTORICO, type MetaHistorico } from '@/lib/financeiro-historico'
import MonthFilter, { CURRENT_MONTH, MONTHS } from './month-filter'
import { FEATURES } from '@/lib/features'
import { relatoriosApi, type GoalRaw, type GoalCreateDto } from '@/lib/api/relatorios'

const MONTH_NUM: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
}
function mesKeyToRange(key: string): { dataInicio: string; dataFim: string } {
  const [mes, ano] = key.split('-')
  const year = 2000 + Number(ano)
  const month = MONTH_NUM[mes] ?? 0
  const from = new Date(year, month, 1)
  const to   = new Date(year, month + 1, 0)
  const fmt  = (d: Date) => d.toISOString().slice(0, 10)
  return { dataInicio: fmt(from), dataFim: fmt(to) }
}

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

type MetaTipo = 'mensal'

interface ModalProps {
  open: boolean
  editingKey: string | null
  metas: MetaHistorico[]
  onClose: () => void
  onSave: (mesKey: string, valor: number, tipo: MetaTipo) => void
}

function diasDoMes(mesKey: string): number {
  const [mes, ano] = mesKey.split('-')
  const year = 2000 + Number(ano)
  const month = MONTH_NUM[mes] ?? 0
  return new Date(year, month + 1, 0).getDate()
}

function MetaModal({ open, editingKey, metas, onClose, onSave }: ModalProps) {
  const editing = editingKey ? (metas.find((m) => m.mesKey === editingKey) ?? null) : null
  const [mesKey, setMesKey]           = useState<string>(CURRENT_MONTH)
  const [valorDiario, setValorDiario] = useState('')

  const dias         = useMemo(() => diasDoMes(mesKey), [mesKey])
  const vDiario      = Number(valorDiario) || 0
  const vSemanal     = vDiario ? Math.round(vDiario * 7) : 0
  const vMensal      = vDiario ? Math.round(vDiario * dias) : 0
  const mesLabel     = MONTHS.find((m) => m.key === mesKey)?.label ?? mesKey

  useEffect(() => {
    if (editing) {
      setMesKey(editing.mesKey)
      setValorDiario(String(Math.round(editing.meta / diasDoMes(editing.mesKey))))
    } else {
      setMesKey(CURRENT_MONTH)
      setValorDiario('')
    }
  }, [open, editingKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const title = editing ? `Editar Meta — ${editing.mes}` : 'Nova Meta'
  const INPUT = cn(
    'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] placeholder:text-[#64748B]',
  )
  const LABEL = 'block text-[12px] font-medium text-[#475569]'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vMensal) return
    onSave(mesKey, vMensal, 'mensal')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">

        {/* Header */}
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

          {/* Mês */}
          <div className="space-y-1.5">
            <label htmlFor="mm-mes" className={LABEL}>Mês de referência</label>
            <select id="mm-mes" value={mesKey} onChange={(e) => setMesKey(e.target.value)}
              disabled={!!editing}
              className={cn(INPUT, editing && 'cursor-not-allowed opacity-60')}>
              {MONTHS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>

          {/* Meta diária */}
          <div className="space-y-1.5">
            <label htmlFor="mm-diario" className={LABEL}>Meta diária (R$)</label>
            <input
              id="mm-diario"
              type="number"
              min="1"
              step="1"
              required
              autoFocus
              placeholder="Ex.: 1.000"
              value={valorDiario}
              onChange={(e) => setValorDiario(e.target.value)}
              className={INPUT}
            />
          </div>

          {/* Preview */}
          {vDiario > 0 && (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Prévia — {mesLabel}</p>
              <div className="space-y-1.5">
                {([
                  { label: 'Diária',  value: vDiario,  note: 'base'                    },
                  { label: 'Semanal', value: vSemanal,  note: '× 7 dias'               },
                  { label: 'Mensal',  value: vMensal,   note: `× ${dias} dias`         },
                ] as const).map(({ label, value, note }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#475569]">
                      {label} <span className="text-[#94A3B8]">({note})</span>
                    </span>
                    <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                      {fmtBRL(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Cancelar
            </button>
            <button type="submit" disabled={!vMensal}
              className="flex-1 rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
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
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [mounted, setMounted]             = useState(false)
  const [metas, setMetas]                 = useState<MetaHistorico[]>(FEATURES.realRelatorios ? [] : MOCK_METAS_HISTORICO)
  const [goalsLoading, setGoalsLoading]   = useState(FEATURES.realRelatorios)
  const [goalIdMap, setGoalIdMap]         = useState<Map<string, string>>(new Map())
  const [modal, setModal]                 = useState<{ open: boolean; editingKey: string | null }>({ open: false, editingKey: null })
  const [deleteKey, setDeleteKey]         = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const loadRealMetas = useCallback(async () => {
    setGoalsLoading(true)
    try {
      const rawGoals = (await relatoriosApi.goals()) as GoalRaw[]
      const monthly  = rawGoals.filter((g) => g.tipo === 'mensal')
      const cfResults = await Promise.all(
        monthly.map((g) => {
          const { dataInicio, dataFim } = mesKeyToRange(g.periodo)
          return relatoriosApi.cashflow({ from: dataInicio, to: dataFim })
            .then((res) => {
              const entries = (res as { entries?: { entradas?: number }[] })?.entries ?? []
              return { periodo: g.periodo, total: entries.reduce((s, e) => s + Number(e.entradas ?? 0), 0) }
            })
            .catch(() => ({ periodo: g.periodo, total: 0 }))
        }),
      )
      const realizadoMap = new Map(cfResults.map((r) => [r.periodo, r.total]))
      const newIdMap     = new Map<string, string>()
      const order        = (k: string) => MONTHS.findIndex((m) => m.key === k)
      const built: MetaHistorico[] = monthly
        .map((g) => {
          newIdMap.set(g.periodo, g.id)
          const info     = MONTHS.find((m) => m.key === g.periodo)
          const meta     = Number(g.valor)
          const realizado = realizadoMap.get(g.periodo) ?? 0
          return { mesKey: g.periodo, mes: info?.label ?? g.periodo, meta, realizado, pct: meta > 0 ? Math.round((realizado / meta) * 100) : 0 }
        })
        .sort((a, b) => order(a.mesKey) - order(b.mesKey))
      setGoalIdMap(newIdMap)
      setMetas(built)
    } catch { /* noop */ }
    finally { setGoalsLoading(false) }
  }, [])

  useEffect(() => { if (FEATURES.realRelatorios) loadRealMetas() }, [loadRealMetas])

  function openEdit(mesKey: string) { setModal({ open: true, editingKey: mesKey }) }
  function closeModal() { setModal({ open: false, editingKey: null }) }

  async function handleSave(mesKey: string, valor: number, tipo: MetaTipo) {
    if (FEATURES.realRelatorios) {
      const existingId = goalIdMap.get(mesKey)
      if (existingId) await relatoriosApi.deleteGoal(existingId).catch(() => null)
      const { dataInicio, dataFim } = mesKeyToRange(mesKey)
      const dto: GoalCreateDto = { tipo, periodo: mesKey, valor, dataInicio, dataFim }
      await relatoriosApi.createGoal(dto).catch(() => null)
      await loadRealMetas()
      return
    }
    setMetas((prev) => {
      const idx = prev.findIndex((m) => m.mesKey === mesKey)
      if (idx >= 0) {
        const m = prev[idx]
        return prev.map((x, i) => i === idx ? { ...m, meta: valor, pct: Math.round((m.realizado / valor) * 100) } : x)
      }
      const info  = MONTHS.find((m) => m.key === mesKey)!
      const order = (k: string) => MONTHS.findIndex((m) => m.key === k)
      return [...prev, { mesKey, mes: info.label, meta: valor, realizado: 0, pct: 0 }]
        .sort((a, b) => order(a.mesKey) - order(b.mesKey))
    })
  }

  async function handleDelete(mesKey: string) {
    if (FEATURES.realRelatorios) {
      const id = goalIdMap.get(mesKey)
      if (id) await relatoriosApi.deleteGoal(id).catch(() => null)
      setDeleteKey(null)
      if (selectedMonth === mesKey) setSelectedMonth(CURRENT_MONTH)
      await loadRealMetas()
      return
    }
    setMetas((prev) => prev.filter((m) => m.mesKey !== mesKey))
    setDeleteKey(null)
    if (selectedMonth === mesKey) setSelectedMonth(CURRENT_MONTH)
  }

  const selected  = metas.find((m) => m.mesKey === selectedMonth) ?? metas.at(-1)
  const chartData = useMemo(() => metas.map((m) => ({ mes: m.mes, Realizado: m.realizado, Meta: m.meta })), [metas])
  const lineData  = useMemo(() => metas.map((m) => ({ mes: m.mes, pct: m.pct })), [metas])

  if (!mounted || (FEATURES.realRelatorios && goalsLoading)) {
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

      {/* Taxa de Atingimento — BarChart com cores condicionais */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Taxa de Atingimento</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">% da meta mensal alcançado</p>
        </div>
        <div className="px-4 pb-4 pt-5">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={lineData} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v: number) => `${v}%`} domain={[0, Math.max(120, ...lineData.map((d) => d.pct + 10))]} />
              <Tooltip content={<PctTooltip />} />
              <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: '100%', position: 'insideRight', fontSize: 10, fill: '#16A34A' }} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={52} isAnimationActive={false}>
                <LabelList dataKey="pct" position="top" fontSize={11} fill="#475569"
                  formatter={(v: unknown) => (v != null ? `${v}%` : '')} />
                {lineData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.pct >= 100 ? '#16A34A' : entry.pct >= 80 ? '#2563EB' : '#DC2626'}
                    fillOpacity={entry.pct === 0 ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
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
