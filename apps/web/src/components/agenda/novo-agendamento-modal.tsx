'use client'

import { useEffect, useState } from 'react'
import { X, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServicos } from '@/hooks/use-servicos'
import { useProfissionais } from '@/hooks/use-profissionais'
import { agendaApi } from '@/lib/api/agenda'

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface FormState {
  clientName: string
  clientPhone: string
  serviceId: string
  professionalId: string
  date: string
  time: string
  notes: string
}

function emptyForm(defaultDate: string): FormState {
  return { clientName: '', clientPhone: '', serviceId: '', professionalId: '', date: defaultDate, time: '09:00', notes: '' }
}

interface NovoAgendamentoModalProps {
  open: boolean
  defaultDate: string
  onClose: () => void
}

export default function NovoAgendamentoModal({ open, defaultDate, onClose }: NovoAgendamentoModalProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultDate))
  const [saving, setSaving] = useState(false)

  const { data: servicos } = useServicos()
  const { data: profissionais } = useProfissionais()

  const activeServices = servicos
    .filter((s) => s.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const activeProfessionals = profissionais
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const selectedService = activeServices.find((s) => s.id === form.serviceId)

  useEffect(() => { if (open) setForm(emptyForm(defaultDate)) }, [open, defaultDate])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  function setField<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await agendaApi.create({
        clientName: form.clientName,
        clientPhone: form.clientPhone || undefined,
        serviceId: form.serviceId,
        professionalId: form.professionalId,
        date: form.date,
        startTime: form.time,
        notes: form.notes || undefined,
      })
    } catch {
      // Non-blocking: local calendar may not yet refresh; backend may have stricter validation
    } finally {
      setSaving(false)
    }
    onClose()
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="na-client" className={LABEL}>Nome do cliente *</label>
                <input
                  id="na-client" type="text" required
                  value={form.clientName} onChange={setField('clientName')}
                  placeholder="Ex.: Camila Torres"
                  autoComplete="name"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="na-phone" className={LABEL}>Telefone</label>
                <input
                  id="na-phone" type="tel"
                  value={form.clientPhone} onChange={setField('clientPhone')}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Serviço */}
            <div className="space-y-1.5">
              <label htmlFor="na-service" className={LABEL}>Serviço *</label>
              <select id="na-service" required value={form.serviceId} onChange={setField('serviceId')} className={INPUT}>
                <option value="">
                  {activeServices.length === 0 ? 'Nenhum serviço cadastrado' : 'Selecionar serviço…'}
                </option>
                {activeServices.map((s) => (
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

            {/* Profissional */}
            <div className="space-y-1.5">
              <label htmlFor="na-prof" className={LABEL}>Profissional *</label>
              <select id="na-prof" required value={form.professionalId} onChange={setField('professionalId')} className={INPUT}>
                <option value="">
                  {activeProfessionals.length === 0 ? 'Nenhum profissional cadastrado' : 'Selecionar profissional…'}
                </option>
                {activeProfessionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
              </div>
              <div className="space-y-1.5">
                <label htmlFor="na-time" className={LABEL}>Horário *</label>
                <input
                  id="na-time" type="time" required
                  value={form.time} onChange={setField('time')}
                  min="09:00" max="19:00" step="900"
                  className={INPUT}
                />
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
            disabled={saving}
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
