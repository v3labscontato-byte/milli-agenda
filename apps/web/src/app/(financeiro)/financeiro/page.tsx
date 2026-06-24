'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  RECEITA_SEMANAL,
  METODO_DISTRIBUICAO,
  FATURAMENTO_MENSAL,
  FINANCEIRO_KPIS,
  type PeriodFilter,
} from '@/lib/financeiro-mock'
import { MOCK_INADIMPLENCIA_HISTORICO } from '@/lib/financeiro-historico'
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

function InadimplenciaSection() {
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const items = MOCK_INADIMPLENCIA_HISTORICO[selectedMonth] ?? []
  const total = items.reduce((s, i) => s + i.value, 0)

  return (
    <div className="space-y-4">
      <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />
      {items.length === 0 ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-12 text-center">
          <p className="text-[13px] text-[#64748B]">Nenhuma inadimplência registrada neste mês.</p>
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

export default function FinanceiroPage() {
  const [period, setPeriod]         = useState<PeriodFilter>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')
  const [activeTab, setActiveTab]   = useState<TabId>('procedimentos')

  return (
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
      <FinanceiroKpiStrip kpis={FINANCEIRO_KPIS} />

      {/* ── Charts ── */}
      <ReceitaChart
        weeklyData={RECEITA_SEMANAL}
        metodoData={METODO_DISTRIBUICAO}
        monthlyData={FATURAMENTO_MENSAL}
      />

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
            {activeTab === 'comissoes' && <ComissoesTable />}
          </div>
          <div role="tabpanel" id="panel-inadimplencia" aria-labelledby="tab-inadimplencia" hidden={activeTab !== 'inadimplencia'}>
            {activeTab === 'inadimplencia' && <InadimplenciaSection />}
          </div>
          <div role="tabpanel" id="panel-fluxo" aria-labelledby="tab-fluxo" hidden={activeTab !== 'fluxo'}>
            {activeTab === 'fluxo' && <FluxoCaixa />}
          </div>
          <div role="tabpanel" id="panel-metas" aria-labelledby="tab-metas" hidden={activeTab !== 'metas'}>
            {activeTab === 'metas' && <MetasSection />}
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
  )
}
