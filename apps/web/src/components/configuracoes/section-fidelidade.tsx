'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_FIDELIDADE_CONFIG, type FidelidadeConfig } from '@/lib/configuracoes-mock'
import { Toggle, SectionCard, SaveButton, useSaveState, FieldLabel } from './_primitives'

const NUM = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'transition-colors duration-150',
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
)

export default function SectionFidelidade() {
  const [cfg, setCfg] = useState<FidelidadeConfig>(MOCK_FIDELIDADE_CONFIG)
  const [saveState, triggerSave] = useSaveState()

  function set<K extends keyof FidelidadeConfig>(field: K, value: FidelidadeConfig[K]) {
    setCfg((prev) => ({ ...prev, [field]: value }))
  }

  function updateNivelPts(idx: number, minPts: number) {
    setCfg((prev) => ({
      ...prev,
      niveis: prev.niveis.map((n, i) => (i === idx ? { ...n, minPts } : n)),
    }))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">

        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Programa de Fidelidade</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Recompense clientes frequentes com pontos e benefícios exclusivos.
          </p>
        </div>

        <SectionCard title="Status do Programa">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">Ativar programa de fidelidade</p>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                Clientes acumulam pontos a cada serviço realizado
              </p>
            </div>
            <Toggle
              checked={cfg.active}
              onChange={(v) => set('active', v)}
              label="Ativar programa de fidelidade"
            />
          </div>
        </SectionCard>

        <SectionCard title="Acúmulo de Pontos">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="fid-ppr">Pontos por R$1 gasto</FieldLabel>
              <input
                id="fid-ppr"
                type="number"
                min={1}
                step={1}
                value={cfg.pointsPerReal}
                onChange={(e) => set('pointsPerReal', Number(e.target.value))}
                disabled={!cfg.active}
                aria-label="Pontos por real gasto"
                className={cn(NUM, !cfg.active && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}
              />
              <p className="text-[11px] text-[#94A3B8]">Padrão: 1 ponto</p>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="fid-pval">Valor do ponto (R$)</FieldLabel>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]"
                  aria-hidden="true"
                >
                  R$
                </span>
                <input
                  id="fid-pval"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={cfg.pointValueBRL}
                  onChange={(e) => set('pointValueBRL', Number(e.target.value))}
                  disabled={!cfg.active}
                  aria-label="Valor do ponto em reais"
                  className={cn(NUM, 'pl-9', !cfg.active && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}
                />
              </div>
              <p className="text-[11px] text-[#94A3B8]">Padrão: R$0,10</p>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="fid-rev">Pontos por avaliação</FieldLabel>
              <input
                id="fid-rev"
                type="number"
                min={0}
                step={10}
                value={cfg.pointsPerReview}
                onChange={(e) => set('pointsPerReview', Number(e.target.value))}
                disabled={!cfg.active}
                aria-label="Pontos por avaliação deixada"
                className={cn(NUM, !cfg.active && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]')}
              />
              <p className="text-[11px] text-[#94A3B8]">Padrão: 50 pontos</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Níveis de Fidelidade">
          <p className="mb-4 text-[12px] text-[#64748B]">
            Configure os pontos mínimos para cada nível. O nível Bronze começa em 0 e não pode ser alterado.
          </p>
          <div className="overflow-hidden rounded-md border border-[#E2E8F0]">
            <table className="w-full" aria-label="Níveis de fidelidade">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    Nível
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    Pontos mínimos
                  </th>
                </tr>
              </thead>
              <tbody>
                {cfg.niveis.map((nivel, idx) => {
                  const locked = idx === 0
                  return (
                    <tr key={nivel.name} className="border-b border-[#F1F5F9] last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: nivel.color }}
                            aria-hidden="true"
                          >
                            <Star size={11} className="text-white" />
                          </span>
                          <span className="text-[13px] font-medium text-[#0F172A]">{nivel.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={locked ? 0 : (cfg.niveis[idx - 1]?.minPts ?? 0) + 1}
                          step={100}
                          value={nivel.minPts}
                          onChange={(e) => updateNivelPts(idx, Number(e.target.value))}
                          disabled={!cfg.active || locked}
                          aria-label={`Pontos mínimos para ${nivel.name}`}
                          className={cn(
                            'w-28 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-right text-[13px] text-[#0F172A]',
                            'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                            'transition-colors duration-150',
                            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                            (!cfg.active || locked) && 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]',
                          )}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {cfg.active && (
          <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3.5">
            <p className="text-[12px] font-semibold text-[#16A34A]">Resumo da configuração</p>
            <ul className="mt-2 space-y-1 text-[12px] text-[#475569]">
              <li>• {cfg.pointsPerReal} ponto(s) por R$1 gasto = cada ponto vale R${cfg.pointValueBRL.toFixed(2)}</li>
              <li>• Avaliação deixada = +{cfg.pointsPerReview} pontos bônus</li>
              <li>• Níveis: {cfg.niveis.map((n) => `${n.name} (${n.minPts}+ pts)`).join(' → ')}</li>
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
