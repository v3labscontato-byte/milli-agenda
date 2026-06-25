'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  RECEITA_SEMANAL,
  METODO_DISTRIBUICAO,
  FATURAMENTO_MENSAL,
  FINANCEIRO_KPIS,
  type FinanceiroKpis,
  type PeriodFilter,
} from '@/lib/financeiro-mock'
import { MOCK_INADIMPLENCIA_HISTORICO } from '@/lib/financeiro-historico'
import { FEATURES } from '@/lib/features'
import { useRelatorios, periodToRange, type Period } from '@/hooks/use-relatorios'
import MonthFilter, { CURRENT_MONTH } from '@/components/financeiro/month-filter'
import FinanceiroKpiStrip from '@/components/financeiro/financeiro-kpi-strip'
import ReceitaChart from '@/components/financeiro/receita-chart'
import PagamentosTable from '@/components/financeiro/pagamentos-table'
import ComissoesTable from '@/components/financeiro/comissoes-table'
import FluxoCaixa from '@/components/financeiro/fluxo-caixa'
import MetasSection from '@/components/financeiro/metas-section'
import PlanoContas from '@/components/financeiro/plano-contas'
import ProcedimentosSection from '@/components/financeiro/procedimentos-section'
import DespesasSection from '@/components/financeiro/despesas-section'
import SmartFormMeta from '@/components/shared/smart-form-meta'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'recebimentos' | 'comissoes' | 'inadimplencia' | 'fluxo' | 'metas' | 'plano' | 'procedimentos'

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Hoje',            value: 'today'  },
  { label: 'Esta semana',     value: 'week'   },
  { label: 'Este mês',        value: 'month'  },
  { label: 'Últimos 30 dias', value: 'last30' },
  { label: 'Personalizado',   value: 'custom' },
]

const TABS: { id: TabId; label: string }[] = [
  { id: 'procedimentos',  label: 'Procedimentos'   },
  { id: 'recebimentos',   label: 'Recebimentos'    },
  { id: 'comissoes',      label: 'Comissões'       },
  { id: 'inadimplencia',  label: 'Inadimplência'   },
  { id: 'fluxo',          label: 'Fluxo de Caixa'  },
  { id: 'metas',          label: 'Metas'           },
  { id: 'plano',          label: 'Plano de Contas' },
]

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

// ─── Period bar ───────────────────────────────────────────────────────────────

interface PeriodBarProps {
  active: PeriodFilter
  customFrom: string
  customTo: string
  onChange: (p: PeriodFilter) => void
  onCustomFrom: (v: string) => void
  onCustomTo: (v: string) => void
}

function PeriodBar({ active, customFrom, customTo, onChange, onCustomFrom, onCustomTo }: PeriodBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar período">
        {PERIOD_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={active === value}
            className={cn(
              'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              active === value
                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {active === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFrom(e.target.value)}
            className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
            aria-label="Data inicial"
          />
          <span className="text-[12px] text-[#64748B]">até</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomTo(e.target.value)}
            className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
            aria-label="Data final"
          />
        </div>
      )}
    </div>
  )
}

// ─── Inadimplência section ────────────────────────────────────────────────────

interface InadItem { id: string; dateLabel: string; clientName: string; service: string; value: number; daysOverdue: number }

function InadimplenciaSection() {
  const { overdue, overdueLoading, overdueError, fetchOverdue } = useRelatorios()
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)

  useEffect(() => {
    if (FEATURES.realRelatorios) fetchOverdue()
  }, [fetchOverdue])

  const items: InadItem[] = FEATURES.realRelatorios
    ? overdue.map((o) => ({
        id: o.id,
        dateLabel: o.date ? o.date.slice(8, 10) + '/' + o.date.slice(5, 7) : '—',
        clientName: o.clientName,
        service: o.service,
        value: o.value,
        daysOverdue: o.daysOverdue,
      }))
    : (MOCK_INADIMPLENCIA_HISTORICO[selectedMonth] ?? [])
  const total = items.reduce((s, i) => s + i.value, 0)

  if (FEATURES.realRelatorios && overdueError) {
    return <div className="text-sm text-red-500 p-4">Erro ao carregar. Tente novamente.</div>
  }

  return (
    <div className="space-y-4">
      {!FEATURES.realRelatorios && <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />}
      {FEATURES.realRelatorios && overdueLoading ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-12 text-center">
          <p className="text-[13px] text-[#64748B]">Carregando…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-12 text-center">
          <p className="text-[13px] text-[#64748B]">Nenhum pagamento pendente.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Inadimplência</h3>
              <p className="mt-0.5 text-[12px] text-[#475569]">{items.length} clientes em atraso</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#FEF2F2] px-3 py-1.5">
              <AlertCircle size={13} className="text-[#DC2626]" aria-hidden="true" />
              <span className="font-tabular text-[13px] font-bold text-[#DC2626]">{fmtBRL(total)}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]" aria-label="Clientes inadimplentes">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Data</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Cliente</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Serviço</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Valor</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Atraso</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}
                    className={cn('transition-colors hover:bg-[#FFF7F7]', i < items.length - 1 && 'border-b border-[#F1F5F9]')}>
                    <td className="px-5 py-3 font-tabular text-[12px] text-[#475569]">{item.dateLabel}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#0F172A]">{item.clientName}</td>
                    <td className="px-4 py-3 text-[12px] text-[#475569]">{item.service}</td>
                    <td className="px-4 py-3 text-right font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(item.value)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                        item.daysOverdue >= 20 ? 'bg-[#FEE2E2] text-[#991B1B]' : item.daysOverdue >= 10 ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEF9C3] text-[#854D0E]')}>
                        {item.daysOverdue}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PERIOD_MAP: Record<PeriodFilter, Period> = {
  today:  'hoje',
  week:   'semana',
  month:  'mes',
  last30: 'ultimos30',
  custom: 'custom',
}

function buildRealKpis(raw: ReturnType<typeof useRelatorios>['kpis'], overdueCount: number): FinanceiroKpis {
  // Map documented API fields onto the FinanceiroKpis shape used by the strip.
  // Fields the API does not provide (trend strings, metas) are zeroed — no mock
  // leakage. See backlog TODOs in use-relatorios.ts for /reports/goals.
  const k = raw ?? {}
  return {
    receitaMes:        k.receitaBruta ?? 0,
    receitaMesTrend:   '',
    receitaMesTrendUp: true,
    receitaHoje:       k.todayRevenue ?? 0,
    receitaHojeTrend:  '',
    receitaHojeTrendUp: true,
    aReceber:          k.aReceber ?? 0,
    pendingCount:      overdueCount,
    taxaRecebimento:   0,
    taxaMeta:          0,
    taxaTrendUp:       true,
    ticketMedio:       k.ticketMedio ?? 0,
    ticketTrend:       '',
    ticketTrendUp:     true,
    receitaBruta:      k.receitaBruta ?? 0,
    despesas:          k.despesas ?? 0,
    lucroLiquido:      k.lucro ?? 0,
    margem:            k.margem ?? 0,
    metaAting:         0, // TODO: /reports/goals
    inadimplenciaPct:  0,
    totalEntradas:     0,
    saldoCaixa:        0,
    receitaSemana:     0,
    metaDiaria:        0, // TODO: /reports/goals
    metaSemanal:       0, // TODO: /reports/goals
    metaMensal:        0, // TODO: /reports/goals
  }
}

export default function FinanceiroPage() {
  const rel = useRelatorios()
  const [period, setPeriod]         = useState<PeriodFilter>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')
  const [activeTab, setActiveTab]   = useState<TabId>('procedimentos')
  const [metaOpen, setMetaOpen]     = useState(false)

  const range = useMemo(
    () => periodToRange(PERIOD_MAP[period], customFrom, customTo),
    [period, customFrom, customTo],
  )

  const { fetchCommissions, fetchCashflow, fetchOverdue } = rel
  useEffect(() => {
    if (!FEATURES.realRelatorios) return
    if (period === 'custom' && (!customFrom || !customTo)) return
    fetchCommissions(range.from, range.to)
    fetchCashflow(range.from, range.to)
  }, [fetchCommissions, fetchCashflow, range.from, range.to, period, customFrom, customTo])

  useEffect(() => {
    if (FEATURES.realRelatorios) fetchOverdue()
  }, [fetchOverdue])

  const kpis = FEATURES.realRelatorios ? buildRealKpis(rel.kpis, rel.overdue.length) : FINANCEIRO_KPIS

  return (
    <>
    <div className="space-y-6 px-6 pb-10 pt-5">

      {/* ── Period filter ── */}
      <PeriodBar
        active={period}
        customFrom={customFrom}
        customTo={customTo}
        onChange={setPeriod}
        onCustomFrom={setCustomFrom}
        onCustomTo={setCustomTo}
      />

      {/* ── KPI strip ── */}
      {FEATURES.realRelatorios && rel.kpisError ? (
        <div className="text-sm text-red-500 p-4">Erro ao carregar. Tente novamente.</div>
      ) : (
        <FinanceiroKpiStrip kpis={kpis} />
      )}

      {/* ── Charts ── */}
      {FEATURES.realRelatorios ? (
        <ReceitaChart
          realCashflow={rel.cashflow}
          loading={rel.cashflowLoading}
          error={rel.cashflowError}
        />
      ) : (
        <ReceitaChart
          weeklyData={RECEITA_SEMANAL}
          metodoData={METODO_DISTRIBUICAO}
          monthlyData={FATURAMENTO_MENSAL}
        />
      )}

      {/* ── Despesas ── */}
      <DespesasSection />

      <hr className="border-[#E2E8F0]" />

      {/* ── Tabs ── */}
      <div>
        <div
          role="tablist"
          aria-label="Abas financeiro"
          className="flex flex-wrap gap-0 border-b border-[#E2E8F0]"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              type="button"
              id={`tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                'border-b-2 px-4 pb-3 pt-0.5 text-[13px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                activeTab === id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pt-5">
          <div role="tabpanel" id="panel-recebimentos" aria-labelledby="tab-recebimentos" hidden={activeTab !== 'recebimentos'}>
            {activeTab === 'recebimentos' && <PagamentosTable />}
          </div>
          <div role="tabpanel" id="panel-comissoes" aria-labelledby="tab-comissoes" hidden={activeTab !== 'comissoes'}>
            {activeTab === 'comissoes' && (
              <ComissoesTable realData={rel.commissions} loading={rel.commissionsLoading} error={rel.commissionsError} />
            )}
          </div>
          <div role="tabpanel" id="panel-inadimplencia" aria-labelledby="tab-inadimplencia" hidden={activeTab !== 'inadimplencia'}>
            {activeTab === 'inadimplencia' && <InadimplenciaSection />}
          </div>
          <div role="tabpanel" id="panel-fluxo" aria-labelledby="tab-fluxo" hidden={activeTab !== 'fluxo'}>
            {activeTab === 'fluxo' && (
              <FluxoCaixa realData={rel.cashflow} loading={rel.cashflowLoading} error={rel.cashflowError} />
            )}
          </div>
          <div role="tabpanel" id="panel-metas" aria-labelledby="tab-metas" hidden={activeTab !== 'metas'}>
            {activeTab === 'metas' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMetaOpen(true)}
                    className={cn(
                      'rounded-md bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white',
                      'transition-colors hover:bg-[#1D4ED8]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    )}
                  >
                    + Nova Meta
                  </button>
                </div>
                <MetasSection />
              </div>
            )}
          </div>
          <div role="tabpanel" id="panel-plano" aria-labelledby="tab-plano" hidden={activeTab !== 'plano'}>
            {activeTab === 'plano' && <PlanoContas />}
          </div>
          <div role="tabpanel" id="panel-procedimentos" aria-labelledby="tab-procedimentos" hidden={activeTab !== 'procedimentos'}>
            {activeTab === 'procedimentos' && <ProcedimentosSection />}
          </div>
        </div>
      </div>

    </div>

    <SmartFormMeta open={metaOpen} onClose={() => setMetaOpen(false)} />
    </>
  )
}
