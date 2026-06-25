'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { txDateLabel, type Transaction, type TransactionStatus } from '@/lib/financeiro-mock'
import { MOCK_TRANSACTIONS_HISTORICO } from '@/lib/financeiro-historico'
import MonthFilter, { CURRENT_MONTH } from './month-filter'
import { FEATURES } from '@/lib/features'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'date' | 'clientName' | 'method' | 'value' | 'status'
type SortDir = 'asc' | 'desc'

const METHOD_LABELS: Record<string, string> = {
  pix:      'PIX',
  credito:  'Crédito',
  debito:   'Débito',
  dinheiro: 'Dinheiro',
  voucher:  'Voucher',
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PAID:    'Pago',
  PENDING: 'Pendente',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function toCSV(rows: Transaction[]): string {
  const header = ['Data', 'Cliente', 'Serviço', 'Profissional', 'Método', 'Valor', 'Status']
  const lines = rows.map((t) => [
    txDateLabel(t.date, t.time),
    t.clientName,
    t.service,
    t.professional,
    METHOD_LABELS[t.method] ?? t.method,
    fmtBRL(t.value),
    STATUS_LABELS[t.status],
  ].map((v) => `"${v}"`).join(','))
  return [header.join(','), ...lines].join('\n')
}

function downloadCSV(rows: Transaction[]) {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `recebimentos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="ml-1 opacity-30" aria-hidden="true" />
  return sortDir === 'asc'
    ? <ArrowUp size={12} className="ml-1 text-[#2563EB]" aria-hidden="true" />
    : <ArrowDown size={12} className="ml-1 text-[#2563EB]" aria-hidden="true" />
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium',
        status === 'PAID'
          ? 'bg-[#DCFCE7] text-[#166534]'
          : 'bg-[#FEF9C3] text-[#854D0E]',
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="py-12 text-center">
        <p className="text-[13px] text-[#64748B]">Nenhum recebimento encontrado para o período selecionado.</p>
      </td>
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

function PagamentosTable() {
  // TODO: conectar endpoint /payments com paginação quando disponível
  if (FEATURES.realRelatorios) return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center text-[#94A3B8]">
      <p className="text-[13px] font-medium text-[#475569]">Histórico de Pagamentos em breve</p>
      <p className="mt-1 text-[12px]">As transações aparecerão aqui assim que o módulo for ativado.</p>
    </div>
  )
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const transactions = MOCK_TRANSACTIONS_HISTORICO[selectedMonth] ?? []
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = useCallback((col: SortKey) => {
    setSortKey((prev) => {
      if (prev === col) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); return col }
      setSortDir('desc')
      return col
    })
  }, [])

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'date':       cmp = a.date.getTime() - b.date.getTime(); break
        case 'clientName': cmp = a.clientName.localeCompare(b.clientName, 'pt'); break
        case 'method':     cmp = (METHOD_LABELS[a.method] ?? a.method).localeCompare(METHOD_LABELS[b.method] ?? b.method, 'pt'); break
        case 'value':      cmp = a.value - b.value; break
        case 'status':     cmp = a.status.localeCompare(b.status); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [transactions, sortKey, sortDir])

  const total = useMemo(() => transactions.filter((t) => t.status === 'PAID').reduce((s, t) => s + t.value, 0), [transactions])
  const pending = useMemo(() => transactions.filter((t) => t.status === 'PENDING').reduce((s, t) => s + t.value, 0), [transactions])

  const thBtn = (col: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => handleSort(col)}
      className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-[#64748B] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
      aria-sort={sortKey === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </button>
  )

  return (
    <div className="space-y-4">
      <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Recebimentos</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{transactions.length} transações no mês</p>
        </div>
        <button
          type="button"
          onClick={() => downloadCSV(sorted)}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          aria-label="Exportar CSV"
        >
          <Download size={13} aria-hidden="true" />
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]" aria-label="Tabela de recebimentos">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-5 py-3 text-left">{thBtn('date', 'Data')}</th>
              <th className="px-4 py-3 text-left">{thBtn('clientName', 'Cliente')}</th>
              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Serviço</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Profissional</span>
              </th>
              <th className="px-4 py-3 text-left">{thBtn('method', 'Método')}</th>
              <th className="px-4 py-3 text-right">{thBtn('value', 'Valor')}</th>
              <th className="px-5 py-3 text-left">{thBtn('status', 'Status')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <EmptyState />
            ) : (
              sorted.map((t, i) => (
                <tr
                  key={t.id}
                  className={cn(
                    'group transition-colors hover:bg-[#F8FAFC]',
                    i < sorted.length - 1 && 'border-b border-[#F1F5F9]',
                  )}
                >
                  <td className="whitespace-nowrap px-5 py-3 font-tabular text-[12px] text-[#475569]">
                    {txDateLabel(t.date, t.time)}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#0F172A]">{t.clientName}</td>
                  <td className="px-4 py-3 text-[12px] text-[#475569]">{t.service}</td>
                  <td className="px-4 py-3 text-[12px] text-[#475569]">{t.professional}</td>
                  <td className="px-4 py-3 text-[12px] text-[#475569]">{METHOD_LABELS[t.method] ?? t.method}</td>
                  <td className="px-4 py-3 text-right font-tabular text-[13px] font-medium text-[#0F172A]">
                    {fmtBRL(t.value)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
                <td colSpan={5} className="px-5 py-3 text-[12px] font-semibold text-[#0F172A]">
                  Total do período
                </td>
                <td className="px-4 py-3 text-right font-tabular text-[13px] font-bold text-[#0F172A]">
                  {fmtBRL(total)}
                </td>
                <td className="px-5 py-3 text-[11px] text-[#64748B]">
                  {pending > 0 && <span className="text-[#854D0E]">+{fmtBRL(pending)} pend.</span>}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
    </div>
  )
}

export default memo(PagamentosTable)
