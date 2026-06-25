'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { relatoriosApi } from '@/lib/api/relatorios'
import { mockKpis, type KpiData } from '@/lib/mock-data'

export function useRelatorios() {
  const [data, setData]       = useState<KpiData[]>(() => FEATURES.realRelatorios ? [] : mockKpis)
  const [loading, setLoading] = useState(FEATURES.realRelatorios)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realRelatorios) return
    let cancelled = false
    setLoading(true)
    setError(null)
    relatoriosApi.kpis()
      .then((res: unknown) => {
        if (!cancelled) setData((res as KpiData[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar relatórios')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
