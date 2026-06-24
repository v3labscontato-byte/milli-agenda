'use client'

import { useState } from 'react'
import { ArrowLeft, Trash2, Plus, Printer, ReceiptText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
  formatBRL,
} from '@/lib/business-rules'
import type { Comanda, ComandaItem, ComandaStatus, Discount, DiscountType, ItemCategory } from '@/lib/comanda-mock'
import AddItemModal from '@/components/shared/add-item-modal'
import PaymentModal from '@/components/shared/payment-modal'

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ComandaStatus, { label: string; bg: string; text: string }> = {
  OPEN:             { label: 'Aberta',          bg: '#F1F5F9', text: '#475569' },
  IN_PROGRESS:      { label: 'Em Atendimento',  bg: '#EFF6FF', text: '#2563EB' },
  AWAITING_PAYMENT: { label: 'Aguard. Pagto',   bg: '#FFFBEB', text: '#D97706' },
  PAID:             { label: 'Paga',            bg: '#F0FDF4', text: '#16A34A' },
  CANCELLED:        { label: 'Cancelada',       bg: '#FEF2F2', text: '#DC2626' },
}

const CAT_CFG: Record<ItemCategory, { label: string; bg: string; text: string }> = {
  service:    { label: 'Serviço',  bg: '#EFF6FF', text: '#2563EB' },
  product:    { label: 'Produto',  bg: '#F0FDF4', text: '#16A34A' },
  fee:        { label: 'Taxa',     bg: '#FFFBEB', text: '#D97706' },
  adjustment: { label: 'Ajuste',  bg: '#F5F3FF', text: '#7C3AED' },
}

function getElapsed(d: Date): string {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60); const r = m % 60
  return r === 0 ? `${h}h` : `${h}h${r}min`
}

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function formatFullDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`
}

function formatDateShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ComandaDetailProps {
  comanda: Comanda
  onBack: () => void
  onAddItem: (item: Omit<ComandaItem, 'id'>) => void
  onRemoveItem: (itemId: string) => void
  onApplyDiscount: (discount: Discount | null) => void
  onStatusChange: (status: ComandaStatus) => void
  onNewComanda: () => void
  hideHeader?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComandaDetail({
  comanda,
  onBack,
  onAddItem,
  onRemoveItem,
  onApplyDiscount,
  onStatusChange,
  onNewComanda,
  hideHeader = false,
}: ComandaDetailProps) {
  const { number, clientName, professional, items, discount, deposit, status, cancelReason, openedAt, date, startTime, endTime } = comanda

  const [discountType, setDiscountType] = useState<DiscountType>(discount?.type ?? 'amount')
  const [discountInput, setDiscountInput] = useState(discount ? String(discount.value) : '')
  const [addOpen, setAddOpen]   = useState(false)
  const [payOpen, setPayOpen]   = useState(false)

  const subtotal     = calculateSubtotal(items)
  const discountAmt  = calculateDiscount(subtotal, discount)
  const total        = calculateTotal(subtotal, discountAmt)

  const s          = STATUS_CFG[status]
  const isEditable = status === 'OPEN' || status === 'IN_PROGRESS'
  const nextStatus: ComandaStatus | null = status === 'OPEN' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'AWAITING_PAYMENT' : null
  const nextLabel  = status === 'OPEN' ? 'Iniciar Atendimento' : 'Finalizar Atendimento'

  function handleApplyDiscount() {
    const val = parseFloat(discountInput)
    if (isNaN(val) || val <= 0) return
    onApplyDiscount({ type: discountType, value: val })
  }

  function handleClearDiscount() {
    onApplyDiscount(null)
    setDiscountInput('')
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden bg-white">
        {/* ── Header (hidden when used inside drawer) ── */}
        {!hideHeader && (
          <div className="shrink-0 border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-start gap-3">
              {/* Mobile back */}
              <button
                type="button"
                onClick={onBack}
                aria-label="Voltar para lista"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] md:hidden"
              >
                <ArrowLeft size={15} aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-[#0F172A]">
                    #{number}
                    <span className="mx-2 text-[#CBD5E1]">·</span>
                    {clientName}
                  </h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[#475569]">
                  {professional}
                  <span className="mx-1.5 text-[#CBD5E1]">·</span>
                  há {getElapsed(openedAt)}
                </p>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                  {formatFullDate(date)}
                  <span className="mx-1.5 text-[#CBD5E1]">·</span>
                  {startTime} → {endTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Items */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
                Itens
              </p>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:underline"
                >
                  <Plus size={12} aria-hidden="true" />
                  Adicionar
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[#94A3B8]">Nenhum item adicionado</p>
            ) : (
              <ul className="divide-y divide-[#F8FAFC]" aria-label="Itens da comanda">
                {items.map((item) => {
                  const cat = CAT_CFG[item.category]
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-2.5">
                      <span
                        className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: cat.bg, color: cat.text }}
                      >
                        {cat.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[#0F172A]">{item.name}</p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-[#94A3B8]">
                            {item.quantity}× {formatBRL(item.unitPrice)}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-tabular text-[13px] font-medium text-[#0F172A]">
                          {formatBRL(item.quantity * item.unitPrice)}
                        </span>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remover ${item.name}`}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#CBD5E1] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Discount */}
          {isEditable && (
            <div className="border-t border-[#F1F5F9] px-5 py-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
                Desconto
              </p>
              {discount ? (
                <div className="flex items-center justify-between rounded-md bg-[#F0FDF4] px-3 py-2">
                  <span className="text-[13px] font-medium text-[#16A34A]">
                    {discount.type === 'percent' ? `${discount.value}% off` : formatBRL(discount.value) + ' off'}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearDiscount}
                    aria-label="Remover desconto"
                    className="text-[12px] font-medium text-[#94A3B8] hover:text-[#DC2626] focus-visible:outline-none focus-visible:underline"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex overflow-hidden rounded-md border border-[#E2E8F0]">
                    {(['amount', 'percent'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDiscountType(t)}
                        aria-pressed={discountType === t}
                        className={cn(
                          'px-3 py-1.5 text-[12px] font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          discountType === t
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#475569] hover:bg-[#F8FAFC]',
                        )}
                      >
                        {t === 'amount' ? 'R$' : '%'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder={discountType === 'percent' ? '0' : '0,00'}
                    aria-label="Valor do desconto"
                    className="w-24 rounded-md border border-[#E2E8F0] px-3 py-1.5 font-tabular text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={!discountInput || parseFloat(discountInput) <= 0}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      discountInput && parseFloat(discountInput) > 0
                        ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                        : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
                    )}
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-[#F1F5F9] px-5 py-4 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#475569]">Subtotal</span>
              <span className="font-tabular text-[#0F172A]">{formatBRL(subtotal)}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#16A34A]">Desconto</span>
                <span className="font-tabular text-[#16A34A]">−{formatBRL(discountAmt)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2">
              <span className="text-[15px] font-semibold text-[#0F172A]">Total</span>
              <span className="font-tabular text-[16px] font-bold text-[#0F172A]">{formatBRL(total)}</span>
            </div>
          </div>

          {/* Cancel reason */}
          {status === 'CANCELLED' && cancelReason && (
            <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-md bg-[#FEF2F2] px-3 py-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <p className="text-[12px] text-[#991B1B]">{cancelReason}</p>
            </div>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-5 py-4">
          {isEditable && nextStatus && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                <Plus size={14} aria-hidden="true" />
                Adicionar Item
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(nextStatus)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#2563EB] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
              >
                {nextLabel} →
              </button>
            </div>
          )}

          {status === 'AWAITING_PAYMENT' && (
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="w-full rounded-md bg-[#16A34A] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
            >
              Processar Pagamento — {formatBRL(total)}
            </button>
          )}

          {(status === 'PAID' || status === 'CANCELLED') && (
            <div className="flex gap-2">
              {status === 'PAID' && (
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  <Printer size={14} aria-hidden="true" />
                  Imprimir Recibo
                </button>
              )}
              <button
                type="button"
                onClick={onNewComanda}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#2563EB] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
              >
                <ReceiptText size={14} aria-hidden="true" />
                Nova Comanda
              </button>
            </div>
          )}
        </div>
      </div>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={onAddItem} />
      <PaymentModal
        open={payOpen}
        commandId={number}
        clientName={clientName}
        professionalName={professional}
        serviceName={comanda.service}
        date={formatDateShort(date)}
        startTime={startTime}
        endTime={endTime}
        items={items}
        deposit={deposit}
        initialDiscount={discount}
        onClose={() => setPayOpen(false)}
        onConfirm={() => onStatusChange('PAID')}
      />
    </>
  )
}
