'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, LayoutList, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MOCK_AGENDAMENTOS,
  kpiStats,
  formatBRL,
  formatDateLong,
  addDays,
  timeToMinutes,
  endTime,
  type Agendamento,
  type AgendaStatus,
} from '@/lib/agenda-mock'
import AgendaTimeline from '@/components/agenda/agenda-timeline'
import AgendamentoModal from '@/components/agenda/agendamento-modal'
import NovoAgendamentoModal from '@/components/agenda/novo-agendamento-modal'
import { StatusBadge } from '@/components/agenda/agenda-badge'
import { ProfissionalAvatar } from '@/components/profissionais/profissional-card'

const TODAY = '2026-06-24'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function weekDays(anchor: string): string[] {
  const [y, m, d] = anchor.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = dt.getDay()
  const monday = new Date(dt)
  monday.setDate(dt.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return day.toISOString().slice(0, 10)
  })
}

function dayLabel(date: string): { wd: string; d: string } {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const wd = dt.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return { wd: wd.charAt(0).toUpperCase() + wd.slice(1), d: d.toString() }
}

// ─── KPI chip ─────────────────────────────────────────────────────────────────

function KpiChip({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn('font-tabular text-[15px] font-bold', accent ? 'text-[#2563EB]' : 'text-[#0F172A]')}>
        {value}
      </span>
      <span className="text-[11px] text-[#94A3B8]">{label}</span>
    </div>
  )
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListaView({ agendamentos, onSelect }: { agendamentos: Agendamento[]; onSelect: (a: Agendamento) => void }) {
  const sorted = [...agendamentos].sort((a, b) => a.time.localeCompare(b.time))
  if (sorted.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-[14px] font-medium text-[#475569]">Sem agendamentos neste dia</p>
        <p className="text-[12px] text-[#94A3B8]">Clique em "Novo Agendamento" para adicionar.</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {['Horário', 'Cliente', 'Serviço', 'Profissional', 'Valor', 'Status', ''].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {sorted.map((a) => (
            <tr key={a.id} className="group hover:bg-[#F8FAFC]">
              <td className="px-4 py-3">
                <p className="font-tabular font-semibold text-[#0F172A]">{a.time}</p>
                <p className="text-[11px] text-[#94A3B8]">até {endTime(a.time, a.serviceDuration)}</p>
              </td>
              <td className="px-4 py-3 font-medium text-[#0F172A]">{a.clientName}</td>
              <td className="px-4 py-3 text-[#475569]">{a.service}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <ProfissionalAvatar name={a.professionalName} size={22} />
                  <span className="text-[#475569]">{a.professionalName.split(' ')[0]}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-tabular font-semibold text-[#0F172A]">{formatBRL(a.serviceValue)}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] font-medium text-[#475569] opacity-0 transition-colors hover:border-[#2563EB] hover:text-[#2563EB] group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [date, setDate]           = useState(TODAY)
  const [profFilter, setProfFilter] = useState<string | null>(null)
  const [viewMode, setViewMode]   = useState<'timeline' | 'lista'>('timeline')
  const [selected, setSelected]   = useState<Agendamento | null>(null)
  const [novoOpen, setNovoOpen]   = useState(false)

  const [agendamentos, setAgendamentos] = useState(MOCK_AGENDAMENTOS)

  const dayAppts = useMemo(
    () => agendamentos.filter((a) => a.date === date),
    [agendamentos, date],
  )

  const professionals = useMemo(
    () => Array.from(new Set(dayAppts.map((a) => a.professionalName))).sort(),
    [dayAppts],
  )

  const filtered = useMemo(
    () => profFilter ? dayAppts.filter((a) => a.professionalName === profFilter) : dayAppts,
    [dayAppts, profFilter],
  )

  const stats = useMemo(() => kpiStats(date, agendamentos), [date, agendamentos])
  const days  = useMemo(() => weekDays(date), [date])

  const apptsByDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of agendamentos) { map[a.date] = (map[a.date] ?? 0) + 1 }
    return map
  }, [agendamentos])

  function handleStatusChange(id: string, status: AgendaStatus) {
    setAgendamentos((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
  }

  const dateTitle = formatDateLong(date).replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="flex h-full flex-col bg-white">

      {/* ── Top controls ── */}
      <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setDate((d) => addDays(d, -1)); setProfFilter(null) }}
              aria-label="Dia anterior"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2E8F0] text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <div className="text-center">
              <h2 className="text-[14px] font-semibold text-[#0F172A]">{dateTitle}</h2>
              {date === TODAY && (
                <span className="text-[11px] font-medium text-[#2563EB]">Hoje</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setDate((d) => addDays(d, 1)); setProfFilter(null) }}
              aria-label="Próximo dia"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2E8F0] text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            {date !== TODAY && (
              <button
                type="button"
                onClick={() => { setDate(TODAY); setProfFilter(null) }}
                className="ml-1 rounded-md border border-[#E2E8F0] px-2.5 py-1 text-[12px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Hoje
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md border border-[#E2E8F0]" role="group" aria-label="Modo de visualização">
              {(['timeline', 'lista'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={cn(
                    'flex h-8 items-center gap-1.5 px-3 text-[12px] font-medium transition-colors',
                    'first:rounded-l-md last:rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-inset',
                    viewMode === mode
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#475569] hover:bg-[#F8FAFC]',
                  )}
                >
                  {mode === 'timeline'
                    ? <><CalendarDays size={13} aria-hidden="true" />Calendário</>
                    : <><LayoutList size={13} aria-hidden="true" />Lista</>
                  }
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setNovoOpen(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5',
                'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              )}
            >
              <Plus size={13} aria-hidden="true" />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div className="mt-3 flex gap-1" role="group" aria-label="Semana">
          {days.map((day) => {
            const { wd, d } = dayLabel(day)
            const isActive  = day === date
            const isToday   = day === TODAY
            const count     = apptsByDay[day] ?? 0
            return (
              <button
                key={day}
                type="button"
                onClick={() => { setDate(day); setProfFilter(null) }}
                aria-pressed={isActive}
                className={cn(
                  'flex flex-1 flex-col items-center rounded-lg px-1 py-1.5 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  isActive
                    ? 'bg-[#2563EB] text-white'
                    : 'hover:bg-[#F8FAFC] text-[#475569]',
                )}
              >
                <span className={cn('text-[10px] font-medium', isActive ? 'text-blue-100' : 'text-[#94A3B8]')}>{wd}</span>
                <span className={cn('text-[14px] font-bold leading-tight', isToday && !isActive && 'text-[#2563EB]')}>{d}</span>
                <span className={cn(
                  'mt-0.5 h-1.5 w-1.5 rounded-full',
                  count > 0
                    ? isActive ? 'bg-blue-200' : 'bg-[#2563EB]'
                    : 'bg-transparent',
                )} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── KPI + professional filter ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-2.5">
        <KpiChip label="agendamentos" value={stats.total} />
        <span className="h-4 w-px bg-[#E2E8F0]" aria-hidden="true" />
        <KpiChip label="confirmados" value={stats.confirmed} accent />
        <KpiChip label="concluídos" value={stats.completed} />
        <KpiChip label="pendentes" value={stats.pending} />
        <span className="h-4 w-px bg-[#E2E8F0]" aria-hidden="true" />
        <KpiChip label="faturamento" value={formatBRL(stats.revenue)} />

        {/* Professional filter pills */}
        {professionals.length > 1 && (
          <>
            <span className="ml-auto h-4 w-px bg-[#E2E8F0]" aria-hidden="true" />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por profissional">
              <button
                type="button"
                onClick={() => setProfFilter(null)}
                aria-pressed={profFilter === null}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  profFilter === null
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                    : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]',
                )}
              >
                Todos
              </button>
              {professionals.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setProfFilter(profFilter === name ? null : name)}
                  aria-pressed={profFilter === name}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border py-0.5 pl-1.5 pr-2.5 text-[11px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    profFilter === name
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]',
                  )}
                >
                  <ProfissionalAvatar name={name} size={16} />
                  {name.split(' ')[0]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'timeline'
          ? <AgendaTimeline agendamentos={filtered} date={date} onSelect={setSelected} />
          : <ListaView agendamentos={filtered} onSelect={setSelected} />
        }
      </div>

      {/* ── Modals ── */}
      <AgendamentoModal
        agendamento={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
      <NovoAgendamentoModal
        open={novoOpen}
        defaultDate={date}
        onClose={() => setNovoOpen(false)}
      />
    </div>
  )
}
