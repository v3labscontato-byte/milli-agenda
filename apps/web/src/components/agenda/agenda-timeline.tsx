'use client'

import { useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Agendamento } from '@/lib/agenda-mock'
import { timeToMinutes, endTime, formatBRL } from '@/lib/agenda-mock'
import { STATUS_CONFIG } from './agenda-badge'
import { ProfissionalAvatar } from '@/components/profissionais/profissional-card'

// ─── Layout constants ─────────────────────────────────────────────────────────

const WORK_START = 9 * 60    // 09:00 in minutes
const WORK_END   = 19 * 60   // 19:00 in minutes
const SLOT_MINS  = 30
const SLOT_H     = 48        // px per 30-min slot
const COL_W      = 180       // px per professional column
const TIME_W     = 52        // px for the time label column

const TOTAL_SLOTS = (WORK_END - WORK_START) / SLOT_MINS
const TOTAL_H     = TOTAL_SLOTS * SLOT_H

const HOUR_LABELS = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const mins = WORK_START + i * SLOT_MINS
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return { label: m === '00' ? `${h}:00` : '', isHour: m === '00', mins }
})

function minsToTop(mins: number): number {
  return ((mins - WORK_START) / SLOT_MINS) * SLOT_H
}

// ─── Appointment block ────────────────────────────────────────────────────────

interface ApptBlockProps {
  appt: Agendamento
  onClick: (a: Agendamento) => void
}

function ApptBlock({ appt, onClick }: ApptBlockProps) {
  const startMins = timeToMinutes(appt.time)
  const top    = minsToTop(startMins)
  const height = Math.max((appt.serviceDuration / SLOT_MINS) * SLOT_H - 2, 22)
  const cfg    = STATUS_CONFIG[appt.status]
  const short  = appt.serviceDuration <= 30

  return (
    <button
      type="button"
      onClick={() => onClick(appt)}
      aria-label={`${appt.time} – ${appt.clientName}: ${appt.service}`}
      className={cn(
        'absolute left-1 right-1 rounded-md border px-2 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
        'hover:brightness-95 hover:shadow-sm',
      )}
      style={{
        top,
        height,
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        overflow: 'hidden',
      }}
    >
      {short ? (
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="font-tabular text-[10px] font-semibold leading-none" style={{ color: cfg.text }}>
            {appt.time}
          </span>
          <span className="truncate text-[11px] font-medium leading-none" style={{ color: cfg.text }}>
            {appt.clientName}
          </span>
        </div>
      ) : (
        <div className="py-1">
          <p className="font-tabular text-[10px] font-semibold leading-snug" style={{ color: cfg.text }}>
            {appt.time} – {endTime(appt.time, appt.serviceDuration)}
          </p>
          <p className="truncate text-[12px] font-semibold leading-snug" style={{ color: cfg.text }}>
            {appt.clientName}
          </p>
          {appt.serviceDuration >= 45 && (
            <p className="truncate text-[10px] leading-snug opacity-75" style={{ color: cfg.text }}>
              {appt.service}
            </p>
          )}
          {appt.serviceDuration >= 60 && (
            <p className="text-[10px] font-medium leading-snug opacity-80" style={{ color: cfg.text }}>
              {formatBRL(appt.serviceValue)}
            </p>
          )}
        </div>
      )}
    </button>
  )
}

// ─── Current time indicator ───────────────────────────────────────────────────

function NowLine({ date }: { date: string }) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (date !== today) return null

  const nowMins = now.getHours() * 60 + now.getMinutes()
  if (nowMins < WORK_START || nowMins > WORK_END) return null

  const top = minsToTop(nowMins)
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top }}
      aria-hidden="true"
    >
      <div className="h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" />
      <div className="h-px flex-1 bg-[#EF4444]" />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDay() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <span className="text-xl">📅</span>
      </div>
      <p className="text-[14px] font-medium text-[#475569]">Sem agendamentos neste dia</p>
      <p className="text-[12px] text-[#94A3B8]">Clique em "Novo Agendamento" para adicionar.</p>
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface AgendaTimelineProps {
  agendamentos: Agendamento[]
  date: string
  onSelect: (a: Agendamento) => void
}

export default function AgendaTimeline({ agendamentos, date, onSelect }: AgendaTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const professionals = useMemo(() => {
    const names = Array.from(new Set(agendamentos.map((a) => a.professionalName)))
    return names.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [agendamentos])

  const byProf = useMemo(() => {
    const map: Record<string, Agendamento[]> = {}
    for (const p of professionals) {
      map[p] = agendamentos
        .filter((a) => a.professionalName === p)
        .sort((a, b) => a.time.localeCompare(b.time))
    }
    return map
  }, [agendamentos, professionals])

  if (agendamentos.length === 0) return <EmptyDay />

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* ── Professional headers ── */}
      <div
        className="flex shrink-0 border-b border-[#E2E8F0] bg-white"
        style={{ paddingLeft: TIME_W }}
      >
        {professionals.map((name) => (
          <div
            key={name}
            className="flex items-center gap-2 border-l border-[#E2E8F0] px-3 py-2.5"
            style={{ width: COL_W, minWidth: COL_W }}
          >
            <ProfissionalAvatar name={name} size={28} />
            <span className="truncate text-[12px] font-semibold text-[#0F172A]">
              {name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* ── Scrollable grid ── */}
      <div ref={scrollRef} className="overflow-auto">
        <div
          className="relative flex"
          style={{ height: TOTAL_H, minWidth: TIME_W + professionals.length * COL_W }}
        >
          {/* Time labels */}
          <div
            className="sticky left-0 z-10 shrink-0 bg-white"
            style={{ width: TIME_W }}
          >
            {HOUR_LABELS.map(({ label, isHour, mins }) => (
              <div
                key={mins}
                className={cn(
                  'flex items-start justify-end pr-2',
                  isHour ? 'border-t border-[#E2E8F0]' : 'border-t border-[#F1F5F9]',
                )}
                style={{ height: SLOT_H }}
              >
                {label && (
                  <span className="mt-px text-[10px] font-medium text-[#94A3B8]">{label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Professional columns */}
          {professionals.map((name, colIdx) => (
            <div
              key={name}
              className="relative shrink-0 border-l border-[#E2E8F0]"
              style={{ width: COL_W }}
            >
              {/* Slot backgrounds */}
              {HOUR_LABELS.map(({ isHour, mins }) => (
                <div
                  key={mins}
                  className={isHour ? 'border-t border-[#E2E8F0]' : 'border-t border-[#F8FAFC]'}
                  style={{ height: SLOT_H }}
                />
              ))}

              {/* Current time line (first col only to avoid repetition) */}
              {colIdx === 0 && <NowLine date={date} />}

              {/* Appointment blocks */}
              {byProf[name].map((appt) => (
                <ApptBlock key={appt.id} appt={appt} onClick={onSelect} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
