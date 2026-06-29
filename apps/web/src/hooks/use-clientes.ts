'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { clientesApi } from '@/lib/api/clientes'
import { MOCK_CLIENTES, type Cliente, type ClientTag } from '@/lib/clientes-mock'

function toFrontend(raw: Record<string, unknown>): Cliente {
  return {
    id: String(raw.id ?? ''),
    clientNumber: typeof raw.clientNumber === 'number' ? raw.clientNumber : null,
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    cpf: String(raw.cpf ?? ''),
    birthDate: String(raw.birthDate ?? '').slice(0, 10) || '2000-01-01',
    clienteSince: String(raw.createdAt ?? '').slice(0, 10) || '2000-01-01',
    favoriteProfessional: String(raw.favoriteProfessionalId ?? ''),
    visitCount: Number(raw.visitCount ?? 0),
    lastVisit: raw.lastVisit ? String(raw.lastVisit).slice(0, 10) : null,
    lastVisitService: String(raw.lastVisitService ?? ''),
    lastVisitProfessional: String(raw.lastVisitProfessional ?? ''),
    nextAppointment: raw.nextAppointment ? String(raw.nextAppointment).slice(0, 10) : null,
    nextAppointmentTime: String(raw.nextAppointmentTime ?? ''),
    nextAppointmentService: String(raw.nextAppointmentService ?? ''),
    nextAppointmentProfessional: String(raw.nextAppointmentProfessional ?? ''),
    avgTicket: Number(raw.avgTicket ?? 0),
    totalSpent: Number(raw.totalSpent ?? 0),
    notes: String(raw.notes ?? ''),
    history: [],
    upcoming: [],
    serviceFreq: [],
    tags: [] as ClientTag[],
  }
}

function parseList(res: unknown): Record<string, unknown>[] {
  if (Array.isArray(res)) return res as Record<string, unknown>[]
  const nested = (res as { data?: unknown }).data
  if (Array.isArray(nested)) return nested as Record<string, unknown>[]
  return []
}

export function useClientes(params?: { search?: string }) {
  const [data, setData]       = useState<Cliente[]>(() => FEATURES.realClientes ? [] : MOCK_CLIENTES)
  const [loading, setLoading] = useState(FEATURES.realClientes)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!FEATURES.realClientes) return Promise.resolve()
    setLoading(true)
    setError(null)
    return clientesApi.list(params)
      .then((res: unknown) => { setData(parseList(res).map(toFrontend)) })
      .catch(() => { setError('Erro ao carregar clientes') })
      .finally(() => { setLoading(false) })
  }, [params?.search])

  useEffect(() => {
    if (!FEATURES.realClientes) return
    let cancelled = false
    setLoading(true)
    setError(null)
    clientesApi.list(params)
      .then((res: unknown) => { if (!cancelled) setData(parseList(res).map(toFrontend)) })
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

  const updateField = useCallback(async (id: string, field: string, value: string) => {
    if (!FEATURES.realClientes) return
    setData((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))
    try {
      await clientesApi.update(id, { [field]: value })
    } catch {
      void fetchData()
    }
  }, [fetchData])

  const remove = useCallback(async (id: string) => {
    if (!FEATURES.realClientes) return
    await clientesApi.delete(id)
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, create, update, updateField, remove }
}
