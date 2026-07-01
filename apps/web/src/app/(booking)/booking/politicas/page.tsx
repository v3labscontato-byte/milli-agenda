'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Clock, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import { usePublicTenant } from '@/hooks/use-public-tenant'

const DAY_LABELS: Record<string, string> = {
  mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta',
  fri: 'Sexta', sat: 'Sábado', sun: 'Domingo',
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
  DEBIT_CARD: 'Cartão de Débito',
  CREDIT_CARD: 'Cartão de Crédito',
  VOUCHER: 'Voucher',
  BANK_TRANSFER: 'Transferência Bancária',
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-primary" aria-hidden="true">{icon}</span>
      <h2 className="text-[15px] font-semibold text-content-primary">{title}</h2>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 space-y-3">
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[13px] text-content-secondary">{label}</span>
      <span className="text-[13px] font-medium text-content-primary text-right">{value}</span>
    </div>
  )
}

export default function PoliticasPage() {
  const router = useRouter()
  const { tenant, loading } = usePublicTenant()

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#E2E8F0]" />
          <div className="h-5 w-40 animate-pulse rounded bg-[#E2E8F0]" />
        </div>
        <div className="space-y-4 px-5 py-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E2E8F0]" />
          ))}
        </div>
      </div>
    )
  }

  const hours = tenant?.businessHours?.days ?? []
  const openDays = hours.filter((d) => d.open)
  const closedDays = hours.filter((d) => !d.open)
  const lunchBreak = tenant?.businessHours?.lunchBreak

  const depositRequired = tenant?.depositRequired ?? false
  const depositType = tenant?.depositType ?? 'none'
  const depositValue = tenant?.depositValue ?? null
  const cancelHours = tenant?.cancellationMinHours ?? 0
  const cancelFee = tenant?.cancellationFeePercent ?? 0
  const refundSignal = tenant?.cancellationRefundSignal ?? true

  const paymentMethods = tenant?.acceptedPaymentMethods ?? []

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-[16px] font-semibold text-content-primary">Políticas do Salão</h1>
      </div>

      <div className="space-y-5 px-5 py-5">

        {/* Horários */}
        <div>
          <SectionTitle icon={<Clock size={18} />} title="Horários de Funcionamento" />
          <Card>
            {openDays.length === 0 && (
              <p className="text-[13px] text-content-subtle">Sem horários cadastrados.</p>
            )}
            {openDays.map((d) => (
              <Row key={d.day} label={DAY_LABELS[d.day] ?? d.day} value={`${d.start} – ${d.end}`} />
            ))}
            {lunchBreak?.active && (
              <div className="border-t border-[#F1F5F9] pt-3">
                <Row label="Intervalo de almoço" value={`${lunchBreak.start} – ${lunchBreak.end}`} />
              </div>
            )}
            {closedDays.length > 0 && (
              <div className="border-t border-[#F1F5F9] pt-3">
                <p className="text-[12px] text-content-subtle">
                  Fechado: {closedDays.map((d) => DAY_LABELS[d.day] ?? d.day).join(', ')}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Formas de pagamento */}
        <div>
          <SectionTitle icon={<CreditCard size={18} />} title="Formas de Pagamento" />
          <Card>
            {paymentMethods.length === 0 && (
              <p className="text-[13px] text-content-subtle">Não informado.</p>
            )}
            {paymentMethods.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0 text-[#16A34A]" aria-hidden="true" />
                <span className="text-[13px] text-content-primary">{PAYMENT_LABELS[m] ?? m}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Política de sinal */}
        <div>
          <SectionTitle icon={<CreditCard size={18} />} title="Política de Sinal" />
          <Card>
            {!depositRequired || depositType === 'none' ? (
              <p className="text-[13px] text-content-secondary">Não é exigido sinal para agendamentos.</p>
            ) : (
              <>
                <Row
                  label="Sinal exigido"
                  value={
                    depositType === 'percentage'
                      ? `${depositValue ?? 0}% do valor total`
                      : depositValue != null
                        ? `R$ ${Number(depositValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Sim'
                  }
                />
              </>
            )}
          </Card>
        </div>

        {/* Política de cancelamento */}
        <div>
          <SectionTitle icon={<AlertTriangle size={18} />} title="Política de Cancelamento" />
          <Card>
            <Row
              label="Cancelamento gratuito até"
              value={
                cancelHours === 0
                  ? 'Sem prazo mínimo'
                  : cancelHours === 1
                    ? '1 hora antes'
                    : `${cancelHours} horas antes`
              }
            />
            <Row
              label="Multa por cancelamento tardio"
              value={cancelFee === 0 ? 'Sem multa' : `${cancelFee}% do valor`}
            />
            {depositRequired && depositType !== 'none' && (
              <Row
                label="Devolução do sinal"
                value={refundSignal ? 'Devolvido se cancelado no prazo' : 'Não devolvido'}
              />
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
