'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { servicosApi } from '@/lib/api/servicos'
import { MOCK_SERVICOS, type Servico } from '@/lib/servicos-mock'

// Backend Service shape (Prisma model `services`)
interface ApiService {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: number | string
  active: boolean
}

function mapService(api: ApiService): Servico {
  return {
    id: api.id,
    name: api.name,
    category: '',
    description: api.description ?? '',
    duration: api.durationMin,
    price: Number(api.price),
    status: api.active ? 'active' : 'inactive',
    professionals: [],
    photos: [],
    bookingsThisMonth: 0,
    bookingsTotal: 0,
    revenueThisMonth: 0,
    revenueTotal: 0,
    monthlyData: [],
  }
}

export interface ServicoInput {
  name: string
  description?: string
  durationMin: number
  price: number
  active?: boolean
  categoryId?: string | null
}

export function useServicos() {
  const [data, setData]       = useState<Servico[]>(() => FEATURES.realServicos ? [] : MOCK_SERVICOS)
  const [loading, setLoading] = useState(FEATURES.realServicos)
  const [error, setError]     = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!FEATURES.realServicos) return
    setLoading(true)
    setError(null)
    try {
      const res = await servicosApi.list()
      setData(((res as ApiService[]) ?? []).map(mapService))
    } catch {
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!FEATURES.realServicos) return
    setLoading(true)
    setError(null)
    servicosApi.list()
      .then((res: unknown) => {
        if (!cancelled) setData(((res as ApiService[]) ?? []).map(mapService))
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar serviços')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const create = useCallback(async (input: ServicoInput) => {
    await servicosApi.create(input)
    await refetch()
  }, [refetch])

  const update = useCallback(async (id: string, input: Partial<ServicoInput>) => {
    await servicosApi.update(id, input)
    await refetch()
  }, [refetch])

  const remove = useCallback(async (id: string) => {
    await servicosApi.delete(id)
    await refetch()
  }, [refetch])

  const toggleStatus = useCallback(async (id: string, active: boolean) => {
    setData(prev => prev.map(s => s.id === id ? { ...s, status: active ? 'active' : 'inactive' } : s))
    try {
      if (FEATURES.realServicos) await servicosApi.update(id, { active })
    } catch {
      setData(prev => prev.map(s => s.id === id ? { ...s, status: active ? 'inactive' : 'active' } : s))
    }
  }, [])

  return { data, loading, error, refetch, create, update, remove, toggleStatus }
}
