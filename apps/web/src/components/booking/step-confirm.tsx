'use client'

import { useState } from 'react'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SALON, formatDuration, formatPrice, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

const SUCCESS_ANIM = `
  @keyframes bkScaleIn {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bk-scale-in { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`

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
      <style>{SUCCESS_ANIM}</style>
      <div
        className="bk-scale-in mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]"
        style={{ animation: 'bkScaleIn 400ms cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <CheckCircle2 size={44} className="text-[#16A34A]" aria-hidden="true" />
      </div>
      <h2 className="text-[22px] font-bold text-[#0F172A]">Agendamento confirmado!</h2>
      <p className="mt-2 text-[14px] text-[#64748B]">
        {service.emoji} {service.name} com {professional.name}
      </p>
      <p className="mt-1 text-[14px] font-medium text-[#0F172A]">
        {label.charAt(0).toUpperCase()}{label.slice(1)} às {time}
      </p>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
        <p className="text-[13px] text-[#475569]">
          📱 Confirmação enviada por WhatsApp e email
        </p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Link
          href="/booking/meus-agendamentos"
          className="w-full rounded-xl bg-[#2563EB] py-3.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
        >
          Ver meus agendamentos
        </Link>
        <button
          type="button"
          onClick={onNew}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-[15px] font-medium text-[#475569] transition-colors hover:border-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
        >
          Fazer outro agendamento
        </button>
      </div>
    </div>
  )
}

export default function StepConfirm({ service, professional, date, time, onConfirm, onBack }: StepConfirmProps) {
  const [name,  setName]  = useState('Maria Silva')
  const [phone, setPhone] = useState('(11) 99999-9999')
  const [email, setEmail] = useState('maria@email.com')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    onConfirm({ name, phone, email, notes })
  }

  // placeholder:text-[#64748B] → meets 4.6:1 on white
  const inputCls = 'w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]'

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 text-[14px] text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE] rounded-lg"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">Confirmar agendamento</span>
      </button>

      <form onSubmit={handleSubmit} className="px-4 pb-6">
        {/* Salon name */}
        <p className="mb-4 text-[16px] font-bold text-[#0F172A]">{SALON.emoji} {SALON.name}</p>

        {/* Summary card */}
        <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-start gap-3">
            <span className="text-[24px]" aria-hidden="true">{service.emoji}</span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-semibold text-[#0F172A]">{service.name}</p>
              <p className="text-[13px] text-[#475569]">📅 {formatDateFull(date, time)}</p>
              <p className="text-[13px] text-[#475569]">👤 {professional.name}</p>
              <p className="text-[13px] text-[#475569]">⏱ {formatDuration(service.durationMins)}</p>
              <p className="text-[14px] font-semibold text-[#0F172A]">💰 {formatPrice(service.price)}</p>
            </div>
          </div>
        </div>

        {/* Client fields */}
        <p className="mb-3 text-[14px] font-semibold text-[#0F172A]">Seus dados</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="c-name" className="sr-only">Nome</label>
            <input id="c-name" type="text" required placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-phone" className="sr-only">Telefone</label>
            <input id="c-phone" type="tel" required placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-email" className="sr-only">Email</label>
            <input id="c-email" type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-notes" className="sr-only">Observações</label>
            <textarea
              id="c-notes"
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(inputCls, 'resize-none')}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={18} aria-hidden="true" />
          )}
          {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </button>
        <p className="mt-2 text-center text-[11px] text-[#64748B]">
          Você receberá confirmação por WhatsApp e email
        </p>
      </form>
    </div>
  )
}
