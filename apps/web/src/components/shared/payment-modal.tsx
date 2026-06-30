'use client'

import { useState, useEffect } from 'react'
import {
  X, CheckCircle2, Plus, RefreshCw,
  Scissors, Tag, Clock, Lock, Info, ChevronRight,
  Banknote, CreditCard, QrCode, ArrowLeftRight, Gift,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AddItemModal from './add-item-modal'
import {
  calculateSubtotal, calculateDiscount, calculateTotal, calculateChange, formatBRL,
} from '@/lib/business-rules'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethodId = 'pix' | 'dinheiro' | 'debito' | 'credito' | 'voucher' | 'transferencia'
type DiscountType = 'amount' | 'percent'

interface MethodConfig {
  id: PaymentMethodId
  label: string
  emoji: string
  Icon: LucideIcon
  iconColor: string
  iconBg: string
}

interface PaymentEntry { id: string; method: PaymentMethodId; amount: string; installments: number }

export interface PaymentItem { serviceId?: string; name: string; quantity: number; unitPrice: number }

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
  { id: 'pix',           label: 'PIX',          emoji: '🔵', Icon: QrCode,          iconColor: '#2563EB', iconBg: '#EFF6FF' },
  { id: 'dinheiro',      label: 'Dinheiro',      emoji: '💵', Icon: Banknote,        iconColor: '#16A34A', iconBg: '#F0FDF4' },
  { id: 'debito',        label: 'Débito',        emoji: '💳', Icon: CreditCard,      iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { id: 'credito',       label: 'Crédito',       emoji: '💳', Icon: CreditCard,      iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { id: 'voucher',       label: 'Voucher',       emoji: '🎫', Icon: Gift,            iconColor: '#D97706', iconBg: '#FEF3C7' },
  { id: 'transferencia', label: 'Transferência', emoji: '↔️', Icon: ArrowLeftRight,  iconColor: '#475569', iconBg: '#F1F5F9' },
]
const METHOD_MAP = Object.fromEntries(METHODS.map((m) => [m.id, m])) as Record<PaymentMethodId, MethodConfig>

function newEntry(method: PaymentMethodId = 'pix'): PaymentEntry {
  return { id: crypto.randomUUID(), method, amount: '', installments: 1 }
}
type LocalItem = PaymentItem & { _key: string }
function withKey(item: PaymentItem): LocalItem { return { ...item, _key: crypto.randomUUID() } }

function cashChange(entry: PaymentEntry, allEntries: PaymentEntry[], due: number): number {
  if (entry.method !== 'dinheiro') return 0
  const others = allEntries.filter((e) => e.id !== entry.id).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  return Math.max(0, (parseFloat(entry.amount) || 0) - Math.max(0, due - others))
}

// ─── Payment entry card ───────────────────────────────────────────────────────

interface EntryCardProps {
  entry: PaymentEntry; entries: PaymentEntry[]; totalDue: number
  canRemove: boolean; onUpdate: (p: Partial<PaymentEntry>) => void; onRemove: () => void
}

function PaymentEntryCard({ entry, entries, totalDue, canRemove, onUpdate, onRemove }: EntryCardProps) {
  const cfg = METHOD_MAP[entry.method]
  const change = cashChange(entry, entries, totalDue)
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: cfg.iconBg }}>
            <cfg.Icon size={14} aria-hidden style={{ color: cfg.iconColor }} />
          </div>
          <span className="text-[14px] font-semibold text-[#0F172A]">{cfg.label}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remover ${cfg.label}`}
            className="flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={13} aria-hidden />
          </button>
        )}
      </div>
      <label className="mb-1.5 block text-[11px] font-medium text-[#475569]">Valor</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]">R$</span>
        <input type="number" min="0" step="0.01" value={entry.amount}
          onChange={(e) => onUpdate({ amount: e.target.value })} placeholder="0,00"
          aria-label={`Valor ${cfg.label}`}
          className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 pl-8 pr-3 font-tabular text-[14px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
        />
      </div>
      {entry.method === 'credito' && (
        <div className="mt-3">
          <label className="mb-1.5 block text-[11px] font-medium text-[#475569]">Parcelas</label>
          <select value={entry.installments} onChange={(e) => onUpdate({ installments: parseInt(e.target.value) })}
            aria-label="Número de parcelas"
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]">
            {Array.from({ length: 12 }, (_, i) => {
              const n = i + 1; const amt = parseFloat(entry.amount) || 0
              const each = amt > 0 ? ` — ${formatBRL(amt / n)}` : ''
              return <option key={n} value={n}>{n === 1 ? `À vista${each}` : `${n}x${each}`}</option>
            })}
          </select>
        </div>
      )}
      {change > 0 && <p className="mt-2 text-[12px] font-semibold text-[#16A34A]">Troco: {formatBRL(change)}</p>}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function PaymentModal({
  open, onClose, onConfirm,
  loading, commandId, clientName, date, startTime,
  items, deposit, initialDiscount, isCompleted, onReopen,
}: PaymentModalProps) {
  const [visible, setVisible]           = useState(false)
  const [discountType, setDiscountType] = useState<DiscountType>('amount')
  const [discountInput, setDiscountInput] = useState('')
  const [appliedDiscount, setApplied]   = useState<{ type: DiscountType; value: number } | null>(null)
  const [entries, setEntries]           = useState<PaymentEntry[]>(() => [newEntry()])
  const [localItems, setLocalItems]     = useState<LocalItem[]>(() => items.map(withKey))
  const [addItemOpen, setAddItemOpen]   = useState(false)
  const [historyOpen, setHistoryOpen]   = useState(false)
  const [notes, setNotes]               = useState('')

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
    setAddItemOpen(false); setHistoryOpen(false); setNotes('')
    const initDisc = initialDiscount ?? null  // eslint-disable-line react-hooks/exhaustive-deps
    setApplied(initDisc)
    setDiscountType(initDisc?.type ?? 'amount')
    setDiscountInput(initDisc ? String(initDisc.value) : '')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Computed ──────────────────────────────────────────────────────────────
  const subtotal           = calculateSubtotal(localItems)
  const depositAmt         = deposit?.amount ?? 0
  const appliedDiscountAmt = calculateDiscount(subtotal, appliedDiscount)
  const totalDue           = Math.max(0, calculateTotal(subtotal, appliedDiscountAmt) - depositAmt)
  const totalPaid          = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const diff               = totalPaid - totalDue
  const canConfirm         = totalPaid >= totalDue && totalPaid > 0
  const previewDiscountVal = parseFloat(discountInput)
  const previewDiscountAmt = !appliedDiscount && discountInput && !isNaN(previewDiscountVal)
    ? calculateDiscount(subtotal, { type: discountType, value: previewDiscountVal }) : null

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
    onConfirm({
      methods: entries.map((e) => ({ method: e.method, amount: parseFloat(e.amount) || 0, installments: e.installments })),
      discount: appliedDiscount, discountAbsolute: appliedDiscountAmt,
      total: totalDue, change: Math.max(0, totalPaid - totalDue),
      items: localItems.map((i) => ({ serviceId: i.serviceId ?? '', name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-4"
      role="dialog" aria-modal="true" aria-label={`Pagamento — ${clientName}`}>

      {/* Backdrop */}
      <div className={cn('absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className={cn(
        'relative z-10 flex w-full max-w-4xl flex-col rounded-t-2xl bg-[#F1F5F9] shadow-2xl lg:rounded-xl',
        'transition-all duration-200 ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 lg:translate-y-0',
      )} style={{ maxHeight: '92vh' }}>

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 rounded-t-2xl lg:rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <CreditCard size={20} className="text-[#2563EB]" aria-hidden />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A]">Pagamento da Comanda</h2>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                {commandId && <><span className="font-medium text-[#475569]">Comanda #{commandId}</span><span className="mx-1.5 text-[#CBD5E1]">·</span></>}
                {date} às {startTime}
                <span className="mx-1.5 text-[#CBD5E1]">·</span>
                {clientName}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar modal de pagamento"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* ── Body: two columns ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

          {/* Left column */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 lg:border-r lg:border-[#E2E8F0]">

            {/* Serviços e Produtos */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE9FE]">
                  <Scissors size={14} className="text-[#7C3AED]" aria-hidden />
                </div>
                <span className="text-[14px] font-semibold text-[#0F172A]">Serviços e Produtos</span>
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                  {localItems.length} {localItems.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <div className="space-y-2 p-4">
                {localItems.map((item) => (
                  <div key={item._key} className="flex items-center justify-between rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5">
                    <div>
                      <p className="text-[13px] font-medium text-[#0F172A]">{item.name}</p>
                      <p className="text-[11px] text-[#64748B]">{item.quantity}×</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-tabular text-[14px] font-semibold text-[#0F172A]">{formatBRL(item.unitPrice)}</span>
                      {!isCompleted && (
                        <button type="button" onClick={() => setLocalItems((prev) => prev.filter((i) => i._key !== item._key))}
                          aria-label={`Remover ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DBEAFE]">
                          <X size={12} aria-hidden />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!isCompleted && (
                  <button type="button" onClick={() => setAddItemOpen(true)}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] py-2.5 text-[13px] font-medium text-[#2563EB] transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                    <Plus size={14} aria-hidden />
                    Adicionar serviço ou produto
                  </button>
                )}
              </div>
            </div>

            {/* Ajustes */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECFDF5]">
                  <Tag size={14} className="text-[#16A34A]" aria-hidden />
                </div>
                <span className="text-[14px] font-semibold text-[#0F172A]">Ajustes</span>
              </div>
              <div className="space-y-3 p-4">
                {/* Desconto */}
                {appliedDiscount ? (
                  <div className="flex items-center justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#16A34A]" aria-hidden />
                      <div>
                        <p className="text-[13px] font-medium text-[#16A34A]">Desconto aplicado</p>
                        {appliedDiscount.type === 'percent' && (
                          <p className="text-[11px] text-[#16A34A]/70">{appliedDiscount.value}%</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-tabular text-[13px] font-semibold text-[#16A34A]">−{formatBRL(appliedDiscountAmt)}</span>
                      <button type="button" onClick={clearDiscount} aria-label="Remover desconto"
                        className="flex h-6 w-6 items-center justify-center rounded text-[#16A34A]/60 transition-colors hover:bg-[#BBF7D0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DBEAFE]">
                        <X size={12} aria-hidden />
                      </button>
                    </div>
                  </div>
                ) : !isCompleted ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-[#64748B]">Adicionar desconto</p>
                    <div className="flex items-center gap-2">
                      <div className="flex overflow-hidden rounded-md border border-[#E2E8F0]">
                        {(['amount', 'percent'] as const).map((t) => (
                          <button key={t} type="button" onClick={() => setDiscountType(t)} aria-pressed={discountType === t}
                            className={cn('px-3 py-1.5 text-[12px] font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                              discountType === t ? 'bg-[#2563EB] text-white' : 'text-[#475569] hover:bg-[#F8FAFC]')}>
                            {t === 'amount' ? 'R$' : '%'}
                          </button>
                        ))}
                      </div>
                      <input type="number" min="0" step={discountType === 'percent' ? '1' : '0.01'}
                        max={discountType === 'percent' ? '100' : undefined}
                        value={discountInput} onChange={(e) => setDiscountInput(e.target.value)}
                        placeholder={discountType === 'percent' ? '0 %' : '0,00'} aria-label="Valor do desconto"
                        className="flex-1 rounded-md border border-[#E2E8F0] px-3 py-1.5 font-tabular text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                      />
                      <button type="button" onClick={applyDiscount} disabled={!discountInput || parseFloat(discountInput) <= 0}
                        className={cn('rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          discountInput && parseFloat(discountInput) > 0 ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}>
                        Aplicar
                      </button>
                    </div>
                    {previewDiscountAmt !== null && previewDiscountAmt > 0 && (
                      <p className="text-[11px] text-[#475569]">
                        Desconto: −{formatBRL(previewDiscountAmt)} → total ficaria {formatBRL(Math.max(0, totalDue - previewDiscountAmt))}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Sinal pago */}
                {deposit && (
                  <div className="flex items-center justify-between rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Info size={15} className="text-[#2563EB]" aria-hidden />
                      <div>
                        <p className="text-[13px] font-medium text-[#1D4ED8]">Sinal pago em {deposit.paidAt}</p>
                        <p className="text-[11px] text-[#3B82F6]">{deposit.method}</p>
                      </div>
                    </div>
                    <span className="font-tabular text-[13px] font-semibold text-[#1D4ED8]">−{formatBRL(depositAmt)}</span>
                  </div>
                )}

                {/* Observações */}
                {!isCompleted && (
                  <div>
                    <label htmlFor="pm-notes" className="mb-1.5 block text-[11px] font-medium text-[#64748B]">
                      Observações (opcional)
                    </label>
                    <textarea id="pm-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex.: cliente preferiu esmalte cor nude"
                      rows={3} maxLength={200}
                      className="w-full resize-none rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                    />
                    <p className="mt-0.5 text-right text-[11px] text-[#94A3B8]">{notes.length}/200</p>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico — accordion */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <button type="button" onClick={() => setHistoryOpen((s) => !s)} aria-expanded={historyOpen}
                className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
                    <Clock size={14} className="text-[#64748B]" aria-hidden />
                  </div>
                  <span className="text-[14px] font-semibold text-[#0F172A]">Histórico da comanda</span>
                </div>
                <ChevronRight size={15} className={cn('text-[#94A3B8] transition-transform duration-200 motion-reduce:transition-none', historyOpen && 'rotate-90')} aria-hidden />
              </button>
              {historyOpen && (
                <div className="border-t border-[#F1F5F9] px-4 py-4">
                  <p className="text-[13px] text-[#94A3B8]">Nenhum histórico disponível.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-full shrink-0 flex-col space-y-4 overflow-y-auto p-5 lg:w-[360px]">

            {/* Resumo financeiro */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Total a Pagar</p>
              <p className={cn('mt-1 font-tabular text-[36px] font-bold leading-none', totalDue === 0 ? 'text-[#16A34A]' : 'text-[#2563EB]')}>
                {formatBRL(totalDue)}
              </p>
              <div className="mt-4 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#475569]">Subtotal</span>
                  <span className="font-tabular text-[#0F172A]">{formatBRL(subtotal)}</span>
                </div>
                {depositAmt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#2563EB]">Sinal pago</span>
                    <span className="font-tabular font-medium text-[#2563EB]">−{formatBRL(depositAmt)}</span>
                  </div>
                )}
                {appliedDiscountAmt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#16A34A]">Desconto</span>
                    <span className="font-tabular font-medium text-[#16A34A]">−{formatBRL(appliedDiscountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#E2E8F0] pt-3">
                  <span className="text-[15px] font-bold text-[#0F172A]">Total</span>
                  <span className="font-tabular text-[16px] font-bold text-[#0F172A]">{formatBRL(totalDue)}</span>
                </div>
              </div>
              {totalPaid > 0 && diff !== 0 && (
                <div className={cn('mt-3 flex items-center justify-between rounded-lg px-3 py-2', diff > 0 ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]')}>
                  <span className={cn('text-[12px] font-semibold', diff > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                    {diff > 0 ? 'Troco' : 'Faltando'}
                  </span>
                  <span className={cn('font-tabular text-[13px] font-bold', diff > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
                    {diff > 0 ? '+' : ''}{formatBRL(diff > 0 ? diff : calculateChange(totalDue, totalPaid))}
                  </span>
                </div>
              )}
            </div>

            {/* Formas de Pagamento */}
            {!isCompleted && <div>
              <p className="mb-3 text-[13px] font-semibold text-[#0F172A]">Formas de Pagamento</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Selecionar forma de pagamento">
                {METHODS.map((m) => {
                  const active = entries.length === 1 && entries[0].method === m.id
                  return (
                    <button key={m.id} type="button" onClick={() => setEntries([{ ...newEntry(m.id) }])}
                      aria-pressed={active}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center',
                        'transition-all duration-150 motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        active
                          ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_1px_#2563EB]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]',
                      )}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                        style={{ backgroundColor: active ? m.iconBg : '#F1F5F9' }}>
                        <m.Icon size={18} aria-hidden style={{ color: active ? m.iconColor : '#64748B' }} />
                      </div>
                      <span className={cn('text-[11px] font-medium leading-tight transition-colors', active ? 'text-[#2563EB]' : 'text-[#475569]')}>
                        {m.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>}

            {/* Área dinâmica */}
            <div className="space-y-3">
              {isCompleted ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden />
                  <div>
                    <p className="text-[13px] font-medium text-[#15803D]">Comanda finalizada</p>
                    <p className="text-[11px] text-[#16A34A]/70">Pagamento registrado com sucesso.</p>
                  </div>
                </div>
              ) : totalDue === 0 ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                  <Info size={15} className="mt-0.5 shrink-0 text-[#2563EB]" aria-hidden />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D4ED8]">Selecione uma forma de pagamento</p>
                    <p className="text-[11px] text-[#3B82F6]">O valor será preenchido automaticamente.</p>
                  </div>
                </div>
              ) : (
                <>
                  {entries.map((entry) => (
                    <PaymentEntryCard key={entry.id} entry={entry} entries={entries} totalDue={totalDue}
                      canRemove={entries.length > 1}
                      onUpdate={(patch) => updateEntry(entry.id, patch)}
                      onRemove={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                    />
                  ))}
                  <button type="button" onClick={() => setEntries((prev) => [...prev, newEntry('dinheiro')])}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:underline">
                    <Plus size={13} aria-hidden />
                    Adicionar outro método
                  </button>
                </>
              )}
            </div>

            {/* Ações */}
            <div className="mt-auto space-y-2 pt-1">
              {!isCompleted && (
                <button type="button" onClick={handleConfirm} disabled={!canConfirm || loading}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold',
                    'transition-colors motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                    canConfirm && !loading
                      ? 'bg-[#2563EB] text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:bg-[#1D4ED8]'
                      : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
                  )}>
                  {loading ? 'Processando...' : (
                    <>
                      <Lock size={16} aria-hidden />
                      <span>Confirmar Pagamento</span>
                      {canConfirm && (
                        <span className="text-[13px] font-normal opacity-80">· Receber {formatBRL(totalDue)}</span>
                      )}
                      {!canConfirm && totalPaid > 0 && (
                        <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[11px] font-semibold text-[#DC2626]">
                          Falta {formatBRL(totalDue - totalPaid)}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )}
              <div className="flex gap-2">
                {isCompleted && onReopen && (
                  <button type="button" onClick={onReopen}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-[13px] font-medium text-[#92400E] transition-colors hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                    <RefreshCw size={13} aria-hidden />
                    Reabrir Comanda
                  </button>
                )}
                <button type="button" onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
