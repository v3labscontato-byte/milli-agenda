'use client'
import { useState, useEffect, useCallback } from 'react'
import { comandasApi } from '@/lib/api/comandas'
import { type Comanda, type ComandaStatus, type ItemCategory } from '@/lib/comanda-mock'

function transformComanda(raw: Record<string, unknown>): Comanda {
  const client = (raw.client as Record<string, unknown>) ?? {}
  const items = (raw.items as unknown[]) ?? []
  const appointments = (raw.appointments as unknown[]) ?? []
  const appt = appointments[0] as Record<string, unknown> | undefined
  const apptProf = (appt?.professional as Record<string, unknown>) ?? {}
  const apptSvc = (appt?.service as Record<string, unknown>) ?? {}

  const startAt = appt?.startAt ? new Date(appt.startAt as string) : null
  const endAt = appt?.endAt ? new Date(appt.endAt as string) : null
  const pad = (n: number) => String(n).padStart(2, '0')

  const statusMap: Record<string, ComandaStatus> = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    CLOSED: 'PAID',
    CANCELLED: 'CANCELLED',
  }

  return {
    id: raw.id as string,
    number: (raw.id as string).slice(-6).toUpperCase(),
    clientName: (client.name as string) ?? '—',
    service: (apptSvc.name as string) ?? '—',
    professional: (apptProf.name as string) ?? '—',
    date: raw.openedAt ? new Date(raw.openedAt as string) : new Date(),
    startTime: startAt ? `${pad(startAt.getUTCHours())}:${pad(startAt.getUTCMinutes())}` : '',
    endTime: endAt ? `${pad(endAt.getUTCHours())}:${pad(endAt.getUTCMinutes())}` : '',
    items: items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const svc = (i.service as Record<string, unknown>) ?? {}
      return {
        id: i.id as string,
        name: (svc.name as string) ?? (i.name as string) ?? '—',
        category: 'service' as ItemCategory,
        quantity: Number(i.quantity ?? 1),
        unitPrice: Number(i.unitPrice ?? 0),
      }
    }),
    discount: null,
    deposit: null,
    status: statusMap[raw.status as string] ?? 'OPEN',
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
