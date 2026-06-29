'use client'
import { useState, useEffect, useCallback } from 'react'
import { comandasApi } from '@/lib/api/comandas'
import type { Comanda } from '@/lib/comanda-mock'

function transformComanda(raw: Record<string, unknown>): Comanda {
  return {
    ...raw,
    date:     raw.createdAt ? new Date(raw.createdAt as string) : new Date(),
    openedAt: raw.createdAt ? new Date(raw.createdAt as string) : new Date(),
  } as Comanda
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
