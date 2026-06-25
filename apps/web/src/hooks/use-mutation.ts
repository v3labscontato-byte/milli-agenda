'use client'
import { useState } from 'react'

export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function mutate(data: T): Promise<R | null> {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(data)
      return result
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
