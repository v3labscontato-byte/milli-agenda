'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { profissionaisApi } from '@/lib/api/profissionais'
import { MOCK_PROFISSIONAIS, type MonthlyData, type Profissional, type ProfissionalRole } from '@/lib/profissionais-mock'

function toFrontend(raw: Record<string, unknown>): Profissional {
  const specialty = raw.specialty as string | null | undefined
  const metrics = (raw.metrics as Record<string, unknown>) ?? {}
  const rawHistory = (metrics.monthlyHistory as unknown[]) ?? []
  const monthlyData: MonthlyData[] = rawHistory.map((item: unknown) => {
    const h = item as Record<string, unknown>
    return {
      month:             String(h.mes ?? ''),
      revenue:           Number(h.faturamento ?? 0),
      commission:        Number(h.comissao ?? 0),
      appointments:      Number(h.totalAgendamentos ?? 0),
      totalAgendamentos: Number(h.totalAgendamentos ?? 0),
      finalizados:       Number(h.finalizados ?? 0),
      pendentes:         Number(h.pendentes ?? 0),
      cancelados:        Number(h.cancelados ?? 0),
    }
  })
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    role: (specialty ?? '') as ProfissionalRole,
    specialties: specialty ? [specialty] : [],
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    cpf: String(raw.cpf ?? ''),
    birthDate: String(raw.birthDate ?? ''),
    vinculo: String(raw.vinculo ?? ''),
    hireDate: String(raw.createdAt ?? '').slice(0, 10),
    status: raw.active === true ? 'active' : 'inactive',
    bio: '',
    workDays: Array.isArray(raw.workDays) ? raw.workDays as number[] : [],
    workStart: String(raw.workStart ?? '08:00'),
    workEnd: String(raw.workEnd ?? '18:00'),
    commissionPct: Number(raw.commissionPct ?? 0),
    appointmentsToday: 0,
    appointmentsThisMonth: Number(metrics.agendMes ?? 0),
    revenueThisMonth: Number(metrics.fatMes ?? 0),
    appointmentsTotal: Number(metrics.totalVisits ?? 0),
    revenueTotal: Number(metrics.totalFaturamento ?? 0),
    avgTicket: Number(metrics.ticketMedio ?? 0),
    rating: 0,
    ratingCount: 0,
    monthlyData,
    upcoming: [],
    enabledServices: Array.isArray(raw.enabledServices) ? raw.enabledServices as string[] : [],
    totalAgendados:   Number(metrics.totalAgendados ?? 0),
    totalFinalizados: Number(metrics.totalFinalizados ?? 0),
    totalPendentes:   Number(metrics.totalPendentes ?? 0),
    totalCancelados:  Number(metrics.totalCancelados ?? 0),
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

  const fetchData = useCallback(async (): Promise<Profissional[] | undefined> => {
    if (!FEATURES.realProfissionais) return undefined
    setLoading(true)
    setError(null)
    try {
      const res = await profissionaisApi.list()
      const parsed = parseList(res)
      setData(parsed)
      return parsed
    } catch {
      setError('Erro ao carregar profissionais')
      return undefined
    } finally {
      setLoading(false)
    }
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

  const toggleStatus = useCallback(async (id: string, active: boolean) => {
    if (!FEATURES.realProfissionais) return
    setData(prev => prev.map(p =>
      p.id === id ? { ...p, status: active ? 'active' : 'inactive' } : p
    ))
    try {
      await profissionaisApi.update(id, { active })
    } catch {
      setData(prev => prev.map(p =>
        p.id === id ? { ...p, status: active ? 'inactive' : 'active' } : p
      ))
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    if (!FEATURES.realProfissionais) return
    setData(prev => prev.filter(p => p.id !== id))
    try {
      await profissionaisApi.delete(id)
    } catch (err: unknown) {
      await fetchData()
      throw err
    }
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, create, update, toggleStatus, remove }
}
