'use client'

import { useEffect, useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle, RefreshCw, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, StockMovementInput, StockMovementType } from '@/hooks/use-produtos'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPOS: Array<{ value: StockMovementType; label: string; desc: string; icon: React.ReactNode; color: string; bg: string }> = [
  { value: 'ENTRADA',    label: 'Entrada',    desc: 'Adiciona ao estoque',        icon: <ArrowDownCircle size={14} />, color: '#16A34A', bg: '#DCFCE7' },
  { value: 'SAIDA',      label: 'Saída',      desc: 'Remove do estoque',          icon: <ArrowUpCircle   size={14} />, color: '#DC2626', bg: '#FEE2E2' },
  { value: 'AJUSTE',     label: 'Ajuste',     desc: 'Corrige para valor absoluto', icon: <RefreshCw       size={14} />, color: '#2563EB', bg: '#DBEAFE' },
  { value: 'INVENTARIO', label: 'Inventário', desc: 'Contagem física',             icon: <ClipboardList   size={14} />, color: '#7C3AED', bg: '#F3E8FF' },
]

const LABEL = 'mb-1.5 block text-[11px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

function calcNewStock(current: number, type: StockMovementType, qty: number): number {
  if (type === 'ENTRADA')    return current + qty
  if (type === 'SAIDA')      return current - qty
  return qty // AJUSTE e INVENTARIO
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (input: StockMovementInput) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MovimentacaoEstoqueModal({ open, product, onClose, onSave }: Props) {
  const [visible, setVisible] = useState(false)
  const [type, setType]       = useState<StockMovementType>('ENTRADA')
  const [qty, setQty]         = useState('')
  const [reason, setReason]   = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

  useEffect(() => {
    if (open) {
      setType('ENTRADA'); setQty(''); setReason(''); setCostPrice(''); setSaving(false); setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || !product) return null

  const qtyNum    = Number(qty) || 0
  const newStock  = calcNewStock(product.stockQuantity, type, qtyNum)
  const stockDiff = newStock - product.stockQuantity
  const positive  = stockDiff >= 0

  const reasonRequired = type === 'SAIDA' || type === 'AJUSTE'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    if (qtyNum <= 0) { setError('Quantidade deve ser maior que zero'); return }
    if (reasonRequired && !reason.trim()) { setError('Motivo é obrigatório para este tipo de movimentação'); return }
    setSaving(true); setError(null)
    try {
      await onSave({
        type,
        quantity: qtyNum,
        reason: reason.trim() || undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar movimentação')
      setSaving(false)
    }
  }

  const tipoAtual = TIPOS.find(t => t.value === type)!

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-4"
      role="dialog" aria-modal="true" aria-label="Movimentar estoque"
    >
      <div
        className={cn(
          'absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose} aria-hidden="true"
      />

      <div
        className={cn(
          'relative z-10 flex w-full max-w-md flex-col rounded-t-2xl bg-[#F1F5F9] shadow-2xl lg:rounded-xl',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 lg:translate-y-0',
        )}
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4 rounded-t-2xl lg:rounded-t-xl">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Movimentar Estoque</h2>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{product.name}</p>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <form id="mov-form" onSubmit={handleSubmit} className="space-y-4 p-5">

            {/* Tipo */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <div className="border-b border-[#F1F5F9] px-4 py-3">
                <span className="text-[13px] font-semibold text-[#0F172A]">Tipo de movimentação</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                {TIPOS.map(t => (
                  <button
                    key={t.value} type="button"
                    onClick={() => setType(t.value)}
                    aria-pressed={type === t.value}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      type === t.value
                        ? 'shadow-[0_0_0_2px_var(--tw-ring-color)]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]',
                    )}
                    style={type === t.value ? { borderColor: t.color, backgroundColor: t.bg, ['--tw-ring-color' as string]: t.color } : {}}
                  >
                    <span style={{ color: t.color }}>{t.icon}</span>
                    <span className="text-[12px] font-semibold" style={{ color: type === t.value ? t.color : '#0F172A' }}>{t.label}</span>
                    <span className="text-[10px] text-[#64748B]">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estoque preview */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[11px] font-medium text-[#64748B]">Estoque atual</p>
                  <p className="text-[20px] font-bold text-[#0F172A] font-tabular">{product.stockQuantity}</p>
                </div>
                {qtyNum > 0 && (
                  <>
                    <div className="text-[20px] font-light text-[#94A3B8]">→</div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-[#64748B]">Após movimentação</p>
                      <p className="text-[20px] font-bold font-tabular" style={{ color: newStock < 0 ? '#DC2626' : positive ? '#16A34A' : '#DC2626' }}>
                        {newStock < 0 ? '⚠ ' : ''}{newStock}
                        <span className="ml-1 text-[12px] font-normal text-[#94A3B8]">
                          ({positive ? '+' : ''}{stockDiff})
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Campos */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-4">
              <div>
                <label htmlFor="mov-qty" className={LABEL}>
                  Quantidade {type === 'AJUSTE' || type === 'INVENTARIO' ? '(valor final)' : ''} *
                </label>
                <input
                  id="mov-qty" type="number" min="1" step="1" required
                  value={qty} onChange={e => setQty(e.target.value)}
                  placeholder="0" className={INPUT}
                />
              </div>
              <div>
                <label htmlFor="mov-reason" className={LABEL}>
                  Motivo {reasonRequired ? '*' : '(opcional)'}
                </label>
                <input
                  id="mov-reason" type="text"
                  value={reason} onChange={e => setReason(e.target.value)}
                  placeholder={type === 'SAIDA' ? 'Ex.: Uso em procedimento' : type === 'AJUSTE' ? 'Ex.: Correção após contagem' : 'Ex.: Compra de fornecedor'}
                  className={INPUT}
                />
              </div>
              {type === 'ENTRADA' && (
                <div>
                  <label htmlFor="mov-cost" className={LABEL}>Preço de custo (R$) — opcional</label>
                  <input
                    id="mov-cost" type="number" min="0" step="0.01"
                    value={costPrice} onChange={e => setCostPrice(e.target.value)}
                    placeholder="0,00" className={INPUT}
                  />
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#E2E8F0] bg-white px-5 py-4 lg:rounded-b-xl">
          {error && <p className="text-[12px] text-[#DC2626]" role="alert">{error}</p>}
          <div className="flex gap-2.5">
            <button
              type="button" onClick={onClose} disabled={saving}
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569]',
                'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              Cancelar
            </button>
            <button
              type="submit" form="mov-form" disabled={saving}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                saving
                  ? 'cursor-not-allowed bg-[#93C5FD]'
                  : 'bg-[#2563EB] shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:bg-[#1D4ED8]',
              )}
            >
              {saving ? 'Registrando…' : 'Registrar Movimentação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
