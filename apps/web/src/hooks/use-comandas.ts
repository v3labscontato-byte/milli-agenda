'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { comandasApi } from '@/lib/api/comandas'
import { MOCK_COMANDAS, type Comanda } from '@/lib/comanda-mock'

export function useComandas() {
  const [data, setData]       = useState<Comanda[]>(() => FEATURES.realComandas ? [] : MOCK_COMANDAS)
  const [loading, setLoading] = useState(FEATURES.realComandas)
  const [error, setError]     = useState<string | null>(null)

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
  }, [])

  return { data, loading, error }
}
