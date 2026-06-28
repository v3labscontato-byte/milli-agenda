'use client'
import { useState, useEffect } from 'react'
import { agendaApi } from '@/lib/api/agenda'
import { type CalendarAppointment } from '@/lib/calendar-utils'
import type { AppointmentStatus } from '@/lib/mock-data'

function transformApiResponse(raw: unknown): CalendarAppointment {
  const r = raw as Record<string, unknown>

  // If it's already a CalendarAppointment (from mock data), return as-is
  if ('date' in r && 'startTime' in r && typeof r.date === 'string' && typeof r.startTime === 'string') {
    return r as unknown as CalendarAppointment
  }

  // Transform from API response (with startAt/endAt DateTime fields)
  const startAt = new Date(r.startAt as string)
  const endAt = new Date(r.endAt as string)
  const prof = (r.professional as any) ?? {}
  const client = (r.client as any) ?? {}
  const service = (r.service as any) ?? {}
  const status = (r.status as AppointmentStatus) ?? 'SCHEDULED'

  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    id: r.id as string,
    date: (r.startAt as string).slice(0, 10),
    startTime: `${pad(startAt.getUTCHours())}:${pad(startAt.getUTCMinutes())}`,
    endTime: `${pad(endAt.getUTCHours())}:${pad(endAt.getUTCMinutes())}`,
    durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60000),
    client: client.name as string,
    service: service.name as string,
    serviceId: r.serviceId as string,
    professionalId: r.professionalId as string,
    amount: Number(service.price ?? r.amount ?? 0),
    status,
    commandId: r.commandId as string | undefined,
  }
}

export function useAgenda(params?: { date?: string; professionalId?: string; _key?: number }) {
  const [data, setData]       = useState<CalendarAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) { setLoading(false); return }
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
