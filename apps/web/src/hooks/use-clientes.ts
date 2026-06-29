'use client'
import { useCallback, useEffect, useState } from 'react'
import { clientesApi } from '@/lib/api/clientes'
import { type Cliente, type ClientTag, type VisitHistory } from '@/lib/clientes-mock'

function toFrontend(raw: Record<string, unknown>): Cliente {
  const metrics = (raw.metrics as Record<string, unknown>) ?? {}
  const rawHistory = (metrics.history as unknown[]) ?? []

  const history: VisitHistory[] = rawHistory.map((item: unknown) => {
    const h = item as Record<string, unknown>
    const s = h.status as string
    const status: VisitHistory['status'] =
      s === 'COMPLETED' ? 'COMPLETED' : s === 'NO_SHOW' ? 'NO_SHOW' : 'CANCELLED'
    return {
      id: String(h.id ?? ''),
      date: String(h.startAt ?? '').slice(0, 10),
      service: String(h.serviceName ?? ''),
      professional: '',
      amount: Number(h.servicePrice ?? 0),
      status,
      paymentMethod: '',
    }
  })

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
    visitCount: Number(metrics.visits ?? raw.visitCount ?? 0),
    lastVisit: metrics.lastAppointmentAt ? String(metrics.lastAppointmentAt).slice(0, 10) : null,
    lastVisitService: String(metrics.lastService ?? raw.lastVisitService ?? ''),
    lastVisitProfessional: String(raw.lastVisitProfessional ?? ''),
    nextAppointment: metrics.nextAppointmentAt ? String(metrics.nextAppointmentAt).slice(0, 10) : null,
    nextAppointmentTime: String(raw.nextAppointmentTime ?? ''),
    nextAppointmentService: String(raw.nextAppointmentService ?? ''),
    nextAppointmentProfessional: String(raw.nextAppointmentProfessional ?? ''),
    avgTicket: Number(metrics.ticketMedio ?? raw.avgTicket ?? 0),
    totalSpent: Number(metrics.totalSpent ?? raw.totalSpent ?? 0),
    notes: String(raw.notes ?? ''),
    history,
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
  const [data, setData]       = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return Promise.resolve() }
    setLoading(true)
    setError(null)
    return clientesApi.list(params)
      .then((res: unknown) => { setData(parseList(res).map(toFrontend)) })
      .catch(() => { setError('Erro ao carregar clientes') })
      .finally(() => { setLoading(false) })
  }, [params?.search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    clientesApi.list(params)
      .then((res: unknown) => { if (!cancelled) setData(parseList(res).map(toFrontend)) })
      .catch(() => { if (!cancelled) setError('Erro ao carregar clientes') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params?.search]) // eslint-disable-line react-hooks/exhaustive-deps

  const create = useCallback(async (payload: unknown) => {
    await clientesApi.create(payload)
    await fetchData()
  }, [fetchData])

  const update = useCallback(async (id: string, payload: unknown) => {
    await clientesApi.update(id, payload)
    await fetchData()
  }, [fetchData])

  const updateField = useCallback(async (id: string, field: string, value: string) => {
    setData((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))
    try {
      await clientesApi.update(id, { [field]: value })
    } catch {
      void fetchData()
    }
  }, [fetchData])

  const remove = useCallback(async (id: string) => {
    await clientesApi.delete(id)
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, create, update, updateField, remove }
}
