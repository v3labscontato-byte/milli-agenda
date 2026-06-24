'use client'

import { useCallback, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  MOCK_TRANSACTIONS,
  MOCK_COMISSOES,
  MOCK_INADIMPLENCIA,
  MOCK_FLUXO,
  RECEITA_SEMANAL,
  METODO_DISTRIBUICAO,
  FINANCEIRO_KPIS,
  filterByPeriod,
  type Comissao,
  type PeriodFilter,
} from '@/lib/financeiro-mock'
import FinanceiroKpiStrip from '@/components/financeiro/financeiro-kpi-strip'
import ReceitaChart from '@/components/financeiro/receita-chart'
import PagamentosTable from '@/components/financeiro/pagamentos-table'
import ComissoesTable from '@/components/financeiro/comissoes-table'
import FluxoCaixa from '@/components/financeiro/fluxo-caixa'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'recebimentos' | 'comissoes' | 'inadimplencia' | 'fluxo'

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Hoje',           value: 'today'  },
  { label: 'Esta semana',    value: 'week'   },
  { label: 'Este mês',       value: 'month'  },
  { label: 'Últimos 30 dias', value: 'last30' },
  { label: 'Personalizado',  value: 'custom' },
]

const TABS: { id: TabId; label: string }[] = [
  { id: 'recebimentos',  label: 'Recebimentos'  },
  { id: 'comissoes',     label: 'Comissões'     },
  { id: 'inadimplencia', label: 'Inadimplência' },
  { id: 'fluxo',         label: 'Fluxo de Caixa'},
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

// ─── Inadimplência section ─────────────────────────────────────────────────────

function InadimplenciaSection() {
  const total = MOCK_INADIMPLENCIA.reduce((s, i) => s + i.value, 0)

  if (MOCK_INADIMPLENCIA.length === 0) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-12 text-center">
        <p className="text-[13px] text-[#64748B]">Nenhuma inadimplência registrada. 🎉</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Inadimplência</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{MOCK_INADIMPLENCIA.length} clientes em atraso</p>
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
            {MOCK_INADIMPLENCIA.map((item, i) => (
              <tr
                key={item.id}
                className={cn(
                  'transition-colors hover:bg-[#FFF7F7]',
                  i < MOCK_INADIMPLENCIA.length - 1 && 'border-b border-[#F1F5F9]',
                )}
              >
                <td className="px-5 py-3 font-tabular text-[12px] text-[#475569]">{item.dateLabel}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-[#0F172A]">{item.clientName}</td>
                <td className="px-4 py-3 text-[12px] text-[#475569]">{item.service}</td>
                <td className="px-4 py-3 text-right font-tabular text-[13px] font-semibold text-[#0F172A]">{fmtBRL(item.value)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                    item.daysOverdue >= 20
                      ? 'bg-[#FEE2E2] text-[#991B1B]'
                      : item.daysOverdue >= 10
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-[#FEF9C3] text-[#854D0E]',
                  )}>
                    {item.daysOverdue}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [period, setPeriod]       = useState<PeriodFilter>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]   = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('recebimentos')
  const [comissoes, setComissoes] = useState<Comissao[]>(MOCK_COMISSOES)

  const filtered = useMemo(
    () => filterByPeriod(MOCK_TRANSACTIONS, period, customFrom, customTo),
    [period, customFrom, customTo],
  )

  const handleMarkPaid = useCallback((id: string) => {
    setComissoes((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'PAID' as const, paidAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }
          : c,
      ),
    )
  }, [])

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
      <ReceitaChart weeklyData={RECEITA_SEMANAL} metodoData={METODO_DISTRIBUICAO} />

      {/* ── Tabs ── */}
      <div>
        <div
          role="tablist"
          aria-label="Abas financeiro"
          className="flex gap-0 border-b border-[#E2E8F0]"
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
            {activeTab === 'recebimentos' && <PagamentosTable transactions={filtered} />}
          </div>
          <div role="tabpanel" id="panel-comissoes" aria-labelledby="tab-comissoes" hidden={activeTab !== 'comissoes'}>
            {activeTab === 'comissoes' && <ComissoesTable comissoes={comissoes} onMarkPaid={handleMarkPaid} />}
          </div>
          <div role="tabpanel" id="panel-inadimplencia" aria-labelledby="tab-inadimplencia" hidden={activeTab !== 'inadimplencia'}>
            {activeTab === 'inadimplencia' && <InadimplenciaSection />}
          </div>
          <div role="tabpanel" id="panel-fluxo" aria-labelledby="tab-fluxo" hidden={activeTab !== 'fluxo'}>
            {activeTab === 'fluxo' && <FluxoCaixa entries={MOCK_FLUXO} />}
          </div>
        </div>
      </div>

    </div>
  )
}
