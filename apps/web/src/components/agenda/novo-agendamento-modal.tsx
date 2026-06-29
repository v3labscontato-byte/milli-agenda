'use client'

import { useEffect, useRef, useState } from 'react'
import { X, CalendarPlus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServicos } from '@/hooks/use-servicos'
import { useProfissionais } from '@/hooks/use-profissionais'
import { agendaApi } from '@/lib/api/agenda'

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface ClientResult {
  id: string
  name: string
  phone?: string | null
  clientNumber?: number | null
}

interface FormState {
  clientId?: string
  clientName: string
  clientPhone: string
  professionalId: string
  serviceId: string
  date: string
  time: string
  notes: string
}

interface ApptSlot { professionalId: string; startTime: string; durationMinutes: number }
interface ProfSched { id: string; workDays: number[]; workStart: string; workEnd: string }

function getSlotsDia(prof: ProfSched, date: string, appts: ApptSlot[], durMin: number): string[] {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay()
  if (prof.workDays.length > 0 && !prof.workDays.includes(dayOfWeek)) return []

  const [startH = 8, startM = 0] = prof.workStart.split(':').map(Number)
  const [endH = 18, endM = 0]    = prof.workEnd.split(':').map(Number)
  const startMin = startH * 60 + startM
  const endMin   = endH   * 60 + endM

  const slots: string[] = []
  for (let min = startMin; min + durMin <= endMin; min += 30) {
    const h = Math.floor(min / 60).toString().padStart(2, '0')
    const m = (min % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
  }

  const ocupados = appts
    .filter((a) => a.professionalId === prof.id)
    .map((a) => ({ start: a.startTime, durMin: a.durationMinutes }))

  return slots.filter((slot) => {
    const [sh, sm] = slot.split(':').map(Number)
    const slotMin = sh * 60 + sm
    return !ocupados.some((o) => {
      if (!o.start) return false
      const [oh, om] = o.start.split(':').map(Number)
      const oMin = oh * 60 + om
      return slotMin < oMin + o.durMin && slotMin + durMin > oMin
    })
  })
}

function emptyForm(defaultDate: string, initialTime?: string, initialProfessionalId?: string): FormState {
  return {
    clientName: '',
    clientPhone: '',
    professionalId: initialProfessionalId ?? '',
    serviceId: '',
    date: defaultDate,
    time: initialTime ?? '',
    notes: '',
  }
}

interface NovoAgendamentoModalProps {
  open: boolean
  defaultDate: string
  onClose: () => void
  onCreated?: () => void
  initialProfessionalId?: string
  initialTime?: string
}

export default function NovoAgendamentoModal({
  open,
  defaultDate,
  onClose,
  onCreated,
  initialProfessionalId,
  initialTime,
}: NovoAgendamentoModalProps) {
  const [form, setForm]           = useState<FormState>(() => emptyForm(defaultDate, initialTime, initialProfessionalId))
  const [saving, setSaving]       = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const [horariosDisponiveis, setHorarios]  = useState<string[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)

  // Client search
  const [clientSearch, setClientSearch]     = useState('')
  const [clientResults, setClientResults]   = useState<ClientResult[]>([])
  const [clientLoading, setClientLoading]   = useState(false)
  const [showDropdown, setShowDropdown]     = useState(false)
  const [clientSelected, setClientSelected] = useState<ClientResult | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: servicos }      = useServicos()
  const { data: profissionais } = useProfissionais()

  const activeServices = servicos
    .filter((s) => s.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const activeProfessionals = profissionais
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const profSelecionado = profissionais.find((p) => p.id === form.professionalId)

  const enabledServices = profSelecionado?.enabledServices ?? []
  const servicosFiltrados = enabledServices.length
    ? activeServices.filter((s) => enabledServices.includes(s.id))
    : activeServices

  const selectedService = servicosFiltrados.find((s) => s.id === form.serviceId)

  const dayOfWeek = form.date ? new Date(form.date + 'T12:00:00').getDay() : -1
  const profFolga = !!(profSelecionado && profSelecionado.workDays.length > 0 && !profSelecionado.workDays.includes(dayOfWeek))

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultDate, initialTime, initialProfessionalId))
      setSubmitError(null)
      setHorarios([])
      setClientSearch('')
      setClientResults([])
      setClientSelected(null)
      setShowDropdown(false)
    }
  }, [open, defaultDate, initialTime, initialProfessionalId])

  // Debounced client search
  useEffect(() => {
    if (clientSearch.trim().length < 2) {
      setClientResults([])
      setShowDropdown(false)
      return
    }
    const t = setTimeout(async () => {
      setClientLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        const tenantSlug = localStorage.getItem('tenantSlug') ?? ''
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients/search?q=${encodeURIComponent(clientSearch)}`,
          { headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Tenant-Slug': tenantSlug } },
        )
        const json = (await res.json()) as { data?: ClientResult[] }
        setClientResults(Array.isArray(json.data) ? json.data : [])
        setShowDropdown(true)
      } catch {
        setClientResults([])
      } finally {
        setClientLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [clientSearch])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!form.professionalId || !form.date) { setHorarios([]); return }

    const prof = profissionais.find((p) => p.id === form.professionalId)
    if (!prof) { setHorarios([]); return }

    const servico = servicos.find((s) => s.id === form.serviceId)
    const durMin = servico?.duration ?? 60

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    setLoadingHorarios(true)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments?professionalId=${form.professionalId}&from=${form.date}&to=${form.date}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
      .then((r) => r.json())
      .then((r) => {
        const agendsDia: ApptSlot[] = (r.data ?? [])
          .filter((a: { professionalId: string; startAt?: string; durationMin?: number; status?: string }) => a.status !== 'CANCELLED')
          .map((a: { professionalId: string; startAt?: string; durationMin?: number }) => ({
            professionalId: a.professionalId,
            startTime: a.startAt?.slice(11, 16) ?? '',
            durationMinutes: a.durationMin ?? 60,
          }))
        const slots = getSlotsDia(prof, form.date, agendsDia, durMin)
        setHorarios(slots)
        setForm((f) => ({
          ...f,
          time: slots.includes(f.time) ? f.time : (slots[0] ?? ''),
        }))
      })
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHorarios(false))
  }, [form.professionalId, form.date, form.serviceId, profissionais, servicos])

  if (!open) return null

  function setField<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function selectClient(c: ClientResult) {
    setClientSelected(c)
    setClientSearch('')
    setShowDropdown(false)
    setForm((f) => ({ ...f, clientId: c.id, clientName: c.name, clientPhone: c.phone ?? '' }))
  }

  function clearClient() {
    setClientSelected(null)
    setForm((f) => ({ ...f, clientId: undefined, clientName: '', clientPhone: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSubmitError(null)
    try {
      await agendaApi.create({
        clientId:       form.clientId,
        clientName:     form.clientName,
        clientPhone:    form.clientPhone || undefined,
        serviceId:      form.serviceId,
        professionalId: form.professionalId,
        date:           form.date,
        startTime:      form.time,
        durationMin:    selectedService?.duration,
        notes:          form.notes || undefined,
      })
      onCreated?.()
      onClose()
    } catch {
      setSubmitError('Não foi possível criar o agendamento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo agendamento"
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <CalendarPlus size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Agendamento</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="novo-agenda-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">

            {/* Cliente */}
            <div className="space-y-1.5">
              <label htmlFor="na-client" className={LABEL}>Cliente *</label>

              {clientSelected ? (
                <div className="flex items-center justify-between rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-[#0F172A]">{clientSelected.name}</p>
                    {clientSelected.phone && (
                      <p className="text-[11px] text-[#475569]">{clientSelected.phone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearClient}
                    aria-label="Trocar cliente"
                    className="ml-2 shrink-0 rounded p-0.5 text-[#64748B] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div ref={searchRef} className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Search size={13} className="text-[#94A3B8]" aria-hidden="true" />
                  </div>
                  <input
                    id="na-client"
                    type="text"
                    required
                    value={clientSearch || form.clientName}
                    onChange={(e) => {
                      const v = e.target.value
                      setClientSearch(v)
                      setForm((f) => ({ ...f, clientName: v, clientId: undefined }))
                    }}
                    onFocus={() => clientResults.length > 0 && setShowDropdown(true)}
                    placeholder="Buscar ou digitar nome do cliente…"
                    autoComplete="off"
                    className={cn(INPUT, 'pl-8')}
                  />
                  {showDropdown && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-[#E2E8F0] bg-white shadow-lg">
                      {clientLoading ? (
                        <p className="px-3 py-2 text-[12px] text-[#94A3B8]">Buscando…</p>
                      ) : clientResults.length === 0 ? (
                        <p className="px-3 py-2 text-[12px] text-[#94A3B8]">Nenhum cliente encontrado — será criado novo</p>
                      ) : (
                        clientResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => selectClient(c)}
                            className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DBEAFE]"
                          >
                            <span className="text-[13px] font-medium text-[#0F172A]">{c.name}</span>
                            {c.phone && <span className="text-[11px] text-[#64748B]">{c.phone}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profissional */}
            <div className="space-y-1.5">
              <label htmlFor="na-prof" className={LABEL}>Profissional *</label>
              <select
                id="na-prof" required value={form.professionalId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, professionalId: e.target.value, serviceId: '', time: '' }))
                }
                className={INPUT}
              >
                <option value="">
                  {activeProfessionals.length === 0 ? 'Nenhum profissional cadastrado' : 'Selecionar profissional…'}
                </option>
                {activeProfessionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Serviço */}
            <div className="space-y-1.5">
              <label htmlFor="na-service" className={LABEL}>Serviço *</label>
              <select
                id="na-service" required value={form.serviceId}
                onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value, time: '' }))}
                className={INPUT}
              >
                <option value="">
                  {servicosFiltrados.length === 0 ? 'Nenhum serviço disponível' : 'Selecionar serviço…'}
                </option>
                {servicosFiltrados.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.duration}min
                  </option>
                ))}
              </select>
              {selectedService && (
                <p className="text-[11px] text-[#64748B]">
                  Duração: {selectedService.duration} min · Valor: R$ {selectedService.price.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            {/* Data + Horário */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="na-date" className={LABEL}>Data *</label>
                <input
                  id="na-date" type="date" required
                  value={form.date} onChange={setField('date')}
                  className={INPUT}
                />
                {profFolga && (
                  <p className="text-[12px] text-[#DC2626]">
                    Este profissional não trabalha neste dia.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="na-time" className={LABEL}>Horário *</label>
                <select
                  id="na-time" required
                  value={form.time}
                  onChange={setField('time')}
                  disabled={loadingHorarios || profFolga}
                  className={cn(INPUT, (loadingHorarios || profFolga) && 'cursor-not-allowed opacity-50')}
                >
                  <option value="">
                    {loadingHorarios
                      ? 'Carregando…'
                      : profFolga
                        ? 'Dia de folga'
                        : horariosDisponiveis.length === 0 && form.professionalId && form.date
                          ? 'Nenhum horário disponível'
                          : 'Selecionar horário…'}
                  </option>
                  {horariosDisponiveis.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <label htmlFor="na-notes" className={LABEL}>Observações</label>
              <textarea
                id="na-notes" rows={2}
                value={form.notes} onChange={setField('notes')}
                placeholder="Preferências, alergias, informações importantes…"
                className={cn(INPUT, 'resize-none')}
              />
            </div>
          </form>
        </div>

        {submitError && (
          <div className="shrink-0 border-t border-[#FEE2E2] bg-[#FEF2F2] px-5 py-2.5">
            <p className="text-[12px] text-[#DC2626]">{submitError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#F1F5F9] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="novo-agenda-form"
            disabled={saving || profFolga}
            className="flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1 disabled:opacity-60"
          >
            <CalendarPlus size={13} aria-hidden="true" />
            {saving ? 'Agendando…' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  )
}
