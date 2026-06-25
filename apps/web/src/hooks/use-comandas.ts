'use client'
import { useState, useEffect, useCallback } from 'react'
import { FEATURES } from '@/lib/features'
import { comandasApi } from '@/lib/api/comandas'
import { MOCK_COMANDAS, type Comanda } from '@/lib/comanda-mock'

export function useComandas() {
  const [data, setData]       = useState<Comanda[]>(() => FEATURES.realComandas ? [] : MOCK_COMANDAS)
  const [loading, setLoading] = useState(FEATURES.realComandas)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!FEATURES.realComandas) return
    let cancelled = false
    setLoading(true)
    setError(null)
    comandasApi.list()
      .then((res: unknown) => {
        if (!cancelled) setData((res as Comanda[]) ?? [])
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
