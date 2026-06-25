'use client'

import { useEffect, useState } from 'react'
import { X, ReceiptText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServicos } from '@/hooks/use-servicos'
import { useProfissionais } from '@/hooks/use-profissionais'

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
  startTime: string
}

const EMPTY: FormState = {
  clientName: '', clientPhone: '', serviceId: '', professionalId: '', startTime: '',
}

export interface NovaComandaData {
  clientName: string
  clientPhone: string
  service: string
  serviceId: string
  serviceDuration: number
  serviceValue: number
  professional: string
  professionalId: string
  startTime: string
}

interface NovaComandaModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: NovaComandaData) => void
  prefill?: Partial<NovaComandaData>
}

export default function NovaComandaModal({ open, onClose, onCreate, prefill }: NovaComandaModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data: servicos } = useServicos()
  const { data: profissionais } = useProfissionais()

  const activeServices = servicos
    .filter((s) => s.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const activeProfessionals = profissionais
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const selectedService = activeServices.find((s) => s.id === form.serviceId)
  const selectedProfessional = activeProfessionals.find((p) => p.id === form.professionalId)

  useEffect(() => {
    if (!open) return
    if (prefill?.serviceId && prefill?.professionalId) {
      setForm({
        clientName: prefill.clientName || '',
        clientPhone: prefill.clientPhone || '',
        serviceId: prefill.serviceId,
        professionalId: prefill.professionalId,
        startTime: prefill.startTime || '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, prefill])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  function setField<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService) return
    onCreate({
      clientName:      form.clientName,
      clientPhone:     form.clientPhone,
      service:         selectedService.name,
      serviceId:       form.serviceId,
      serviceDuration: selectedService.duration,
      serviceValue:    selectedService.price,
      professional:    selectedProfessional?.name ?? '',
      professionalId:  form.professionalId,
      startTime:       form.startTime || '09:00',
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nova comanda"
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <ReceiptText size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Nova Comanda</h2>
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
          <form id="nova-comanda-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
            {/* Cliente */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="nc-client" className={LABEL}>Nome do cliente *</label>
                <input
                  id="nc-client" type="text" required
                  value={form.clientName} onChange={setField('clientName')}
                  placeholder="Ex.: Carla Dias"
                  autoComplete="name"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="nc-phone" className={LABEL}>Telefone</label>
                <input
                  id="nc-phone" type="tel"
                  value={form.clientPhone} onChange={setField('clientPhone')}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Serviço */}
            <div className="space-y-1.5">
              <label htmlFor="nc-service" className={LABEL}>Serviço *</label>
              <select id="nc-service" required value={form.serviceId} onChange={setField('serviceId')} className={INPUT}>
                <option value="">
                  {activeServices.length === 0 ? 'Nenhum serviço cadastrado' : 'Selecionar serviço…'}
                </option>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.duration}min · R$ {s.price.toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            </div>

            {/* Profissional + horário */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="nc-prof" className={LABEL}>Profissional *</label>
                <select id="nc-prof" required value={form.professionalId} onChange={setField('professionalId')} className={INPUT}>
                  <option value="">
                    {activeProfessionals.length === 0 ? 'Nenhum profissional cadastrado' : 'Selecionar…'}
                  </option>
                  {activeProfessionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="nc-time" className={LABEL}>Horário de início</label>
                <input
                  id="nc-time" type="time"
                  value={form.startTime} onChange={setField('startTime')}
                  min="08:00" max="20:00"
                  className={INPUT}
                />
              </div>
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
            form="nova-comanda-form"
            className="flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
          >
            <ReceiptText size={13} aria-hidden="true" />
            Abrir Comanda
          </button>
        </div>
      </div>
    </div>
  )
}
