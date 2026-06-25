'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'
import { MOCK_PROFISSIONAIS, type Profissional } from '@/lib/profissionais-mock'

type ApiProfissional = Record<string, unknown>

function mapApiProfissional(raw: ApiProfissional): Profissional {
  return {
    ...(raw as unknown as Profissional),
    // Backend usa `active: boolean`; frontend espera `status: 'active'|'vacation'|'inactive'`
    status: raw.active === false ? 'inactive' : 'active',
    commissionPct: Number(raw.commissionPct ?? 0) as unknown as Profissional['commissionPct'],
    rating: Number(raw.rating ?? 0),
    ratingCount: Number(raw.ratingCount ?? 0),
  }
}

export function useProfissionais() {
  const [data, setData]       = useState<Profissional[]>(() => FEATURES.realProfissionais ? [] : MOCK_PROFISSIONAIS)
  const [loading, setLoading] = useState(FEATURES.realProfissionais)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!FEATURES.realProfissionais) return Promise.resolve()
    setLoading(true)
    setError(null)
    return profissionaisApi.list()
      .then((res: unknown) => { setData(((res as ApiProfissional[]) ?? []).map(mapApiProfissional)) })
      .catch(() => { setError('Erro ao carregar profissionais') })
      .finally(() => { setLoading(false) })
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!FEATURES.realProfissionais) return
    setLoading(true)
    setError(null)
    profissionaisApi.list()
      .then((res: unknown) => { if (!cancelled) setData(((res as ApiProfissional[]) ?? []).map(mapApiProfissional)) })
      .catch(() => { if (!cancelled) setError('Erro ao carregar profissionais') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const create = useCallback(async (payload: unknown) => {
    if (!FEATURES.realProfissionais) return
    await profissionaisApi.create(payload)
    await fetchData()
  }, [fetchData])

  const update = useCallback(async (id: string, payload: unknown) => {
    if (!FEATURES.realProfissionais) return
    await profissionaisApi.update(id, payload)
    await fetchData()
  }, [fetchData])

  const remove = useCallback(async (id: string) => {
    if (!FEATURES.realProfissionais) return
    await profissionaisApi.update(id, { status: 'inactive' })
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, create, update, remove }
}
