'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { servicosApi } from '@/lib/api/servicos'
import { MOCK_SERVICOS, type Servico } from '@/lib/servicos-mock'

export function useServicos() {
  const [data, setData]       = useState<Servico[]>(() => FEATURES.realServicos ? [] : MOCK_SERVICOS)
  const [loading, setLoading] = useState(FEATURES.realServicos)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realServicos) return
    let cancelled = false
    setLoading(true)
    setError(null)
    servicosApi.list()
      .then((res: unknown) => {
        if (!cancelled) setData((res as Servico[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar serviços')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
