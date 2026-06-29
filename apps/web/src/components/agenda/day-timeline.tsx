'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  isTodayUtil,
  toDateString,
  type CalendarAppointment,
  type CalendarProfessional,
} from '@/lib/calendar-utils'

const SLOT_HEIGHT_BASE = 52 // px per 30-min slot

function generateTimeSlots(intervalMin: number): string[] {
  const slots: string[] = []
  const startMin = 8 * 60
  const endMin   = 20 * 60
  for (let min = startMin; min < endMin; min += intervalMin) {
    const h = Math.floor(min / 60).toString().padStart(2, '0')
    const m = (min % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
  }
  return slots
}

function slotIndexFor(time: string, intervalMin: number, total: number): number {
  const [h, m] = time.split(':').map(Number)
  const minFromStart = (h - 8) * 60 + m
  const idx = Math.floor(minFromStart / intervalMin)
  return idx >= 0 && idx < total ? idx : -1
}

function durationSlotsFor(minutes: number, intervalMin: number): number {
  return Math.max(1, Math.ceil(minutes / intervalMin))
}
import AppointmentBlock from './appointment-block'

interface CalendarBlock {
  id: string
  professionalId: string
  date: string
  startTime: string
  endTime: string
  reason: string
}

function BlockForm({
  initialTime,
  timeSlots,
  onAdd,
  onCancel,
}: {
  initialTime: string
  timeSlots: string[]
  onAdd: (start: string, end: string, reason: string) => void
  onCancel: () => void
}) {
  const si = timeSlots.indexOf(initialTime)
  const [start, setStart] = useState(initialTime)
  const [end, setEnd]     = useState(si >= 0 && si + 1 < timeSlots.length ? timeSlots[si + 1] : initialTime)
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" onClick={onCancel}>
      <div
        className="w-full max-w-xs rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#F1F5F9] px-4 py-3">
          <p className="text-[13px] font-semibold text-[#0F172A]">🔒 Bloquear horário</p>
        </div>
        <div className="space-y-3 px-4 py-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-[#64748B]">Início</label>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[12px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
              >
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-[#64748B]">Fim</label>
              <select
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[12px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
              >
                {timeSlots.filter((t) => t > start).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#64748B]">Motivo (opcional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: almoço, reunião…"
              className="w-full rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
            />
          </div>
        </div>
        <div className="flex gap-2 border-t border-[#F1F5F9] px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-[#E2E8F0] py-2 text-[12px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!start || !end || end <= start}
            onClick={() => onAdd(start, end, reason)}
            className="flex-1 rounded-md bg-[#475569] py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#334155] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            Bloquear
          </button>
        </div>
      </div>
    </div>
  )
}

interface DayTimelineProps {
  appointments: CalendarAppointment[]
  professionals: CalendarProfessional[]
  date: Date
  interval?: 15 | 20 | 30 | 60
  onAppointmentClick?: (appt: CalendarAppointment) => void
  onSlotClick?: (professionalId: string, time: string, date: string) => void
  onSuccess?: () => void
}

export default function DayTimeline({
  appointments,
  professionals,
  date,
  interval = 15,
  onAppointmentClick,
  onSlotClick,
  onSuccess,
}: DayTimelineProps) {
  const intervalMin = interval
  const slotHeight  = Math.round(SLOT_HEIGHT_BASE * (intervalMin / 30))
  const timeSlots   = useMemo(() => generateTimeSlots(intervalMin), [intervalMin])

  const isToday = isTodayUtil(date)
  const dateStr = toDateString(date)
  const theadRef = useRef<HTMLTableSectionElement>(null)
  const [theadH, setTheadH] = useState(56)
  const [blocks, setBlocks] = useState<CalendarBlock[]>([])
  const [addingBlock, setAddingBlock] = useState<{ profId: string; time: string } | null>(null)
  const [dragging, setDragging] = useState<{ apptId: string; profId: string; origSlot: string } | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<{ slot: string; profId: string } | null>(null)

  useEffect(() => {
    if (theadRef.current) setTheadH(theadRef.current.getBoundingClientRect().height)
  }, [professionals.length])

  const nowTop = useMemo<number | null>(() => {
    if (!isToday) return null
    const now = new Date()
    const relMin = now.getHours() * 60 + now.getMinutes() - 8 * 60
    if (relMin < 0 || relMin > 12 * 60) return null
    return (relMin / intervalMin) * slotHeight
  }, [isToday, intervalMin, slotHeight])

  const coveredSlots = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const prof of professionals) {
      const covered = new Set<string>()
      const profAppts = appointments.filter((a) => a.professionalId === prof.id && a.status !== 'CANCELLED')
      const profApptStarts = new Set(profAppts.map((a) => a.startTime))
      for (const appt of profAppts) {
        const si = slotIndexFor(appt.startTime, intervalMin, timeSlots.length)
        if (si < 0) continue
        const spans = durationSlotsFor(appt.durationMinutes, intervalMin)
        for (let i = 1; i < spans; i++) {
          const ci = si + i
          if (ci >= timeSlots.length) break
          const s = timeSlots[ci] as string
          if (profApptStarts.has(s)) break
          covered.add(s)
        }
      }
      for (const block of blocks.filter((b) => b.professionalId === prof.id && b.date === dateStr)) {
        const si = slotIndexFor(block.startTime, intervalMin, timeSlots.length)
        if (si < 0) continue
        const [sh, sm] = block.startTime.split(':').map(Number)
        const [eh, em] = block.endTime.split(':').map(Number)
        const durMin = (eh * 60 + em) - (sh * 60 + sm)
        const spans = durationSlotsFor(Math.max(intervalMin, durMin), intervalMin)
        for (let i = 1; i < spans; i++) {
          const ci = si + i
          if (ci < timeSlots.length) covered.add(timeSlots[ci] as string)
        }
      }
      map[prof.id] = covered
    }
    return map
  }, [appointments, professionals, blocks, dateStr, intervalMin, timeSlots])

  const tableMinWidth = 80 + Math.max(professionals.length, 1) * 180
  const hasProfs = professionals.length > 0

  const folgaProfIds = useMemo(() => {
    const dow = date.getDay()
    return new Set(
      professionals
        .filter((p) => p.workDays && p.workDays.length > 0 && !p.workDays.includes(dow))
        .map((p) => p.id),
    )
  }, [professionals, date])

  const LEGEND = [
    { color: '#2563EB', bg: '#EFF6FF', label: 'Agendado' },
    { color: '#16A34A', bg: '#F0FDF4', label: 'Confirmado' },
    { color: '#7C3AED', bg: '#F5F3FF', label: 'Finalizado' },
    { color: '#DC2626', bg: '#FEF2F2', label: 'Cancelado' },
    { color: '#94A3B8', bg: '#F1F5F9', label: 'Bloqueado' },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="relative">
          <table
            className="border-separate border-spacing-0"
            style={{ minWidth: `${tableMinWidth}px`, width: '100%' }}
            role="grid"
            aria-label="Agenda diária por profissional"
          >
            {/* ── Sticky header ── */}
            <thead ref={theadRef} className="sticky top-0 z-20">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-30 w-20 border-b border-r border-[#E2E8F0] bg-white"
                  aria-label="Horário"
                />
                {hasProfs ? professionals.map((prof) => (
                  <th
                    key={prof.id}
                    scope="col"
                    className="w-[180px] min-w-[180px] border-b border-r border-[#E2E8F0] bg-white px-3 py-3 text-left font-normal"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: prof.color }}
                        aria-hidden="true"
                      >
                        {prof.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0F172A]">{prof.name}</p>
                        <p className="truncate text-[11px] text-[#475569]">{prof.role}</p>
                        {folgaProfIds.has(prof.id) && (
                          <span className="mt-0.5 inline-block rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] text-[#94A3B8]">Folga</span>
                        )}
                      </div>
                    </div>
                  </th>
                )) : (
                  <th
                    scope="col"
                    className="border-b border-r border-[#E2E8F0] bg-white px-4 py-3 text-left font-normal"
                  >
                    <span className="text-[12px] text-[#94A3B8]">Nenhum profissional cadastrado</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* ── Time slots × professional columns ── */}
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td
                    className="sticky left-0 z-10 w-20 border-b border-r border-[#E2E8F0] bg-white align-top"
                    style={{ height: `${slotHeight}px` }}
                  >
                    <span className="block select-none pr-3 pt-1 text-right font-tabular text-[11px] text-[#94A3B8]">
                      {slot}
                    </span>
                  </td>

                  {hasProfs ? professionals.map((prof) => {
                    if (folgaProfIds.has(prof.id)) {
                      return (
                        <td
                          key={prof.id}
                          style={{
                            height: `${slotHeight}px`,
                            background: 'repeating-linear-gradient(45deg, #F8FAFC, #F8FAFC 4px, #F1F5F9 4px, #F1F5F9 8px)',
                          }}
                          className="border-b border-r border-[#F1F5F9]"
                        />
                      )
                    }
                    if (coveredSlots[prof.id]?.has(slot)) return null

                    const activeAppts = appointments.filter(
                      (a) => a.professionalId === prof.id && a.startTime === slot && a.status !== 'CANCELLED',
                    )
                    const activeAppt = activeAppts[0] ?? null
                    const cancelledAppts = appointments.filter(
                      (a) => a.professionalId === prof.id && a.startTime === slot && a.status === 'CANCELLED',
                    )
                    const activeBlock = blocks.find(
                      (b) => b.professionalId === prof.id && b.startTime === slot && b.date === dateStr,
                    )
                    const hasAnything = activeAppts.length > 0 || cancelledAppts.length > 0 || !!activeBlock

                    const apptRowSpan = (() => {
                      if (!activeAppt) return 1
                      const si = slotIndexFor(activeAppt.startTime, intervalMin, timeSlots.length)
                      const maxSpans = durationSlotsFor(activeAppt.durationMinutes, intervalMin)
                      if (activeAppts.length > 1) {
                        return durationSlotsFor(activeAppt.durationMinutes, intervalMin)
                      }
                      for (let i = 1; i < maxSpans; i++) {
                        const ci = si + i
                        if (ci >= timeSlots.length) return i
                        if (appointments.some(
                          (a) => a.professionalId === prof.id &&
                                 a.startTime === timeSlots[ci] &&
                                 a.status !== 'CANCELLED' &&
                                 !activeAppts.some(aa => aa.id === a.id)
                        )) return i
                      }
                      return maxSpans
                    })()
                    const blockRowSpan = activeBlock ? (() => {
                      const [sh, sm] = activeBlock.startTime.split(':').map(Number)
                      const [eh, em] = activeBlock.endTime.split(':').map(Number)
                      return durationSlotsFor(Math.max(intervalMin, (eh * 60 + em) - (sh * 60 + sm)), intervalMin)
                    })() : 1
                    const rowSpan = activeAppts.length > 0 ? apptRowSpan : activeBlock ? blockRowSpan : 1
                    const cellH = rowSpan * slotHeight

                    const isDragTarget = dragOverSlot?.slot === slot && dragOverSlot?.profId === prof.id
                    return (
                      <td
                        key={prof.id}
                        rowSpan={rowSpan}
                        onClick={!hasAnything && !dragging ? (e) => {
                          if (e.shiftKey) {
                            setAddingBlock({ profId: prof.id, time: slot })
                          } else {
                            onSlotClick?.(prof.id, slot, dateStr)
                          }
                        } : undefined}
                        onKeyDown={
                          !hasAnything && !dragging
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  onSlotClick?.(prof.id, slot, dateStr)
                                }
                              }
                            : undefined
                        }
                        tabIndex={!hasAnything && !dragging ? 0 : undefined}
                        onDragOver={(e) => {
                          if (!dragging || dragging.profId !== prof.id) return
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'move'
                          setDragOverSlot({ slot, profId: prof.id })
                        }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={async (e) => {
                          e.preventDefault()
                          if (!dragging || dragging.profId !== prof.id) return
                          setDragOverSlot(null)
                          if (slot === dragging.origSlot) { setDragging(null); return }
                          const { apptId } = dragging
                          setDragging(null)
                          try {
                            const token = localStorage.getItem('accessToken')
                            const base = process.env.NEXT_PUBLIC_API_URL
                            await fetch(`${base}/api/v1/appointments/${apptId}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ startTime: slot, date: dateStr }),
                            })
                            onSuccess?.()
                          } catch { /* silent */ }
                        }}
                        className={cn(
                          'border-b border-r border-[#F1F5F9] align-top group',
                          isToday ? 'bg-[#FAFCFF]' : 'bg-white',
                          !hasAnything && !dragging && 'cursor-pointer hover:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]',
                          hasAnything && 'p-0.5',
                          isDragTarget && 'bg-[#EFF6FF] ring-2 ring-inset ring-[#2563EB]',
                        )}
                        style={{ height: `${cellH}px` }}
                        title={!hasAnything && !dragging ? 'Clique para agendar · Shift+clique para bloquear' : undefined}
                      >
                        {activeBlock && !activeAppt && !cancelledAppts.length ? (
                          <div style={{ height: '100%' }}>
                            <div style={{
                              background: 'repeating-linear-gradient(45deg, #F1F5F9, #F1F5F9 4px, #E2E8F0 4px, #E2E8F0 8px)',
                              border: '0.5px solid #CBD5E1',
                              borderLeft: '3px solid #94A3B8',
                              borderRadius: 4,
                              padding: '4px 6px',
                              height: '100%',
                              boxSizing: 'border-box',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 11 }}>🔒</span>
                                <p style={{ fontSize: 11, fontWeight: 500, color: '#475569', margin: 0 }}>{activeBlock.startTime} → {activeBlock.endTime}</p>
                              </div>
                              {activeBlock.reason && (
                                <p style={{ fontSize: 10, color: '#64748B', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeBlock.reason}</p>
                              )}
                            </div>
                          </div>
                        ) : hasAnything ? (
                          <div className={cn('flex h-full gap-0.5 flex-row')}>
                            {activeAppts.length > 1 ? (
                              activeAppts.map((appt) => (
                                <div
                                  key={appt.id}
                                  style={{ flex: 1, minWidth: 0, ...(dragging?.apptId === appt.id ? { opacity: 0.5 } : {}) }}
                                  draggable={['SCHEDULED', 'CONFIRMED'].includes(appt.status)}
                                  onDragStart={(e) => {
                                    if (!['SCHEDULED', 'CONFIRMED'].includes(appt.status)) { e.preventDefault(); return }
                                    setDragging({ apptId: appt.id, profId: prof.id, origSlot: slot })
                                    e.dataTransfer.effectAllowed = 'move'
                                  }}
                                  onDragEnd={() => setDragging(null)}
                                >
                                  <AppointmentBlock
                                    appointment={appt}
                                    onClick={() => onAppointmentClick?.(appt)}
                                    heightPx={slotHeight - 4}
                                  />
                                </div>
                              ))
                            ) : activeAppt ? (
                              <div
                                className={cn('min-w-0', cancelledAppts.length > 0 ? 'flex-1' : 'w-full h-full')}
                                draggable={['SCHEDULED', 'CONFIRMED'].includes(activeAppt.status)}
                                onDragStart={(e) => {
                                  if (!['SCHEDULED', 'CONFIRMED'].includes(activeAppt.status)) { e.preventDefault(); return }
                                  setDragging({ apptId: activeAppt.id, profId: prof.id, origSlot: slot })
                                  e.dataTransfer.effectAllowed = 'move'
                                }}
                                onDragEnd={() => setDragging(null)}
                                style={dragging?.apptId === activeAppt.id ? { opacity: 0.5 } : undefined}
                              >
                                <AppointmentBlock
                                  appointment={activeAppt}
                                  onClick={() => onAppointmentClick?.(activeAppt)}
                                  heightPx={cellH - 4}
                                />
                              </div>
                            ) : null}
                            {activeAppts.length <= 1 && cancelledAppts.map((ca) => (
                              <div
                                key={ca.id}
                                className={cn('min-w-0', activeAppt ? 'flex-1' : 'w-full')}
                                style={{ height: `${slotHeight - 4}px` }}
                              >
                                <AppointmentBlock
                                  appointment={ca}
                                  onClick={() => onAppointmentClick?.(ca)}
                                  heightPx={slotHeight - 4}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span
                            className="flex h-full items-center justify-center opacity-0 transition-opacity duration-100 group-hover:opacity-100 motion-reduce:transition-none"
                            aria-hidden="true"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold leading-none text-white">
                              +
                            </span>
                          </span>
                        )}
                      </td>
                    )
                  }) : (
                    <td
                      className="border-b border-r border-[#F1F5F9] bg-white"
                      style={{ height: `${slotHeight}px` }}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Now line ── */}
          {nowTop !== null && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
              style={{ top: `${theadH + nowTop}px` }}
            >
              <div className="flex w-20 shrink-0 justify-end pr-1">
                <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
              </div>
              <div className="h-[2px] flex-1 bg-[#DC2626]" />
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ padding: '8px 16px', borderTop: '0.5px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {LEGEND.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, background: s.bg, border: `0.5px solid ${s.color}50`, borderLeft: `2px solid ${s.color}`, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#64748B' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ width: 1, background: '#E2E8F0', height: 14, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#15803D', lineHeight: 1 }}>$</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#64748B' }}>Pago</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#92400E', lineHeight: 1 }}>$</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#64748B' }}>Pendente</span>
        </div>
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>Shift+clique para bloquear horário</span>
      </div>

      {/* ── Block form overlay ── */}
      {addingBlock && (
        <BlockForm
          initialTime={addingBlock.time}
          timeSlots={timeSlots}
          onAdd={(start, end, reason) => {
            setBlocks((prev) => [
              ...prev,
              { id: `block-${Date.now()}`, professionalId: addingBlock.profId, date: dateStr, startTime: start, endTime: end, reason },
            ])
            setAddingBlock(null)
          }}
          onCancel={() => setAddingBlock(null)}
        />
      )}
    </div>
  )
}
