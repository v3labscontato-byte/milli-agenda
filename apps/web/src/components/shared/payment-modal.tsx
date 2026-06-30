'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, CheckCircle2, Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import AddItemModal from './add-item-modal'
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
  calculateChange,
  formatBRL,
} from '@/lib/business-rules'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethodId = 'pix' | 'dinheiro' | 'debito' | 'credito' | 'voucher' | 'transferencia'
type DiscountType = 'amount' | 'percent'

interface MethodConfig { id: PaymentMethodId; label: string; emoji: string }

interface PaymentEntry {
  id: string
  method: PaymentMethodId
  amount: string
  installments: number
}

export interface PaymentItem {
  serviceId?: string
  name: string
  quantity: number
  unitPrice: number
}

export interface PaymentResult {
  methods: Array<{ method: string; amount: number; installments: number }>
  discount: { type: DiscountType; value: number } | null
  discountAbsolute: number
  total: number
  change: number
  items: Array<{ serviceId: string; name: string; quantity: number; unitPrice: number }>
}

export interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (result: PaymentResult) => void
  loading?: boolean
  commandId?: string
  clientName: string
  professionalName: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  items: PaymentItem[]
  deposit?: { amount: number; method: string; paidAt: string } | null
  initialDiscount?: { type: DiscountType; value: number } | null
  isCompleted?: boolean
  onReopen?: () => void
}

// ─── Config ───────────────────────────────────────────────────────────────────

const METHODS: MethodConfig[] = [
  { id: 'pix',           label: 'PIX',          emoji: '🔵' },
  { id: 'dinheiro',      label: 'Dinheiro',      emoji: '💵' },
  { id: 'debito',        label: 'Débito',        emoji: '💳' },
  { id: 'credito',       label: 'Crédito',       emoji: '💳' },
  { id: 'voucher',       label: 'Voucher',       emoji: '🎫' },
  { id: 'transferencia', label: 'Transferência', emoji: '↔️' },
]
const METHOD_MAP = Object.fromEntries(METHODS.map((m) => [m.id, m])) as Record<PaymentMethodId, MethodConfig>

function newEntry(method: PaymentMethodId = 'pix'): PaymentEntry {
  return { id: crypto.randomUUID(), method, amount: '', installments: 1 }
}

type LocalItem = PaymentItem & { _key: string }
function withKey(item: PaymentItem): LocalItem {
  return { ...item, _key: crypto.randomUUID() }
}

function cashChange(entry: PaymentEntry, allEntries: PaymentEntry[], due: number): number {
  if (entry.method !== 'dinheiro') return 0
  const others = allEntries.filter((e) => e.id !== entry.id).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  return Math.max(0, (parseFloat(entry.amount) || 0) - Math.max(0, due - others))
}

// ─── Payment entry card ───────────────────────────────────────────────────────

interface EntryCardProps {
  entry: PaymentEntry
  entries: PaymentEntry[]
  totalDue: number
  canRemove: boolean
  onUpdate: (patch: Partial<PaymentEntry>) => void
  onRemove: () => void
}

function PaymentEntryCard({ entry, entries, totalDue, canRemove, onUpdate, onRemove }: EntryCardProps) {
  const cfg = METHOD_MAP[entry.method]
  const change = cashChange(entry, entries, totalDue)

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[16px]" aria-hidden="true">{cfg.emoji}</span>
          <span className="text-[14px] font-semibold text-[#0F172A]">{cfg.label}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remover ${cfg.label}`}
            className="flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-[#475569]">Valor</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]">R$</span>
          <input type="number" min="0" step="0.01" value={entry.amount}
            onChange={(e) => onUpdate({ amount: e.target.value })} placeholder="0,00"
            aria-label={`Valor ${cfg.label}`}
            className="w-full rounded-md border border-[#E2E8F0] py-2 pl-8 pr-3 font-tabular text-[14px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
          />
        </div>
      </div>

      {entry.method === 'credito' && (
        <div className="mt-3">
          <label className="mb-1.5 block text-[11px] font-medium text-[#475569]">Parcelas</label>
          <select value={entry.installments} onChange={(e) => onUpdate({ installments: parseInt(e.target.value) })}
            aria-label="Número de parcelas"
            className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]">
            {Array.from({ length: 12 }, (_, i) => {
              const n = i + 1
              const amt = parseFloat(entry.amount) || 0
              const each = amt > 0 ? ` — ${formatBRL(amt / n)}` : ''
              return <option key={n} value={n}>{n === 1 ? `À vista${each}` : `${n}x${each}`}</option>
            })}
          </select>
        </div>
      )}

      {change > 0 && (
        <p className="mt-2 text-[12px] font-semibold text-[#16A34A]">Troco: {formatBRL(change)}</p>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function PaymentModal({
  open, onClose, onConfirm,
  loading, commandId, clientName, serviceName, date, startTime, endTime,
  items, deposit, initialDiscount,
  isCompleted, onReopen,
}: PaymentModalProps) {
  const [visible, setVisible]             = useState(false)
  const [summaryOpen, setSummaryOpen]     = useState(true)
  const [discountType, setDiscountType]   = useState<DiscountType>('amount')
  const [discountInput, setDiscountInput] = useState('')
  const [appliedDiscount, setApplied]     = useState<{ type: DiscountType; value: number } | null>(null)
  const [entries, setEntries]             = useState<PaymentEntry[]>(() => [newEntry()])
  const [localItems, setLocalItems]       = useState<LocalItem[]>(() => items.map(withKey))
  const [addItemOpen, setAddItemOpen]     = useState(false)

  // Entrance animation
  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

  // Reset state only when modal opens — intentionally excludes items/initialDiscount from deps to avoid
  // mid-session reset when the parent re-renders (e.g. after agenda refetch triggered by onSuccess)
  useEffect(() => {
    if (!open) return
    setEntries([newEntry()])
    setLocalItems(items.map(withKey))  // eslint-disable-line react-hooks/exhaustive-deps
    setAddItemOpen(false)
    const initDisc = initialDiscount ?? null  // eslint-disable-line react-hooks/exhaustive-deps
    setApplied(initDisc)
    setDiscountType(initDisc?.type ?? 'amount')
    setDiscountInput(initDisc ? String(initDisc.value) : '')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard handler — separate effect so onClose ref changes don't retrigger the reset above
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Sync localItems when items arrive asynchronously (e.g. Ver Comanda fetches API after modal opens)
  useEffect(() => {
    if (!open) return
    setLocalItems(items.map(withKey))
  }, [open, items]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync discount when initialDiscount arrives asynchronously
  useEffect(() => {
    if (!open || !initialDiscount) return
    setApplied(initialDiscount)
    setDiscountType(initialDiscount.type ?? 'amount')
    setDiscountInput(String(initialDiscount.value))
  }, [open, initialDiscount]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  // ── Computed ────────────────────────────────────────────────────────────────
  const subtotal          = calculateSubtotal(localItems)
  const depositAmt        = deposit?.amount ?? 0
  const appliedDiscountAmt = calculateDiscount(subtotal, appliedDiscount)
  const totalDue          = Math.max(0, calculateTotal(subtotal, appliedDiscountAmt) - depositAmt)
  const totalPaid         = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const diff              = totalPaid - totalDue
  const canConfirm        = totalPaid >= totalDue && totalPaid > 0

  const previewDiscountVal = parseFloat(discountInput)
  const previewDiscountAmt = !appliedDiscount && discountInput && !isNaN(previewDiscountVal)
    ? calculateDiscount(subtotal, { type: discountType, value: previewDiscountVal })
    : null

  function applyDiscount() {
    const val = parseFloat(discountInput)
    if (isNaN(val) || val <= 0) return
    setApplied({ type: discountType, value: val })
  }

  function clearDiscount() { setApplied(null); setDiscountInput('') }

  function updateEntry(id: string, patch: Partial<PaymentEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function handleConfirm() {
    const totalChange = Math.max(0, totalPaid - totalDue)
    onConfirm({
      methods: entries.map((e) => ({ method: e.method, amount: parseFloat(e.amount) || 0, installments: e.installments })),
      discount: appliedDiscount,
      discountAbsolute: appliedDiscountAmt,
      total: totalDue,
      change: totalChange,
      items: localItems.map((i) => ({
        serviceId: i.serviceId ?? '',
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog" aria-modal="true" aria-label={`Pagamento — ${clientName}`}>

      {/* Backdrop */}
      <div className={cn('absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 flex w-full max-w-lg flex-col rounded-t-2xl bg-[#F8FAFC] shadow-2xl sm:rounded-xl',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.97] sm:translate-y-0',
        )}
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4 rounded-t-2xl sm:rounded-t-xl">
          <div>
            <p className="text-[15px] font-semibold text-[#0F172A]">
              Pagamento
              {commandId && <span className="ml-2 text-[12px] font-normal text-[#94A3B8]">#{commandId}</span>}
            </p>
            <p className="mt-0.5 text-[12px] text-[#475569]">
              {clientName}
              <span className="mx-1.5 text-[#CBD5E1]">·</span>
              {serviceName}
              <span className="mx-1.5 text-[#CBD5E1]">·</span>
              {date} {startTime}–{endTime}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar modal de pagamento"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">

          {/* Resumo da comanda */}
          <div className="bg-white">
            <button type="button" onClick={() => setSummaryOpen((s) => !s)} aria-expanded={summaryOpen}
              className="flex w-full items-center justify-between px-5 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              <span className="text-[12px] font-medium text-[#64748B]">Resumo</span>
              <ChevronDown size={14} className={cn('text-[#94A3B8] transition-transform duration-150 motion-reduce:transition-none', summaryOpen && 'rotate-180')} aria-hidden="true" />
            </button>

            {summaryOpen && (
              <div className="px-5 pb-4">
                <ul className="mb-2 space-y-1" aria-label="Itens">
                  {localItems.map((item) => (
                    <li key={item._key} className="flex items-center justify-between gap-2 text-[13px]">
                      <span className="min-w-0 truncate text-[#0F172A]">{item.name}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="font-tabular text-[#475569]">
                          {item.quantity > 1 && `${item.quantity}× `}{formatBRL(item.unitPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLocalItems((prev) => prev.filter((i) => i._key !== item._key))}
                          aria-label={`Remover ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded text-[#CBD5E1] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DBEAFE]"
                        >
                          <X size={11} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setAddItemOpen(true)}
                  className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:underline"
                >
                  <Plus size={12} aria-hidden="true" />
                  Adicionar procedimento ou produto
                </button>
                <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2.5">
                  <span className="text-[13px] font-semibold text-[#0F172A]">Subtotal</span>
                  <span className="font-tabular text-[14px] font-semibold text-[#0F172A]">{formatBRL(subtotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sinal pago */}
          {deposit && (
            <div className="bg-white px-5 py-4">
              <p className="mb-3 text-[12px] font-medium text-[#64748B]">Sinal Pago</p>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#0F172A]">Sinal recebido</span>
                    <span className="font-tabular text-[13px] font-semibold text-[#16A34A]">−{formatBRL(depositAmt)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#94A3B8]">{deposit.method} · pago em {deposit.paidAt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Desconto */}
          <div className="bg-white px-5 py-4">
            <p className="mb-3 text-[12px] font-medium text-[#64748B]">Desconto</p>

            {appliedDiscount ? (
              <div className="flex items-center justify-between rounded-md bg-[#F0FDF4] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#16A34A]" aria-hidden="true" />
                  <span className="text-[13px] font-medium text-[#16A34A]">
                    Desconto aplicado — −{formatBRL(appliedDiscountAmt)}
                    {appliedDiscount.type === 'percent' && (
                      <span className="ml-1 text-[11px] opacity-70">({appliedDiscount.value}%)</span>
                    )}
                  </span>
                </div>
                <button type="button" onClick={clearDiscount}
                  className="text-[11px] font-medium text-[#94A3B8] hover:text-[#DC2626] focus-visible:outline-none focus-visible:underline">
                  Remover
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex overflow-hidden rounded-md border border-[#E2E8F0]">
                    {(['amount', 'percent'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setDiscountType(t)} aria-pressed={discountType === t}
                        className={cn(
                          'px-3 py-1.5 text-[12px] font-medium transition-colors motion-reduce:transition-none',
                          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          discountType === t ? 'bg-[#2563EB] text-white' : 'text-[#475569] hover:bg-[#F8FAFC]',
                        )}>
                        {t === 'amount' ? 'R$' : '%'}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1">
                    <input type="number" min="0" step={discountType === 'percent' ? '1' : '0.01'}
                      max={discountType === 'percent' ? '100' : undefined}
                      value={discountInput} onChange={(e) => setDiscountInput(e.target.value)}
                      placeholder={discountType === 'percent' ? '0 %' : '0,00'} aria-label="Valor do desconto"
                      className="w-full rounded-md border border-[#E2E8F0] px-3 py-1.5 font-tabular text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                    />
                  </div>
                  <button type="button" onClick={applyDiscount}
                    disabled={!discountInput || parseFloat(discountInput) <= 0}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors motion-reduce:transition-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      discountInput && parseFloat(discountInput) > 0
                        ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                        : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
                    )}>
                    Aplicar
                  </button>
                </div>
                {previewDiscountAmt !== null && previewDiscountAmt > 0 && (
                  <p className="text-[11px] text-[#475569]">
                    Desconto: −{formatBRL(previewDiscountAmt)} → total ficaria {formatBRL(Math.max(0, totalDue - previewDiscountAmt))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Formas de pagamento */}
          <div className="bg-white px-5 py-4">
            <p className="mb-3 text-[12px] font-medium text-[#64748B]">Formas de Pagamento</p>

            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-label="Selecionar forma de pagamento">
              {METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setEntries([{ ...newEntry(m.id) }])}
                  aria-pressed={entries.length === 1 && entries[0].method === m.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-2.5 px-1 text-center transition-colors motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    entries.length === 1 && entries[0].method === m.id
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
                  )}>
                  <span className="text-[16px]" aria-hidden="true">{m.emoji}</span>
                  <span className="text-[10px] font-medium leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {entries.map((entry) => (
                <PaymentEntryCard key={entry.id} entry={entry} entries={entries} totalDue={totalDue}
                  canRemove={entries.length > 1}
                  onUpdate={(patch) => updateEntry(entry.id, patch)}
                  onRemove={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                />
              ))}
            </div>

            <button type="button" onClick={() => setEntries((prev) => [...prev, newEntry('dinheiro')])}
              className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:underline">
              <Plus size={13} aria-hidden="true" />
              Adicionar outro método de pagamento
            </button>
          </div>

          {/* Totais */}
          <div className="bg-white px-5 py-4">
            <p className="mb-3 text-[12px] font-medium text-[#64748B]">Totais</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#475569]">Subtotal</span>
                <span className="font-tabular text-[#0F172A]">{formatBRL(subtotal)}</span>
              </div>
              {depositAmt > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Sinal pago</span>
                  <span className="font-tabular text-[#16A34A]">−{formatBRL(depositAmt)}</span>
                </div>
              )}
              {appliedDiscountAmt > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Desconto</span>
                  <span className="font-tabular text-[#16A34A]">−{formatBRL(appliedDiscountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#F1F5F9] pt-2">
                <span className="text-[14px] font-bold text-[#0F172A]">Total a pagar</span>
                <span className="font-tabular text-[16px] font-bold text-[#0F172A]">{formatBRL(totalDue)}</span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Total informado</span>
                    <span className={cn('font-tabular font-semibold', canConfirm ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                      {formatBRL(totalPaid)}
                    </span>
                  </div>
                  {diff !== 0 && (
                    <div className={cn('flex items-center justify-between rounded-md px-3 py-2', diff > 0 ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]')}>
                      <span className={cn('text-[12px] font-semibold', diff > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                        {diff > 0 ? 'Troco' : 'Faltando'}
                      </span>
                      <span className={cn('font-tabular font-bold', diff > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                        {diff > 0 ? '+' : ''}{formatBRL(diff > 0 ? diff : calculateChange(totalDue, totalPaid))}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex gap-3 border-t border-[#E2E8F0] bg-white px-5 py-4 rounded-b-2xl sm:rounded-b-xl">
          {isCompleted && onReopen && (
            <button
              type="button"
              onClick={onReopen}
              className="flex items-center gap-1.5 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-[13px] font-medium text-[#92400E] transition-colors hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Reabrir Comanda
            </button>
          )}
          <button type="button" onClick={onClose}
            className="flex-1 rounded-md border border-[#E2E8F0] py-2.5 text-[14px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} disabled={!canConfirm || loading}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-[14px] font-semibold transition-colors motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              canConfirm && !loading ? 'bg-[#16A34A] text-white hover:bg-[#15803D]' : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
            )}>
            {loading ? 'Processando...' : (
              <>
                {!canConfirm && totalPaid > 0 && (
                  <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[11px] font-semibold text-[#DC2626]">
                    Falta {formatBRL(totalDue - totalPaid)}
                  </span>
                )}
                ✓ Confirmar Pagamento
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add-item modal renders above the payment panel (z-[70] > z-10 panel) */}
      <AddItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        onAdd={(item) => {
          setLocalItems((prev) => [...prev, withKey({ serviceId: item.serviceId, name: item.name, quantity: item.quantity, unitPrice: item.unitPrice })])
          setAddItemOpen(false)
        }}
      />
    </div>
  )
}
