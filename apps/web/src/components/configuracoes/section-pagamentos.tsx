'use client'

import { useState } from 'react'
import { MOCK_PAYMENT_CONFIG, type PaymentConfig } from '@/lib/configuracoes-mock'
import { Toggle, TextInput, SelectInput, FieldLabel, SectionCard, SaveButton, useSaveState } from './_primitives'

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
  const [cfg, setCfg] = useState<PaymentConfig>(MOCK_PAYMENT_CONFIG)
  const [saveState, triggerSave] = useSaveState()

  function set<K extends keyof PaymentConfig>(field: K, value: PaymentConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
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
          </div>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar configurações" />
        </div>
      </div>
    </div>
  )
}
