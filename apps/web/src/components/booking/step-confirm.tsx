'use client'

import { useState } from 'react'
import { ChevronLeft, CheckCircle2, Tag } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SALON, formatDuration, formatPrice, applyCoupon, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

function formatDateFull(iso: string, time: string): string {
  const d = new Date(iso + 'T12:00:00')
  const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} · ${time}`
}

interface ConfirmData { name: string; phone: string; email: string; notes: string }

interface StepConfirmProps {
  service: BookingService
  professional: BookingProfessional
  date: string
  time: string
  isReschedule?: boolean
  onConfirm: (data: ConfirmData) => void
  onBack: () => void
}

interface SuccessScreenProps {
  service: BookingService
  professional: BookingProfessional
  date: string
  time: string
  onNew: () => void
}

export function SuccessScreen({ service, professional, date, time, onNew }: SuccessScreenProps) {
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-5 flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-success-xlight motion-reduce:animate-none">
        <CheckCircle2 size={44} className="text-success-medium" aria-hidden="true" />
      </div>
      <h2 className="text-[22px] font-bold text-content-primary">Agendamento confirmado!</h2>
      <p className="mt-2 text-body text-content-subtle">
        {service.emoji} {service.name} com {professional.name}
      </p>
      <p className="mt-1 text-body font-medium text-content-primary">
        {label.charAt(0).toUpperCase()}{label.slice(1)} às {time}
      </p>

      <div className="mt-6 rounded-xl border border-border bg-background px-5 py-4">
        <p className="text-[13px] text-content-secondary">📱 Confirmação enviada por WhatsApp e email</p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Link
          href="/booking/meus-agendamentos"
          className="w-full rounded-xl bg-primary py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Ver meus agendamentos
        </Link>
        <button
          type="button"
          onClick={onNew}
          className="w-full rounded-xl border border-border bg-white py-3.5 text-[15px] font-medium text-content-secondary transition-colors hover:border-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          Fazer outro agendamento
        </button>
      </div>
    </div>
  )
}

export default function StepConfirm({ service, professional, date, time, isReschedule, onConfirm, onBack }: StepConfirmProps) {
  const [name,  setName]  = useState('Maria Silva')
  const [phone, setPhone] = useState('(11) 99999-9999')
  const [email, setEmail] = useState('maria@email.com')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const [showCoupon,    setShowCoupon]    = useState(false)
  const [couponInput,   setCouponInput]   = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError,   setCouponError]   = useState('')
  const [applied, setApplied] = useState<{ valid: boolean; discount: number; label: string } | null>(null)

  const discount   = applied?.valid ? applied.discount : 0
  const finalPrice = service.price - discount

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponError('')
    setCouponLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const result = applyCoupon(couponInput.trim().toUpperCase(), service.price)
    if (result.valid) {
      setApplied(result)
      setCouponError('')
    } else {
      setApplied(null)
      setCouponError('Cupom inválido ou valor mínimo não atingido.')
    }
    setCouponLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    onConfirm({ name, phone, email, notes })
  }

  const inputCls = [
    'w-full rounded-xl border border-border bg-background px-4 py-3',
    'text-body text-content-primary placeholder:text-content-subtle',
    'focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light',
  ].join(' ')

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-[44px] items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">{isReschedule ? 'Confirmar reagendamento' : 'Confirmar agendamento'}</span>
      </button>

      <form onSubmit={handleSubmit} className="px-4 pb-6">
        <p className="mb-4 text-[16px] font-bold text-content-primary">{SALON.emoji} {SALON.name}</p>

        {/* Summary card */}
        <div className="mb-5 rounded-xl border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="text-[24px]" aria-hidden="true">{service.emoji}</span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-semibold text-content-primary">{service.name}</p>
              <p className="text-[13px] text-content-secondary">📅 {formatDateFull(date, time)}</p>
              <p className="text-[13px] text-content-secondary">👤 {professional.name}</p>
              <p className="text-[13px] text-content-secondary">⏱ {formatDuration(service.durationMins)}</p>
              {discount > 0 ? (
                <div className="flex items-baseline gap-2">
                  <p className="tabular-nums text-[13px] text-content-subtle line-through">{formatPrice(service.price)}</p>
                  <p className="tabular-nums text-[15px] font-bold text-success-medium">{formatPrice(finalPrice)}</p>
                  <span className="rounded-full bg-success-xlight px-1.5 py-0.5 text-[10px] font-semibold text-success-medium">
                    −{formatPrice(discount)}
                  </span>
                </div>
              ) : (
                <p className="tabular-nums text-[14px] font-semibold text-content-primary">💰 {formatPrice(service.price)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client fields */}
        <p className="mb-3 text-[14px] font-semibold text-content-primary">Seus dados</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="c-name" className="mb-1 block text-[12px] font-medium text-content-secondary">Nome completo</label>
            <input id="c-name" type="text" required placeholder="ex: Maria Silva" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-phone" className="mb-1 block text-[12px] font-medium text-content-secondary">Telefone</label>
            <input id="c-phone" type="tel" required placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-email" className="mb-1 block text-[12px] font-medium text-content-secondary">Email</label>
            <input id="c-email" type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-notes" className="mb-1 block text-[12px] font-medium text-content-secondary">
              Observações <span className="font-normal text-content-subtle">(opcional)</span>
            </label>
            <textarea
              id="c-notes"
              placeholder="ex: prefiro franja mais curta"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(inputCls, 'resize-none')}
            />
          </div>
        </div>

        {/* Coupon section */}
        <div className="mt-4">
          {!showCoupon ? (
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              <Tag size={14} aria-hidden="true" />
              Tenho um cupom de desconto
            </button>
          ) : (
            <div className="animate-fade-in motion-reduce:animate-none rounded-xl border border-border bg-background p-4">
              <label htmlFor="coupon-input" className="mb-2 block text-[12px] font-semibold text-content-secondary">
                Código do cupom
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  placeholder="ex: BELLA10"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); setApplied(null) }}
                  className={cn(
                    inputCls, 'flex-1 font-mono uppercase',
                    applied?.valid && 'border-success-medium bg-success-xlight',
                  )}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || couponLoading}
                  className={cn(
                    'shrink-0 rounded-xl px-4 py-3 text-[13px] font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
                    couponInput.trim() && !couponLoading
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'cursor-not-allowed bg-border text-content-muted',
                  )}
                >
                  {couponLoading
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    : 'Aplicar'}
                </button>
              </div>

              {applied?.valid && (
                <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-success-medium">
                  ✅ {applied.label} — {formatPrice(applied.discount)} de desconto
                </p>
              )}
              {couponError && (
                <p className="mt-2 text-[12px] text-danger-medium">{couponError}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
            : <CheckCircle2 size={18} aria-hidden="true" />}
          {loading ? 'Confirmando...' : isReschedule ? 'Confirmar Reagendamento' : 'Confirmar Agendamento'}
        </button>
        <p className="mt-2 text-center text-[11px] text-content-subtle">
          Você receberá confirmação por WhatsApp e email
        </p>
      </form>
    </div>
  )
}
