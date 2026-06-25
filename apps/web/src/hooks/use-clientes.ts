'use client'
import { useState, useEffect } from 'react'
import { FEATURES } from '@/lib/features'
import { clientesApi } from '@/lib/api/clientes'
import { MOCK_CLIENTES, type Cliente } from '@/lib/clientes-mock'

export function useClientes(params?: { search?: string }) {
  const [data, setData]       = useState<Cliente[]>(() => FEATURES.realClientes ? [] : MOCK_CLIENTES)
  const [loading, setLoading] = useState(FEATURES.realClientes)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!FEATURES.realClientes) return
    let cancelled = false
    setLoading(true)
    setError(null)
    clientesApi.list(params)
      .then((res: unknown) => {
        if (!cancelled) setData((res as { data: Cliente[] }).data)
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar clientes')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [params?.search])

  return { data, loading, error }
}
