'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'
import { MOCK_PROFISSIONAIS, type Profissional, type ProfissionalRole } from '@/lib/profissionais-mock'

function toFrontend(raw: Record<string, unknown>): Profissional {
  const specialty = raw.specialty as string | null | undefined
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    role: (specialty ?? '') as ProfissionalRole,
    specialties: specialty ? [specialty] : [],
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    cpf: '',
    birthDate: '',
    hireDate: String(raw.createdAt ?? '').slice(0, 10),
    status: raw.active === true ? 'active' : 'inactive',
    bio: '',
    workDays: [],
    workStart: '',
    workEnd: '',
    commissionPct: Number(raw.commissionPct ?? 0),
    appointmentsToday: 0,
    appointmentsThisMonth: 0,
    revenueThisMonth: 0,
    appointmentsTotal: 0,
    revenueTotal: 0,
    avgTicket: 0,
    rating: 0,
    ratingCount: 0,
    monthlyData: [],
    upcoming: [],
  }
}

function parseList(res: unknown): Profissional[] {
  if (!Array.isArray(res)) return []
  return (res as Record<string, unknown>[]).map(toFrontend)
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
      .then((res: unknown) => { setData(parseList(res)) })
      .catch(() => { setError('Erro ao carregar profissionais') })
      .finally(() => { setLoading(false) })
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!FEATURES.realProfissionais) return
    setLoading(true)
    setError(null)
    profissionaisApi.list()
      .then((res: unknown) => { if (!cancelled) setData(parseList(res)) })
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
