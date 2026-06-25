'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'
import { MOCK_PROFISSIONAIS, type Profissional } from '@/lib/profissionais-mock'

export function useProfissionais() {
  const [data, setData]       = useState<Profissional[]>(() => FEATURES.realProfissionais ? [] : MOCK_PROFISSIONAIS)
  const [loading, setLoading] = useState(FEATURES.realProfissionais)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realProfissionais) return
    let cancelled = false
    setLoading(true)
    setError(null)
    profissionaisApi.list()
      .then((res: unknown) => {
        if (!cancelled) setData((res as Profissional[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar profissionais')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
