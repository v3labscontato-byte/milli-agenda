'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MOCK_AFILIADOS_CONFIG, type AfiliadosConfig } from '@/lib/configuracoes-mock'
import { Toggle, SectionCard, SaveButton, useSaveState, FieldLabel, SelectInput } from './_primitives'

const EXPIRATION_OPTIONS = [
  { value: 3,  label: '3 meses'  },
  { value: 6,  label: '6 meses'  },
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' },
]

const NUM = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'transition-colors duration-150',
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
)

export default function SectionAfiliados() {
  const [cfg, setCfg] = useState<AfiliadosConfig>(MOCK_AFILIADOS_CONFIG)
  const [saveState, triggerSave] = useSaveState()

  function set<K extends keyof AfiliadosConfig>(field: K, value: AfiliadosConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
  }

  const expiryLabel = EXPIRATION_OPTIONS.find((o) => o.value === cfg.expirationMonths)?.label ?? ''

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">

        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Programa de Afiliados</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Recompense clientes que indicam novos clientes para o salão.
          </p>
        </div>

        <SectionCard title="Status do Programa">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">Ativar programa de afiliados</p>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                Clientes recebem créditos ao indicar novos agendamentos
              </p>
            </div>
            <Toggle
              checked={cfg.active}
              onChange={(v) => set('active', v)}
              label="Ativar programa de afiliados"
            />
          </div>
        </SectionCard>

        <SectionCard title="Comissão">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="aff-commission">Percentual de comissão</FieldLabel>
              <div className="relative">
                <input
                  id="aff-commission"
                  type="number"
                  min={1}
                  max={50}
                  value={cfg.commissionPercent}
                  onChange={(e) => set('commissionPercent', Number(e.target.value))}
                  disabled={!cfg.active}
                  className={cn(NUM, 'pr-8', !cfg.active && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]"
                  aria-hidden="true"
                >
                  %
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">Sobre o valor do serviço indicado</p>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="aff-min">Valor mínimo para resgate</FieldLabel>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]"
                  aria-hidden="true"
                >
                  R$
                </span>
                <input
                  id="aff-min"
                  type="number"
                  min={10}
                  step={10}
                  value={cfg.minRedemptionBRL}
                  onChange={(e) => set('minRedemptionBRL', Number(e.target.value))}
                  disabled={!cfg.active}
                  className={cn(NUM, 'pl-9', !cfg.active && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}
                />
              </div>
              <p className="text-[11px] text-[#94A3B8]">Saldo mínimo para usar créditos</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Expiração de Créditos">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="aff-expiry">Prazo de expiração dos créditos</FieldLabel>
            <SelectInput
              id="aff-expiry"
              value={cfg.expirationMonths}
              onChange={(v) => set('expirationMonths', Number(v))}
              disabled={!cfg.active}
            >
              {EXPIRATION_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </SelectInput>
            <p className="text-[11px] text-[#94A3B8]">
              Créditos não utilizados expiram após este período
            </p>
          </div>
        </SectionCard>

        {cfg.active && (
          <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3.5">
            <p className="text-[12px] font-semibold text-[#1D4ED8]">Como funciona</p>
            <ul className="mt-2 space-y-1 text-[12px] text-[#475569]">
              <li>• Cliente A indica Cliente B → Cliente A recebe {cfg.commissionPercent}% do 1.º serviço de B</li>
              <li>• Créditos acumulam e podem ser resgatados a partir de R${cfg.minRedemptionBRL}</li>
              <li>• Créditos não utilizados expiram em {expiryLabel}</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} />
        </div>
      </div>
    </div>
  )
}
