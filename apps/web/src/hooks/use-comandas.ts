'use client'
import { useState, useEffect, useCallback } from 'react'
import { comandasApi } from '@/lib/api/comandas'
import { type Comanda, type ComandaStatus, type ItemCategory } from '@/lib/comanda-mock'

function mapStatus(s: string): ComandaStatus {
  if (s === 'CLOSED') return 'PAID'
  return (s as ComandaStatus) ?? 'OPEN'
}

function transformComanda(raw: Record<string, unknown>): Comanda {
  const client = (raw.client as Record<string, unknown>) ?? {}
  const items = (raw.items as unknown[]) ?? []
  const appointments = (raw.appointments as unknown[]) ?? []
  const appt = appointments[0] as Record<string, unknown> | undefined
  const apptService = appt ? (appt.service as Record<string, unknown> | null) : null
  const apptProf = appt ? (appt.professional as Record<string, unknown> | null) : null

  return {
    id: raw.id as string,
    number: (raw.id as string).slice(-6).toUpperCase(),
    clientName: (client.name as string) ?? '—',
    service: (apptService?.name as string) ?? '—',
    professional: (apptProf?.name as string) ?? '—',
    date: raw.openedAt ? new Date(raw.openedAt as string) : new Date(),
    startTime: appt?.startAt ? new Date(appt.startAt as string).toISOString().slice(11, 16) : '',
    endTime: appt?.endAt ? new Date(appt.endAt as string).toISOString().slice(11, 16) : '',
    items: items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const svc = i.service as Record<string, unknown> | null
      return {
        id: i.id as string,
        name: (svc?.name as string) ?? (i.name as string) ?? '—',
        category: 'service' as ItemCategory,
        quantity: Number(i.quantity ?? 1),
        unitPrice: Number(i.unitPrice ?? 0),
      }
    }),
    discount: null,
    deposit: null,
    status: mapStatus(raw.status as string),
    openedAt: raw.openedAt ? new Date(raw.openedAt as string) : new Date(),
  }
}

export function useComandas() {
  const [data, setData]       = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    comandasApi.list()
      .then((res: unknown) => {
        if (!cancelled) {
          const arr = Array.isArray(res) ? res : []
          setData(arr.map(transformComanda))
        }
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar comandas')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [tick])

  return { data, loading, error, refetch }
}
