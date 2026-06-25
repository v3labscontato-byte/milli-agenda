'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { agendaApi } from '@/lib/api/agenda'
import { MOCK_CALENDAR_APPOINTMENTS, type CalendarAppointment } from '@/lib/calendar-utils'

export function useAgenda(params?: { date?: string; professionalId?: string }) {
  const [data, setData]       = useState<CalendarAppointment[]>(() => FEATURES.realAgenda ? [] : MOCK_CALENDAR_APPOINTMENTS)
  const [loading, setLoading] = useState(FEATURES.realAgenda)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realAgenda) return
    let cancelled = false
    setLoading(true)
    setError(null)
    agendaApi.list(params)
      .then((res: unknown) => {
        if (!cancelled) setData((res as CalendarAppointment[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar agendamentos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [params?.date, params?.professionalId])

  return { data, loading, error }
}
