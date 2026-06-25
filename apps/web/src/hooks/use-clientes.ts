'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { clientesApi } from '@/lib/api/clientes'
import { MOCK_CLIENTES, type Cliente } from '@/lib/clientes-mock'

export function useClientes(params?: { search?: string }) {
  const [data, setData]       = useState<Cliente[]>(() => FEATURES.realClientes ? [] : MOCK_CLIENTES)
  const [loading, setLoading] = useState(FEATURES.realClientes)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!FEATURES.realClientes) return Promise.resolve()
    setLoading(true)
    setError(null)
    return clientesApi.list(params)
      .then((res: unknown) => { setData((res as Cliente[]) ?? []) })
      .catch(() => { setError('Erro ao carregar clientes') })
      .finally(() => { setLoading(false) })
  }, [params?.search])

  useEffect(() => {
    if (!FEATURES.realClientes) return
    let cancelled = false
    setLoading(true)
    setError(null)
    clientesApi.list(params)
      .then((res: unknown) => { if (!cancelled) setData((res as Cliente[]) ?? []) })
      .catch(() => { if (!cancelled) setError('Erro ao carregar clientes') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params?.search])

  const create = useCallback(async (payload: unknown) => {
    if (!FEATURES.realClientes) return
    await clientesApi.create(payload)
    await fetchData()
  }, [fetchData])

  const update = useCallback(async (id: string, payload: unknown) => {
    if (!FEATURES.realClientes) return
    await clientesApi.update(id, payload)
    await fetchData()
  }, [fetchData])

  const remove = useCallback(async (id: string) => {
    if (!FEATURES.realClientes) return
    await clientesApi.delete(id)
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, create, update, remove }
}
