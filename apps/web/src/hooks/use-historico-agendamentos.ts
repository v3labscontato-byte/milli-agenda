'use client'
import { useState, useEffect, useCallback } from 'react'
import { type CalendarAppointment } from '@/lib/calendar-utils'

function transformApiResponse(raw: Record<string, unknown>): CalendarAppointment {
  const startAt = new Date(raw.startAt as string)
  const endAt = new Date(raw.endAt as string)
  const prof = (raw.professional as Record<string, unknown>) ?? {}
  const client = (raw.client as Record<string, unknown>) ?? {}
  const service = (raw.service as Record<string, unknown>) ?? {}
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    id: raw.id as string,
    date: (raw.startAt as string).slice(0, 10),
    startTime: `${pad(startAt.getUTCHours())}:${pad(startAt.getUTCMinutes())}`,
    endTime: `${pad(endAt.getUTCHours())}:${pad(endAt.getUTCMinutes())}`,
    durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60000),
    client: (client.name as string) ?? '—',
    service: (service.name as string) ?? '—',
    serviceId: raw.serviceId as string | undefined,
    professionalId: (raw.professionalId as string) ?? '',
    professional: (prof.name as string) ?? undefined,
    amount: Number(service.price ?? 0),
    status: (raw.status as CalendarAppointment['status']) ?? 'SCHEDULED',
    commandId: raw.commandId as string | undefined,
    clientId: raw.clientId as string | undefined,
  }
}

export function useHistoricoAgendamentos() {
  const [data, setData]       = useState<CalendarAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const tenantSlug = localStorage.getItem('tenantSlug') ?? ''
    if (!token) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 90)
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments?from=${fmt(from)}&to=${fmt(to)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Slug': tenantSlug,
        },
      },
    )
      .then((r) => r.json())
      .then((r) => {
        if (!cancelled) {
          const arr = Array.isArray(r.data) ? r.data : []
          setData(arr.map(transformApiResponse))
        }
      })
      .catch(() => { if (!cancelled) setError('Erro ao carregar histórico') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, loading, error, refetch }
}
