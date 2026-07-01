'use client'

import { useState, useEffect } from 'react'
import { type PaymentConfig } from '@/lib/configuracoes-mock'
import { Toggle, TextInput, SelectInput, FieldLabel, SectionCard, SaveButton, type SaveState } from './_primitives'
import { useConfiguracoes } from '@/hooks/use-configuracoes'

const DEFAULT_CFG: PaymentConfig = {
  pix: false,
  pixKey: '',
  cash: false,
  debit: false,
  credit: false,
  creditMaxInstallments: 1,
  voucher: false,
  transfer: false,
  requireDeposit: false,
  depositPercent: 30,
  freeCancelHours: 24,
  lateCancelFeePercent: 0,
  cancellationRefundSignal: true,
}

const METHOD_TO_KEY: Record<string, keyof Pick<PaymentConfig, 'pix' | 'cash' | 'debit' | 'credit' | 'voucher' | 'transfer'>> = {
  PIX: 'pix',
  CASH: 'cash',
  DEBIT_CARD: 'debit',
  CREDIT_CARD: 'credit',
  VOUCHER: 'voucher',
  BANK_TRANSFER: 'transfer',
}

const KEY_TO_METHOD: Record<string, string> = {
  pix: 'PIX',
  cash: 'CASH',
  debit: 'DEBIT_CARD',
  credit: 'CREDIT_CARD',
  voucher: 'VOUCHER',
  transfer: 'BANK_TRANSFER',
}

interface PaymentRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  children?: React.ReactNode
}

function PaymentRow({ label, checked, onChange, children }: PaymentRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Toggle checked={checked} onChange={onChange} label={label} />
        <span className="text-[13px] font-medium text-[#0F172A]">{label}</span>
      </div>
      {checked && children && <div className="ml-12">{children}</div>}
    </div>
  )
}

export default function SectionPagamentos() {
  const { settings, loading, update } = useConfiguracoes()
  const [cfg, setCfg] = useState<PaymentConfig>(DEFAULT_CFG)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!settings) return
    const methods: string[] = Array.isArray(settings.acceptedPaymentMethods)
      ? settings.acceptedPaymentMethods
      : []
    setCfg((prev) => ({
      ...prev,
      pix: methods.includes('PIX'),
      cash: methods.includes('CASH'),
      debit: methods.includes('DEBIT_CARD'),
      credit: methods.includes('CREDIT_CARD'),
      voucher: methods.includes('VOUCHER'),
      transfer: methods.includes('BANK_TRANSFER'),
      requireDeposit: settings.depositRequired ?? false,
      depositPercent: settings.depositType === 'percentage'
        ? (settings.depositValue ?? 30)
        : 30,
      freeCancelHours: settings.cancellationMinHours ?? 24,
      lateCancelFeePercent: settings.cancellationFeePercent ?? 0,
      cancellationRefundSignal: settings.cancellationRefundSignal ?? true,
    }))
  }, [settings])

  function set<K extends keyof PaymentConfig>(field: K, value: PaymentConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaveError('')
    setSaveState('saving')
    const enabledMethods = (Object.keys(KEY_TO_METHOD) as Array<keyof typeof KEY_TO_METHOD>)
      .filter((k) => cfg[k as keyof PaymentConfig] === true)
      .map((k) => KEY_TO_METHOD[k])

    const result = await update({
      acceptedPaymentMethods: enabledMethods,
      depositRequired: cfg.requireDeposit,
      depositType: cfg.requireDeposit ? 'percentage' : 'none',
      depositValue: cfg.requireDeposit ? cfg.depositPercent : null,
      cancellationMinHours: cfg.freeCancelHours,
      cancellationFeePercent: cfg.lateCancelFeePercent,
      cancellationRefundSignal: cfg.cancellationRefundSignal,
    })
    if (result.success) {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } else {
      setSaveError(result.error ?? 'Erro ao salvar')
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
          <div className="h-6 w-48 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#E2E8F0]" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Pagamentos</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Configure os métodos aceitos e políticas financeiras do salão.
          </p>
        </div>

        {/* Métodos de pagamento */}
        <SectionCard title="Métodos Aceitos">
          <div className="space-y-4">
            <PaymentRow label="PIX" checked={cfg.pix} onChange={(v) => set('pix', v)}>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="pix-key">Chave PIX</FieldLabel>
                <TextInput
                  id="pix-key"
                  value={cfg.pixKey}
                  onChange={(v) => set('pixKey', v)}
                  placeholder="CNPJ, e-mail, telefone ou chave aleatória"
                  className="max-w-sm"
                />
              </div>
            </PaymentRow>

            <div className="border-t border-[#F1F5F9] pt-4">
              <PaymentRow label="Dinheiro" checked={cfg.cash} onChange={(v) => set('cash', v)} />
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <PaymentRow label="Cartão de Débito" checked={cfg.debit} onChange={(v) => set('debit', v)} />
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <PaymentRow label="Cartão de Crédito" checked={cfg.credit} onChange={(v) => set('credit', v)}>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#64748B]">Parcelamento em até</span>
                  <SelectInput
                    id="credit-installments"
                    value={cfg.creditMaxInstallments}
                    onChange={(v) => set('creditMaxInstallments', Number(v))}
                    className="w-24"
                  >
                    {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </SelectInput>
                </div>
              </PaymentRow>
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <PaymentRow label="Voucher" checked={cfg.voucher} onChange={(v) => set('voucher', v)} />
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <PaymentRow label="Transferência Bancária" checked={cfg.transfer} onChange={(v) => set('transfer', v)} />
            </div>
          </div>
        </SectionCard>

        {/* Política de sinal */}
        <SectionCard title="Política de Sinal">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Toggle
                checked={cfg.requireDeposit}
                onChange={(v) => set('requireDeposit', v)}
                label="Exigir sinal para agendamentos online"
              />
              <span className="text-[13px] text-[#0F172A]">Exigir sinal para agendamentos online</span>
            </div>
            {cfg.requireDeposit && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#64748B]">Percentual do sinal:</span>
                <SelectInput
                  id="deposit-percent"
                  value={cfg.depositPercent}
                  onChange={(v) => set('depositPercent', Number(v))}
                  className="w-24"
                >
                  {[10, 20, 25, 30, 40, 50].map((n) => (
                    <option key={n} value={n}>{n}%</option>
                  ))}
                </SelectInput>
                <span className="text-[13px] text-[#64748B]">do valor total</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Política de cancelamento */}
        <SectionCard title="Política de Cancelamento">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#0F172A]">Cancelamento gratuito até</span>
              <SelectInput
                id="cancel-hours"
                value={cfg.freeCancelHours}
                onChange={(v) => set('freeCancelHours', Number(v))}
                className="w-28"
              >
                <option value={0}>Sem prazo</option>
                <option value={1}>1 hora</option>
                <option value={2}>2 horas</option>
                <option value={4}>4 horas</option>
                <option value={12}>12 horas</option>
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
              </SelectInput>
              <span className="text-[13px] text-[#64748B]">antes do horário</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#0F172A]">Multa por cancelamento tardio</span>
              <SelectInput
                id="cancel-fee"
                value={cfg.lateCancelFeePercent}
                onChange={(v) => set('lateCancelFeePercent', Number(v))}
                className="w-24"
              >
                <option value={0}>Sem multa</option>
                <option value={25}>25%</option>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
              </SelectInput>
              <span className="text-[13px] text-[#64748B]">do valor</span>
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                checked={cfg.cancellationRefundSignal}
                onChange={(v) => set('cancellationRefundSignal', v)}
                label="Devolver sinal em caso de cancelamento dentro do prazo"
              />
              <span className="text-[13px] text-[#0F172A]">Devolver sinal em caso de cancelamento dentro do prazo</span>
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col items-end gap-2 pb-6">
          {saveError && (
            <p className="text-[12px] text-[#DC2626]" role="alert">{saveError}</p>
          )}
          <SaveButton state={saveState} onClick={() => { void handleSave() }} label="Salvar configurações" />
        </div>
      </div>
    </div>
  )
}
