'use client'

import { Zap, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfiguracoes } from '@/hooks/use-configuracoes'

interface PlanColumn {
  key: string
  label: string
  price: number
  professionals: string
  clients: string
  reports: string
  api: boolean
  whiteLabel: boolean
}

const PLANS: PlanColumn[] = [
  { key: 'STARTER',      label: 'STARTER',      price: 49,  professionals: '2',  clients: '200',     reports: 'Básico',   api: false, whiteLabel: false },
  { key: 'PROFESSIONAL', label: 'PROFESSIONAL', price: 149, professionals: '6',  clients: 'Ilimit.', reports: 'Avançado', api: false, whiteLabel: false },
  { key: 'ENTERPRISE',   label: 'ENTERPRISE',   price: 299, professionals: '15', clients: 'Ilimit.', reports: 'Avançado', api: true,  whiteLabel: true  },
]

const PLAN_LABELS: Record<string, string> = {
  TRIAL:        'TRIAL',
  STARTER:      'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE:   'ENTERPRISE',
}

const TRIAL_DAYS = 15

function trialDaysRemaining(trialEndsAt: string | null, createdAt: string): number {
  const end = trialEndsAt
    ? new Date(trialEndsAt)
    : new Date(new Date(createdAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
  const diffMs = end.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
}

export default function SectionPlano() {
  const { settings, loading, error } = useConfiguracoes()

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
          <div className="h-6 w-48 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-48 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#E2E8F0]" />
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-8 py-6">
          <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-[13px] text-[#DC2626]" role="alert">
            {error ?? 'Erro ao carregar plano'}
          </div>
        </div>
      </div>
    )
  }

  const plan = settings.plan?.toUpperCase() ?? 'TRIAL'
  const isTrial = plan === 'TRIAL'
  const planLabel = PLAN_LABELS[plan] ?? plan
  const daysLeft = isTrial ? trialDaysRemaining(settings.trialEndsAt, settings.createdAt) : 0

  // The plan column to highlight: trial users see PROFESSIONAL as the suggested tier
  const highlightedKey = isTrial ? 'PROFESSIONAL' : plan
  const currentPlanColumn = PLANS.find((p) => p.key === plan)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Plano &amp; Billing</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">Gerencie sua assinatura e veja os planos disponíveis.</p>
        </div>

        {/* Current plan */}
        <div className="rounded-lg border-2 border-[#2563EB] bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#2563EB]" aria-hidden="true" />
                <span className="text-[15px] font-bold text-[#0F172A]">{planLabel}</span>
              </div>
              {isTrial ? (
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {daysLeft > 0
                    ? `${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'} de trial`
                    : 'Seu período de trial terminou'}
                </p>
              ) : (
                currentPlanColumn && (
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    R$ {currentPlanColumn.price}/mês
                  </p>
                )
              )}
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                isTrial ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#D1FAE5] text-[#065F46]',
              )}
            >
              {isTrial ? 'TRIAL' : 'ATIVO'}
            </span>
          </div>

          <button
            type="button"
            className={cn(
              'mt-4 w-full rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white',
              'transition-colors hover:bg-[#1D4ED8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
            )}
          >
            {isTrial ? 'Escolher um plano' : 'Gerenciar assinatura'}
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
                    key={p.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.06em]',
                      p.key === highlightedKey ? 'text-[#2563EB]' : 'text-[#94A3B8]',
                    )}
                  >
                    {p.label}
                    {p.key === highlightedKey && (
                      <span className="ml-1 font-normal text-[#2563EB]">✓</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(
                [
                  { label: 'Preço',          render: (v: PlanColumn) => `R$${v.price}/mês` },
                  { label: 'Profissionais',  render: (v: PlanColumn) => v.professionals      },
                  { label: 'Clientes',       render: (v: PlanColumn) => v.clients             },
                  { label: 'Relatórios',     render: (v: PlanColumn) => v.reports             },
                  { label: 'API pública',    render: (v: PlanColumn) => v.api    ? '✓' : '✗'  },
                  { label: 'White Label',    render: (v: PlanColumn) => v.whiteLabel ? '✓' : '✗' },
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
                        key={p.key}
                        className={cn(
                          'px-4 py-3 text-center text-[13px]',
                          p.key === highlightedKey ? 'bg-[#EFF6FF]' : '',
                          !isCheck && !isCross ? 'text-[#0F172A]' : '',
                        )}
                      >
                        {isCheck ? (
                          <>
                            <CheckCircle2 size={13} className="mx-auto text-[#10B981]" aria-hidden="true" />
                            <span className="sr-only">Sim</span>
                          </>
                        ) : isCross ? (
                          <>
                            <XCircle size={13} className="mx-auto text-[#CBD5E1]" aria-hidden="true" />
                            <span className="sr-only">Não</span>
                          </>
                        ) : val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TODO: conectar API quando endpoint /settings/invoices existir */}

        <div className="pb-6" />
      </div>
    </div>
  )
}
