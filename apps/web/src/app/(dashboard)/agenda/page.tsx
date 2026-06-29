'use client'

import { useState, useCallback, useMemo } from 'react'
import { startOfWeek, addDays, format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  getAppointmentsForDate,
  nextDay,
  prevDay,
  toDateString,
  type CalendarAppointment,
  type CalendarProfessional,
} from '@/lib/calendar-utils'
import { useAgenda } from '@/hooks/use-agenda'
import { useProfissionais } from '@/hooks/use-profissionais'
import type { Appointment } from '@/lib/mock-data'
import CalendarHeader from '@/components/agenda/calendar-header'
import DayTimeline from '@/components/agenda/day-timeline'
import WeeklyOverview from '@/components/agenda/weekly-overview'
import AppointmentModal from '@/components/agenda/appointment-modal'
import NovoAgendamentoModal from '@/components/agenda/novo-agendamento-modal'
import AgendaTable from '@/components/agenda-table'

const PROF_PALETTE = ['#7C3AED', '#2563EB', '#DB2777', '#059669', '#D97706', '#0891B2', '#DC2626']

function toCalendarProfessional(p: { id: string; name: string; role: string; workDays?: number[] }, idx: number): CalendarProfessional {
  const words = p.name.trim().split(/\s+/)
  const initials = words.length >= 2
    ? ((words[0]?.[0] ?? '') + ((words[words.length - 1] ?? '')[0] ?? '')).toUpperCase()
    : p.name.slice(0, 2).toUpperCase()
  return { id: p.id, name: p.name, role: p.role, initials, color: PROF_PALETTE[idx % PROF_PALETTE.length] ?? '#7C3AED', workDays: p.workDays ?? [] }
}

function toAppointment(ca: CalendarAppointment, profs: CalendarProfessional[]): Appointment {
  const prof = profs.find((p) => p.id === ca.professionalId)
  const initials = ca.client.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return {
    id: ca.id,
    time: ca.startTime,
    endTime: ca.endTime,
    duration: ca.durationMinutes,
    client: ca.client,
    clientInitials: initials,
    service: ca.service,
    professional: prof?.name ?? ca.professionalId,
    status: ca.status,
    amount: ca.amount,
    clientId: ca.clientId,
    date: ca.date,
  }
}

type View = 'week' | 'day'

interface NewModalPrefill {
  profId?: string
  date?: string
  time?: string
  service?: string
  client?: string
  isReschedule?: boolean
}

export default function AgendaPage() {
  const [view, setView]                   = useState<View>('week')
  const [selectedDate, setSelectedDate]   = useState<Date>(() => new Date())
  const [filterProfId, setFilterProfId]   = useState<string | null>(null)
  const [selectedAppt, setSelectedAppt]   = useState<CalendarAppointment | null>(null)
  const [newModalOpen, setNewModalOpen]       = useState(false)
  const [newModalPrefill, setNewModalPrefill] = useState<NewModalPrefill>({})
  const [searchQuery, setSearchQuery]     = useState('')
  const [refetchKey, setRefetchKey]       = useState(0)

  const goToToday = useCallback(() => setSelectedDate(new Date()), [])
  const goToPrev  = useCallback(() => setSelectedDate((d) => prevDay(d)), [])
  const goToNext  = useCallback(() => setSelectedDate((d) => nextDay(d)), [])
  const closeAppt = useCallback(() => setSelectedAppt(null), [])

  const openNew = useCallback(() => {
    setNewModalPrefill({})
    setNewModalOpen(true)
  }, [])

  const closeNew = useCallback(() => {
    setNewModalOpen(false)
    setNewModalPrefill({})
  }, [])

  const handleCreated = useCallback(() => setRefetchKey((k) => k + 1), [])

  const handleDaySelect = useCallback((professionalId: string, date: Date) => {
    setSelectedDate(date)
    setFilterProfId(professionalId)
    setView('day')
  }, [])

  const handleSlotClick = useCallback((professionalId: string, time: string, date: string) => {
    setNewModalPrefill({ profId: professionalId, date, time })
    setNewModalOpen(true)
  }, [])

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })

  const agendaParams = useMemo(() => {
    if (view === 'day') {
      return {
        date: toDateString(selectedDate),
        professionalId: filterProfId ?? undefined,
        _key: refetchKey,
      }
    }
    return {
      from: toDateString(weekStart),
      to: toDateString(addDays(weekStart, 6)),
      _key: refetchKey,
    }
  }, [view, selectedDate, filterProfId, refetchKey, weekStart])

  const { data: allAppointments, loading, error } = useAgenda(agendaParams)
  const { data: profissionais } = useProfissionais()
  const calendarProfessionals = useMemo(() => profissionais.map(toCalendarProfessional), [profissionais])

  if (typeof window !== 'undefined') {
    console.log('[DIA] allAppointments:', allAppointments.length)
    console.log('[DIA] dayAppointments:', getAppointmentsForDate(selectedDate, allAppointments).length)
    console.log('[DIA] calendarProfessionals:', calendarProfessionals.length)
    console.log('[DIA] selectedDate:', toDateString(selectedDate))
    if (allAppointments.length > 0) {
      console.log('[DIA] primeiro appt date:', allAppointments[0].date)
    }
  }

  const dayAppointments = getAppointmentsForDate(selectedDate, allAppointments)

  const tableDate = toDateString(selectedDate)
  const tableAppointments = allAppointments.filter((a) => a.date === tableDate)
  const tableTitle = `Agenda ${format(selectedDate, 'dd/MM')}`

  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="h-9 w-64 rounded-lg bg-[#F1F5F9]" />
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0,1,2,3,4,5].map((i) => <div key={i} className="h-16 rounded-lg bg-[#F1F5F9]" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-[#DC2626]">{error}</p>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <CalendarHeader
        selectedDate={selectedDate}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onNew={openNew}
        onDateSelect={setSelectedDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View toggle strip */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] bg-white px-6 py-2">
        <div
          className="flex overflow-hidden rounded-md border border-[#E2E8F0]"
          role="group"
          aria-label="Modo de visualização"
        >
          {(['week', 'day'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setView(v)
                setFilterProfId(null)
              }}
              aria-pressed={view === v}
              className={cn(
                'px-4 py-1.5 text-[13px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                view === v
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
              )}
            >
              {v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>

        {view === 'day' && filterProfId && (
          <button
            type="button"
            onClick={() => setFilterProfId(null)}
            aria-label="Remover filtro de profissional"
            className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[12px] font-medium text-[#2563EB] hover:bg-[#DBEAFE]"
          >
            {calendarProfessionals.find((p) => p.id === filterProfId)?.name ?? filterProfId}
            <span aria-hidden="true" className="ml-0.5 opacity-60">×</span>
          </button>
        )}
      </div>

      {/* Content area */}
      {view === 'week' ? (
        <div className="flex-1 overflow-auto">
          <WeeklyOverview
            weekStart={weekStart}
            onDaySelect={handleDaySelect}
            professionals={calendarProfessionals}
            appointments={allAppointments}
          />
          <div className="border-t border-[#E2E8F0] px-6 pb-10 pt-4">
            <h2 className="mb-4 text-[16px] font-medium text-[#0F172A]">{tableTitle}</h2>
            {tableAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <p className="font-medium text-slate-600">
                  Nenhum agendamento neste dia.
                </p>
                <p className="mt-1 text-sm">Clique em + Novo Agendamento para começar.</p>
              </div>
            ) : (
              <AgendaTable
                appointments={tableAppointments.map((ca) => toAppointment(ca, calendarProfessionals))}
                onReschedule={(id) => {
                  const calAppt = allAppointments.find((a) => a.id === id)
                  if (calAppt) setSelectedAppt(calAppt)
                }}
                onSuccess={handleCreated}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DayTimeline
            appointments={dayAppointments}
            professionals={calendarProfessionals}
            date={selectedDate}
            onAppointmentClick={setSelectedAppt}
            onSlotClick={handleSlotClick}
          />
        </div>
      )}

      <AppointmentModal
        appointment={selectedAppt}
        onClose={closeAppt}
        onSuccess={handleCreated}
      />

      {/* New appointment — real API (services/professionals from hooks, agendaApi.create) */}
      <NovoAgendamentoModal
        open={newModalOpen}
        defaultDate={newModalPrefill.date ?? toDateString(selectedDate)}
        initialProfessionalId={newModalPrefill.profId}
        initialTime={newModalPrefill.time}
        onClose={closeNew}
        onCreated={handleCreated}
      />

    </div>
  )
}
