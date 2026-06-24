'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLIENT, AFILIADOS, formatPrice, type BookingAffiliate } from '@/lib/booking-mock'
import AfiliadosSection from '@/components/booking/afiliados-section'

const HOW_IT_WORKS = [
  { n: '1️⃣', text: 'Compartilhe seu link único' },
  { n: '2️⃣', text: 'Amigo agenda pelo seu link' },
  { n: '3️⃣', text: 'Amigo finaliza o atendimento' },
  { n: '4️⃣', text: 'Você ganha 5% do valor! 💰' },
]

function AfiliadoCard({ af }: { af: BookingAffiliate }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-content-primary">{af.friendName}</p>
          <p className="mt-0.5 text-[12px] text-content-secondary">{af.service} · {af.date}</p>
        </div>
        <span className={cn(
          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
          af.status === 'completed'
            ? 'bg-status-confirmed-bg text-status-confirmed-text'
            : 'bg-status-scheduled-bg text-status-scheduled-text',
        )}>
          {af.status === 'completed' ? '✅ Concluído' : '⏳ Aguardando'}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[12px] text-content-subtle">Serviço: {formatPrice(af.amount)}</p>
        <p className={cn('text-[13px] font-semibold', af.status === 'completed' ? 'text-success-medium' : 'text-content-subtle')}>
          {af.status === 'completed' ? '+' : ''}{formatPrice(af.commission)}
          {af.status === 'pending' && ' pendente'}
        </p>
      </div>
    </div>
  )
}

export default function AfiliadosPage() {
  const router = useRouter()
  const [redeeming, setRedeeming] = useState(false)
  const [redeemed, setRedeemed]   = useState(false)
  const totalEarned  = AFILIADOS.filter((a) => a.status === 'completed').reduce((s, a) => s + a.commission, 0)
  const totalPending = AFILIADOS.filter((a) => a.status === 'pending').reduce((s, a) => s + a.commission, 0)
  const canRedeem    = CLIENT.creditoAfiliado >= 20

  async function handleRedeem() {
    setRedeeming(true)
    await new Promise((r) => setTimeout(r, 800))
    setRedeeming(false)
    setRedeemed(true)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 rounded-lg px-4 py-3 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light"
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="font-medium">Programa de Afiliados</span>
      </button>

      <div className="space-y-6 px-5 pb-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-xlight to-white p-5">
          <h1 className="text-[18px] font-bold text-content-primary">💰 Ganhe indicando o salão!</h1>
          <p className="mt-1 text-[13px] text-content-subtle">Percentual configurado pelo salão</p>
          <div className="mt-4 space-y-2">
            {HOW_IT_WORKS.map((s) => (
              <p key={s.n} className="flex items-start gap-2 text-[13px] text-content-primary">
                <span aria-hidden="true">{s.n}</span>
                {s.text}
              </p>
            ))}
          </div>
        </div>

        {/* Referral link & share */}
        <AfiliadosSection />

        {/* Performance */}
        <section aria-labelledby="perf-heading">
          <h2 id="perf-heading" className="mb-3 text-[14px] font-semibold text-content-primary">
            Seu desempenho
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: formatPrice(CLIENT.creditoAfiliado), label: 'em créditos' },
              { value: `${AFILIADOS.length}`,               label: 'indicados' },
              { value: `${AFILIADOS.filter((a) => a.status === 'completed').length}`, label: 'concluídos' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-border bg-white px-2 py-4 text-center">
                <p className="text-[16px] font-bold text-content-primary">{value}</p>
                <p className="text-[10px] text-content-subtle">{label}</p>
              </div>
            ))}
          </div>
          {totalPending > 0 && (
            <p className="mt-2 text-[11px] text-content-subtle text-center">
              + {formatPrice(totalPending)} pendente de liberação
            </p>
          )}
        </section>

        {/* Redeem */}
        {!redeemed ? (
          <button
            type="button"
            disabled={!canRedeem || redeeming}
            onClick={handleRedeem}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
              canRedeem && !redeeming
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'cursor-not-allowed bg-background-secondary text-content-muted',
            )}
          >
            {redeeming
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              : null}
            {canRedeem
              ? redeeming ? 'Resgatando...' : `Resgatar ${formatPrice(CLIENT.creditoAfiliado)}`
              : `Mínimo R$20 para resgate (${formatPrice(CLIENT.creditoAfiliado)} disponível)`}
          </button>
        ) : (
          <div className="animate-scale-in rounded-2xl bg-success-xlight p-5 text-center motion-reduce:animate-none">
            <p className="text-[16px] font-bold text-success-medium">✅ Resgate solicitado!</p>
            <p className="mt-1 text-[13px] text-content-secondary">{formatPrice(CLIENT.creditoAfiliado)} serão creditados no próximo agendamento</p>
          </div>
        )}

        {/* Regras */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="mb-2 text-[12px] font-semibold text-content-secondary">Regras do programa</p>
          {[
            'Crédito liberado apenas após atendimento finalizado',
            'Não vale para cancelamentos ou no-shows',
            'Resgate mínimo: R$20',
            'Crédito expira em 12 meses',
            'Não acumulável com outros descontos',
          ].map((r) => (
            <p key={r} className="flex items-start gap-1.5 text-[11px] text-content-subtle">
              <span aria-hidden="true">·</span>{r}
            </p>
          ))}
        </div>

        {/* History */}
        <section aria-labelledby="hist-heading">
          <h2 id="hist-heading" className="mb-3 text-[14px] font-semibold text-content-primary">
            Histórico de indicações
          </h2>
          {AFILIADOS.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-content-subtle">Nenhuma indicação ainda. Compartilhe seu link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {AFILIADOS.map((af) => <AfiliadoCard key={af.id} af={af} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
