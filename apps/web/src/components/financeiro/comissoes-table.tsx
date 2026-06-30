'use client'

import { memo, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMISSAO_HISTORICO, type Comissao } from '@/lib/financeiro-mock'
import { FEATURES } from '@/lib/features'
import type { CommissionRow } from '@/hooks/use-relatorios'
import { relatoriosApi } from '@/lib/api/relatorios'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function Avatar({ initials, bg }: { initials: string; bg: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ backgroundColor: bg }} aria-hidden="true">{initials}</span>
  )
}

type DisplayStatus = 'pago' | 'pendente' | 'atrasado'

function getDisplayStatus(c: Comissao): DisplayStatus {
  if (c.status === 'PAID') return 'pago'
  if (c.diasAtraso > 0) return 'atrasado'
  return 'pendente'
}

function StatusBadge({ c }: { c: Comissao }) {
  const s = getDisplayStatus(c)
  if (s === 'pago') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
      <CheckCircle2 size={11} aria-hidden="true" />Pago
    </span>
  )
  if (s === 'atrasado') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-medium text-[#DC2626]">
      <AlertCircle size={11} aria-hidden="true" />Atrasado · {c.diasAtraso}d
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
      <Clock size={11} aria-hidden="true" />Pendente
    </span>
  )
}

function vencimentoLabel(c: Comissao): string {
  if (c.tipoPagamento === 'mensal') return `Dia ${String(c.diaPagamento).padStart(2,'0')}`
  const d2 = c.diaPagamento + 15
  return `Dias ${String(c.diaPagamento).padStart(2,'0')} e ${String(d2).padStart(2,'0')}`
}

const MONTH_PILLS = [
  { key:'jan-26', label:'Jan/26' }, { key:'fev-26', label:'Fev/26' },
  { key:'mar-26', label:'Mar/26' }, { key:'abr-26', label:'Abr/26' },
  { key:'mai-26', label:'Mai/26' }, { key:'jun-26', label:'Jun/26' },
]

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '—'
}

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#DB2777', '#16A34A', '#D97706', '#0891B2']

function toComissao(row: CommissionRow, i: number, paidOverride?: Set<string>): Comissao {
  const isPaid = paidOverride?.has(row.professionalId) || row.status === 'PAID'
  return {
    id: row.professionalId || `c-${i}`,
    profissionalName: row.name,
    initials: initialsOf(row.name),
    avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
    atendimentos: row.atendimentos,
    receita: row.receita,
    pctComissao: row.pctComissao,
    comissaoValue: row.comissaoValue,
    tipoPagamento: 'mensal',
    diaPagamento: 5,
    periodoRef: row.periodoRef,
    diasAtraso: 0,
    status: isPaid ? 'PAID' : 'PENDING',
    paidAt: isPaid
      ? (row.paidAt ? new Date(row.paidAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
      : undefined,
  }
}

interface ComissoesTableProps {
  realData?: CommissionRow[]
  loading?: boolean
  error?: string | null
}

function ComissoesTable({ realData, loading, error }: ComissoesTableProps) {
  const [selectedMes, setSelectedMes] = useState('jun-26')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [localData, setLocalData] = useState<Record<string, Comissao[]>>(COMISSAO_HISTORICO)
  const [paidOverride, setPaidOverride] = useState<Set<string>>(new Set())
  const [payingId, setPayingId] = useState<string | null>(null)

  const real = FEATURES.realRelatorios

  if (real && error) {
    return <div className="text-sm text-red-500 p-4">Erro ao carregar. Tente novamente.</div>
  }

  const comissoes = real
    ? (realData ?? []).map((r, i) => toComissao(r, i, paidOverride))
    : (localData[selectedMes] ?? [])

  function handleMarkPaid(id: string) {
    setLocalData((prev) => ({
      ...prev,
      [selectedMes]: (prev[selectedMes] ?? []).map((c) =>
        c.id === id
          ? { ...c, status: 'PAID' as const, paidAt: new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }) }
          : c,
      ),
    }))
  }

  async function handlePayReal(professionalId: string, periodoRef: string, comissaoValue: number) {
    setPayingId(professionalId)
    try {
      await relatoriosApi.payCommission(professionalId, { period: periodoRef, amount: comissaoValue })
      setPaidOverride((prev) => new Set(Array.from(prev).concat(professionalId)))
    } finally {
      setPayingId(null)
      setConfirmId(null)
    }
  }

  const totalPending = comissoes.filter((c) => c.status === 'PENDING').reduce((s, c) => s + c.comissaoValue, 0)
  const totalPaid    = comissoes.filter((c) => c.status === 'PAID').reduce((s, c) => s + c.comissaoValue, 0)

  return (
    <div className="space-y-4">
      {/* Month filter pills (mock mode only; real mode uses the page period filter) */}
      {!real && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar mês de referência">
          {MONTH_PILLS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => { setSelectedMes(key); setConfirmId(null) }} aria-pressed={selectedMes === key}
              className={cn('rounded-full border px-3 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                selectedMes === key ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
              {label}{key === 'jun-26' ? ' ●' : ''}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#0F172A]">{real ? 'Comissões' : `Comissões — ${MONTH_PILLS.find((m) => m.key === selectedMes)?.label}`}</h3>
            <p className="mt-0.5 text-[12px] text-[#475569]">{comissoes.length} profissionais</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[11px] text-[#64748B]">A pagar</p>
              <p className="font-tabular text-[14px] font-bold text-[#DC2626]">{fmtBRL(totalPending)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#64748B]">Pago</p>
              <p className="font-tabular text-[14px] font-bold text-[#16A34A]">{fmtBRL(totalPaid)}</p>
            </div>
          </div>
        </div>

        {real && loading ? (
          <p className="py-12 text-center text-[13px] text-[#94A3B8]">Carregando…</p>
        ) : comissoes.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-[#94A3B8]">{real ? 'Nenhuma comissão no período selecionado.' : 'Nenhuma comissão registrada para este mês.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]" aria-label="Tabela de comissões">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {['Profissional','Mês Ref.','Receita Bruta','%','Comissão','Tipo/Período','Vencimento','Status','Pago em','Ação'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comissoes.map((c, i) => (
                  <tr key={c.id} className={cn('group', i < comissoes.length - 1 && 'border-b border-[#F1F5F9]', c.status === 'PAID' && 'opacity-75')}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.initials} bg={c.avatarBg} />
                        <p className="text-[13px] font-medium text-[#0F172A]">{c.profissionalName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#475569]">{c.periodoRef}</td>
                    <td className="px-4 py-3.5 font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(c.receita)}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">{c.pctComissao}%</span>
                    </td>
                    <td className="px-4 py-3.5 font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(c.comissaoValue)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
                        c.tipoPagamento === 'mensal' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F5F3FF] text-[#7C3AED]')}>
                        {c.tipoPagamento === 'mensal' ? 'Mensal' : 'Quinzenal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#475569]">{vencimentoLabel(c)}</td>
                    <td className="px-4 py-3.5"><StatusBadge c={c} /></td>
                    <td className="px-4 py-3.5 font-tabular text-[12px] text-[#475569]">{c.paidAt ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      {c.status === 'PENDING' && (
                        confirmId === c.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={payingId === c.id}
                              onClick={() => real
                                ? handlePayReal(c.id, c.periodoRef, c.comissaoValue)
                                : (handleMarkPaid(c.id), setConfirmId(null))
                              }
                              className="rounded-sm bg-[#16A34A] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#15803D] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]">
                              {payingId === c.id ? 'Salvando…' : 'Confirmar'}
                            </button>
                            <button type="button" onClick={() => setConfirmId(null)}
                              className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setConfirmId(c.id)}
                            className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] opacity-0 transition-all group-hover:opacity-100 hover:border-[#16A34A] hover:text-[#16A34A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]">
                            {real ? 'Dar baixa' : 'Marcar Pago'}
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ComissoesTable)
