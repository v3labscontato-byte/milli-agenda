'use client'

import { memo, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comissao } from '@/lib/financeiro-mock'

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials, bg }: { initials: string; bg: string }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]" aria-hidden="true">
      <div
        className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <p className="text-[13px] text-[#64748B]">Nenhuma comissão registrada para o período.</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      {/* Header */}
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

      {comissoes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]" aria-label="Tabela de comissões">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Profissional</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Atend.</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Receita</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">% Comissão</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Comissão</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Ação</th>
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c, i) => (
                <tr
                  key={c.id}
                  className={cn(
                    'group',
                    i < comissoes.length - 1 && 'border-b border-[#F1F5F9]',
                    c.status === 'PAID' && 'opacity-75',
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.initials} bg={c.avatarBg} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#0F172A]">{c.profissionalName}</p>
                        <div className="mt-1 w-24">
                          <ProgressBar pct={(c.comissaoValue / 2000) * 100} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-tabular text-[13px] text-[#475569]">{c.atendimentos}</td>
                  <td className="px-4 py-3.5 text-right font-tabular text-[13px] text-[#475569]">{fmtBRL(c.receita)}</td>
                  <td className="px-4 py-3.5 text-center font-tabular text-[13px] text-[#475569]">{c.pctComissao}%</td>
                  <td className="px-4 py-3.5 text-right font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(c.comissaoValue)}</td>
                  <td className="px-5 py-3.5">
                    {c.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
                        <CheckCircle2 size={12} aria-hidden="true" />
                        Pago{c.paidAt ? ` ${c.paidAt}` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D97706]">
                        <Clock size={12} aria-hidden="true" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.status === 'PENDING' && (
                      confirmId === c.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { onMarkPaid(c.id); setConfirmId(null) }}
                            className="rounded-sm bg-[#16A34A] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] transition-colors hover:border-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(c.id)}
                          className="rounded-sm border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569] opacity-0 transition-all group-hover:opacity-100 hover:border-[#16A34A] hover:text-[#16A34A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]"
                        >
                          Marcar como Pago
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
  )
}

export default memo(ComissoesTable)
