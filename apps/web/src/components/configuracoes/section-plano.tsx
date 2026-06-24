'use client'

import { Download, Zap, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_PLAN_INFO, MOCK_INVOICES, type PlanTier } from '@/lib/configuracoes-mock'

interface PlanColumn {
  tier: PlanTier
  label: string
  price: number
  professionals: string
  clients: string
  reports: string
  api: boolean
  whiteLabel: boolean
}

const PLANS: PlanColumn[] = [
  { tier: 'starter',  label: 'STARTER',  price: 49,  professionals: '2',  clients: '200',     reports: 'Básico',   api: false, whiteLabel: false },
  { tier: 'growth',   label: 'GROWTH',   price: 149, professionals: '6',  clients: 'Ilimit.', reports: 'Avançado', api: false, whiteLabel: false },
  { tier: 'business', label: 'BUSINESS', price: 299, professionals: '15', clients: 'Ilimit.', reports: 'Avançado', api: true,  whiteLabel: true  },
]

export default function SectionPlano() {
  const plan = MOCK_PLAN_INFO
  const usagePct = Math.round((plan.professionalsUsed / plan.professionalsLimit) * 100)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Plano & Billing</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">Gerencie sua assinatura e histórico de cobranças.</p>
        </div>

        {/* Current plan */}
        <div className="rounded-lg border-2 border-[#2563EB] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#2563EB]" aria-hidden="true" />
                <span className="text-[15px] font-bold text-[#0F172A]">GROWTH</span>
              </div>
              <p className="mt-1 text-[13px] text-[#64748B]">
                R$ {plan.price}/mês · Próximo vencimento: {plan.nextBillingDate}
              </p>
            </div>
            <span className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
              ATIVO
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#475569]">Profissionais</span>
              <span className="font-medium text-[#0F172A]">
                {plan.professionalsUsed} de {plan.professionalsLimit}
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
              role="progressbar"
              aria-valuenow={plan.professionalsUsed}
              aria-valuemax={plan.professionalsLimit}
              aria-label="Uso de profissionais"
            >
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-300 motion-reduce:transition-none"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {[
              { ok: true,  text: `Até ${plan.professionalsLimit} profissionais (usando ${plan.professionalsUsed})` },
              { ok: true,  text: 'Clientes ilimitados' },
              { ok: true,  text: 'Relatórios avançados' },
              { ok: false, text: 'API pública (disponível no Business)' },
              { ok: false, text: 'White Label (disponível no Business)' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2 text-[13px]">
                {item.ok
                  ? <CheckCircle2 size={13} className="shrink-0 text-[#10B981]" aria-hidden="true" />
                  : <XCircle     size={13} className="shrink-0 text-[#CBD5E1]" aria-hidden="true" />
                }
                <span className={item.ok ? 'text-[#0F172A]' : 'text-[#94A3B8]'}>{item.text}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={cn(
              'mt-4 w-full rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white',
              'transition-colors hover:bg-[#1D4ED8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
            )}
          >
            Fazer upgrade para Business
          </button>
        </div>

        {/* Comparison table */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] overflow-hidden">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <p className="text-[14px] font-semibold text-[#0F172A]">Comparar Planos</p>
          </div>
          <table className="w-full" aria-label="Comparação de planos">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
                  Recurso
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.tier}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.06em]',
                      p.tier === plan.tier ? 'text-[#2563EB]' : 'text-[#94A3B8]',
                    )}
                  >
                    {p.label}
                    {p.tier === plan.tier && (
                      <span className="ml-1 font-normal text-[#2563EB]">✓</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(
                [
                  { label: 'Preço',          key: 'price'         as const, render: (v: PlanColumn) => `R$${v.price}/mês` },
                  { label: 'Profissionais',  key: 'professionals' as const, render: (v: PlanColumn) => v.professionals      },
                  { label: 'Clientes',       key: 'clients'       as const, render: (v: PlanColumn) => v.clients             },
                  { label: 'Relatórios',     key: 'reports'       as const, render: (v: PlanColumn) => v.reports             },
                  { label: 'API pública',    key: 'api'           as const, render: (v: PlanColumn) => v.api    ? '✓' : '✗'  },
                  { label: 'White Label',    key: 'whiteLabel'    as const, render: (v: PlanColumn) => v.whiteLabel ? '✓' : '✗' },
                ] as const
              ).map(({ label, render }) => (
                <tr key={label}>
                  <td className="px-5 py-3 text-[13px] text-[#475569]">{label}</td>
                  {PLANS.map((p) => {
                    const val = render(p)
                    const isCheck = val === '✓'
                    const isCross = val === '✗'
                    return (
                      <td
                        key={p.tier}
                        className={cn(
                          'px-4 py-3 text-center text-[13px]',
                          p.tier === plan.tier ? 'bg-[#EFF6FF]' : '',
                          isCheck ? 'text-[#10B981]' : isCross ? 'text-[#CBD5E1]' : 'text-[#0F172A]',
                        )}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoices */}
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <p className="text-[14px] font-semibold text-[#0F172A]">Histórico de Faturas</p>
          </div>
          <ul className="divide-y divide-[#F1F5F9]" role="list">
            {MOCK_INVOICES.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-4">
                  <span className="font-tabular text-[13px] text-[#64748B]">{inv.date}</span>
                  <span className="font-tabular text-[13px] font-semibold text-[#0F172A]">
                    R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[11px] font-medium text-[#065F46]">
                    Pago
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Baixar nota fiscal de ${inv.date}`}
                  className="flex items-center gap-1.5 text-[12px] text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
                >
                  <Download size={12} aria-hidden="true" />
                  Baixar NF
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  )
}
