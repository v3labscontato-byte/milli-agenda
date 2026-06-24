'use client'

import { memo, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comissao } from '@/lib/financeiro-mock'

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
      <CheckCircle2 size={11} aria-hidden="true" />Pago{c.paidAt ? ` ${c.paidAt}` : ''}
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

function EmptyState() {
  return (
    <tr><td colSpan={8} className="py-12 text-center text-[13px] text-[#64748B]">
      Nenhuma comissão registrada.
    </td></tr>
  )
}

interface ComissoesTableProps {
  comissoes: Comissao[]
  onMarkPaid: (id: string) => void
}

function ComissoesTable({ comissoes, onMarkPaid }: ComissoesTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const totalPending = comissoes.filter((c) => c.status === 'PENDING').reduce((s, c) => s + c.comissaoValue, 0)
  const totalPaid    = comissoes.filter((c) => c.status === 'PAID').reduce((s, c) => s + c.comissaoValue, 0)

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Comissões do Período</h3>
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px]" aria-label="Tabela de comissões">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {['Profissional','Comissão','Tipo / Período','Vencimento','Status','Pago em','Ação'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comissoes.length === 0 ? <EmptyState /> : comissoes.map((c, i) => (
              <tr key={c.id} className={cn('group', i < comissoes.length - 1 && 'border-b border-[#F1F5F9]', c.status === 'PAID' && 'opacity-75')}>

                {/* Profissional */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={c.initials} bg={c.avatarBg} />
                    <div>
                      <p className="text-[13px] font-medium text-[#0F172A]">{c.profissionalName}</p>
                      <p className="text-[11px] text-[#64748B]">{c.atendimentos} atend. · {c.pctComissao}%</p>
                    </div>
                  </div>
                </td>

                {/* Comissão */}
                <td className="px-4 py-3.5">
                  <p className="font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(c.comissaoValue)}</p>
                  <p className="text-[11px] text-[#64748B]">de {fmtBRL(c.receita)}</p>
                </td>

                {/* Tipo / Período */}
                <td className="px-4 py-3.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
                    c.tipoPagamento === 'mensal' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F5F3FF] text-[#7C3AED]')}>
                    {c.tipoPagamento === 'mensal' ? 'Mensal' : 'Quinzenal'}
                  </span>
                  <p className="mt-1 text-[11px] text-[#64748B]">{c.periodoRef}</p>
                </td>

                {/* Vencimento */}
                <td className="px-4 py-3.5 text-[12px] text-[#475569]">{vencimentoLabel(c)}</td>

                {/* Status */}
                <td className="px-4 py-3.5"><StatusBadge c={c} /></td>

                {/* Pago em */}
                <td className="px-4 py-3.5 font-tabular text-[12px] text-[#475569]">
                  {c.paidAt ?? '—'}
                </td>

                {/* Ação */}
                <td className="px-4 py-3.5">
                  {c.status === 'PENDING' && (
                    confirmId === c.id ? (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => { onMarkPaid(c.id); setConfirmId(null) }}
                          className="rounded-sm bg-[#16A34A] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]">
                          Confirmar
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)}
                          className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] hover:border-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmId(c.id)}
                        className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] opacity-0 transition-all group-hover:opacity-100 hover:border-[#16A34A] hover:text-[#16A34A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]">
                        Marcar Pago
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(ComissoesTable)
