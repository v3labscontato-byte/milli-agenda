'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FEATURES } from '@/lib/features'
import { agendaApi } from '@/lib/api/agenda'
import { MOCK_CALENDAR_APPOINTMENTS, type CalendarAppointment } from '@/lib/calendar-utils'
import type { AppointmentStatus } from '@/lib/mock-data'

function transformApiResponse(raw: unknown): CalendarAppointment {
  const r = raw as Record<string, unknown>
  const startAt = new Date(r.startAt as string)
  const endAt = new Date(r.endAt as string)
  const prof = (r.professional as any) ?? {}
  const client = (r.client as any) ?? {}
  const service = (r.service as any) ?? {}
  const status = (r.status as AppointmentStatus) ?? 'SCHEDULED'

  return {
    id: r.id as string,
    date: format(startAt, 'yyyy-MM-dd'),
    startTime: format(startAt, 'HH:mm'),
    endTime: format(endAt, 'HH:mm'),
    durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60000),
    client: client.name as string,
    service: service.name as string,
    professionalId: r.professionalId as string,
    amount: (r.amount as number) ?? 0,
    status,
  }
}

export function useAgenda(params?: { date?: string; professionalId?: string; _key?: number }) {
  const [data, setData]       = useState<CalendarAppointment[]>(() => FEATURES.realAgenda ? [] : MOCK_CALENDAR_APPOINTMENTS)
  const [loading, setLoading] = useState(FEATURES.realAgenda)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realAgenda) return
    let cancelled = false
    setLoading(true)
    setError(null)
    agendaApi.list({ date: params?.date, professionalId: params?.professionalId })
      .then((res: unknown) => {
        if (!cancelled) {
          const arr = Array.isArray(res) ? res : []
          const transformed = arr.map(transformApiResponse)
          setData(transformed)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar agendamentos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [params?.date, params?.professionalId, params?._key])

  return { data, loading, error }
}
