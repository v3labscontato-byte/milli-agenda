'use client'

import { useState, useCallback } from 'react'
import { startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  MOCK_CALENDAR_APPOINTMENTS,
  CALENDAR_PROFESSIONALS,
  getAppointmentsForDate,
  nextDay,
  prevDay,
  type CalendarAppointment,
} from '@/lib/calendar-utils'
import type { Appointment } from '@/lib/mock-data'
import CalendarHeader from '@/components/agenda/calendar-header'
import CalendarGrid from '@/components/agenda/calendar-grid'
import WeeklyOverview from '@/components/agenda/weekly-overview'
import AppointmentModal from '@/components/agenda/appointment-modal'
import NewAppointmentModal from '@/components/agenda/new-appointment-modal'
import AgendaTable from '@/components/agenda-table'

function toAppointment(ca: CalendarAppointment): Appointment {
  const prof = CALENDAR_PROFESSIONALS.find((p) => p.id === ca.professionalId)
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
  const [newModalOpen, setNewModalOpen]   = useState(false)
  const [newModalPrefill, setNewModalPrefill] = useState<NewModalPrefill>({})
  const [searchQuery, setSearchQuery]     = useState('')

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

  const handleDaySelect = useCallback((professionalId: string, date: Date) => {
    setSelectedDate(date)
    setFilterProfId(professionalId)
    setView('day')
  }, [])

  const handleSlotClick = useCallback((professionalId: string, time: string, date: string) => {
    setNewModalPrefill({ profId: professionalId, date, time })
    setNewModalOpen(true)
  }, [])

  const handleReschedule = useCallback((appt: CalendarAppointment) => {
    setSelectedAppt(null)
    setNewModalPrefill({
      profId:      appt.professionalId,
      date:        appt.date,
      time:        appt.startTime,
      service:     appt.service,
      client:      appt.client,
      isReschedule: true,
    })
    setNewModalOpen(true)
  }, [])

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const allAppointments = MOCK_CALENDAR_APPOINTMENTS
  const dayAppointments = getAppointmentsForDate(selectedDate, MOCK_CALENDAR_APPOINTMENTS)

  const filtered = dayAppointments.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProf = !filterProfId || a.professionalId === filterProfId
    return matchesSearch && matchesProf
  })

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
                if (v === 'week') setFilterProfId(null)
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
            {filterProfId}
            <span aria-hidden="true" className="ml-0.5 opacity-60">×</span>
          </button>
        )}
      </div>

      {/* Content area */}
      {view === 'week' ? (
        <div className="flex-1 overflow-auto">
          <WeeklyOverview weekStart={weekStart} onDaySelect={handleDaySelect} />
          <div className="border-t border-[#E2E8F0] px-6 pb-10 pt-4">
            <h2 className="mb-4 text-[16px] font-medium text-[#0F172A]">
              Atendimentos da Semana
            </h2>
            <AgendaTable appointments={allAppointments.map(toAppointment)} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <CalendarGrid
            appointments={filtered}
            selectedDate={selectedDate}
            onAppointmentClick={setSelectedAppt}
            onSlotClick={handleSlotClick}
          />
        </div>
      )}

      <AppointmentModal
        appointment={selectedAppt}
        onClose={closeAppt}
        onReschedule={handleReschedule}
      />

      <NewAppointmentModal
        open={newModalOpen}
        onClose={closeNew}
        initialProfessionalId={newModalPrefill.profId}
        initialDate={newModalPrefill.date}
        initialTime={newModalPrefill.time}
        initialService={newModalPrefill.service}
        isReschedule={newModalPrefill.isReschedule}
        rescheduleClientName={newModalPrefill.client}
      />
    </div>
  )
}
