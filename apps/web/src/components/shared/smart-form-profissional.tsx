'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api/client'

interface Role { id: string; name: string }
interface Service { id: string; name: string; durationMin: number; price: number }

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Dados pessoais', 2: 'Cargo e escala', 3: 'Serviços', 4: 'Comissão',
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const WORK_TIMES = Array.from({ length: 31 }, (_, i) => {
  const total = 6 * 60 + i * 30
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-150',
            i + 1 === step ? 'w-6 bg-[#2563EB]' : i + 1 < step ? 'w-2 bg-[#2563EB]/40' : 'w-2 bg-[#E2E8F0]',
          )}
        />
      ))}
    </div>
  )
}

interface SmartFormProfissionalProps {
  open: boolean
  onClose: () => void
  onCreated: (input: unknown) => Promise<void>
}

export default function SmartFormProfissional({ open, onClose, onCreated }: SmartFormProfissionalProps) {
  const [step, setStep] = useState<Step>(1)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [roles, setRoles] = useState<Role[]>([])
  const [specialty, setSpecialty] = useState('')
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')

  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())

  const [commissionPct, setCommissionPct] = useState('20')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setStep(1); setName(''); setPhone(''); setEmail('')
      setSpecialty(''); setWorkDays([1, 2, 3, 4, 5, 6])
      setStartTime('08:00'); setEndTime('18:00')
      setSelectedServices(new Set()); setCommissionPct('20')
      setSaving(false); setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    api.get<Role[]>('/api/v1/professionals/roles')
      .then(setRoles).catch(() => setRoles([]))
  }, [open])

  useEffect(() => {
    if (step !== 3) return
    api.get<Service[]>('/api/v1/services')
      .then(setServices).catch(() => setServices([]))
  }, [step])

  function toggleDay(day: number) {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  function canAdvance() {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return specialty.trim().length > 0 && workDays.length > 0
    return true
  }

  async function handleSave() {
    if (!name.trim() || !specialty.trim()) { setError('Nome e cargo são obrigatórios'); return }
    setSaving(true); setError('')
    try {
      await onCreated({
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
        specialty: specialty || undefined,
        commissionPct: Number(commissionPct) || undefined,
      })
      onClose()
    } catch {
      setError('Erro ao cadastrar. Tente novamente.')
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Novo profissional">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              Etapa {step} de 4 — {STEP_LABELS[step]}
            </p>
            <ProgressDots step={step} total={4} />
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* STEP 1 — Dados pessoais */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Novo profissional — Dados pessoais</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Informações básicas do profissional</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Nome completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  autoFocus
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Cargo e escala */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Cargo e horário de trabalho</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Defina o cargo e os dias de atendimento</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Cargo *</label>
                {roles.length > 0 ? (
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  >
                    <option value="">Selecionar cargo…</option>
                    {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Cabeleireiro, Barbeiro..."
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Dias de trabalho</label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar dias">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      aria-pressed={workDays.includes(idx)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        workDays.includes(idx)
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Horário de atendimento</label>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#64748B]">Das</span>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  >
                    {WORK_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-[12px] text-[#64748B]">às</span>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  >
                    {WORK_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Serviços */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Quais serviços este profissional realiza?</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Selecione os serviços habilitados (opcional)</p>
              </div>
              {services.length === 0 ? (
                <p className="text-[13px] text-[#94A3B8]">Nenhum serviço cadastrado ainda. Você pode pular e configurar depois.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedServices(new Set(services.map((s) => s.id)))}
                      className="text-[12px] text-[#2563EB] hover:underline focus-visible:outline-none"
                    >
                      Selecionar todos
                    </button>
                    <span className="text-[#E2E8F0]">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedServices(new Set())}
                      className="text-[12px] text-[#64748B] hover:underline focus-visible:outline-none"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {services.map((s) => {
                      const checked = selectedServices.has(s.id)
                      const h = Math.floor(s.durationMin / 60)
                      const m = s.durationMin % 60
                      const dur = h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`
                      return (
                        <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E2E8F0] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedServices((prev) => {
                                const n = new Set(prev)
                                if (n.has(s.id)) n.delete(s.id); else n.add(s.id)
                                return n
                              })
                            }}
                            className="accent-[#2563EB]"
                          />
                          <div className="flex-1">
                            <p className="text-[13px] font-medium text-[#0F172A]">{s.name}</p>
                            <p className="text-[11px] text-[#94A3B8]">{dur} · R$ {Number(s.price).toFixed(2).replace('.', ',')}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4 — Comissão */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Comissionamento</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Como este profissional será remunerado?</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Percentual de comissão</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(e.target.value)}
                    className="w-20 rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                  <span className="text-[13px] text-[#64748B]">%</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Resumo</p>
                <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{name}</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">{specialty}</p>
                <p className="mt-0.5 text-[12px] text-[#94A3B8]">
                  {workDays.map((d) => DAY_LABELS[d]).join(', ')} · {startTime}–{endTime}
                </p>
                {selectedServices.size > 0 && (
                  <p className="mt-0.5 text-[12px] text-[#94A3B8]">{selectedServices.size} serviço(s) habilitado(s)</p>
                )}
                {commissionPct && <p className="mt-0.5 text-[12px] text-[#94A3B8]">Comissão: {commissionPct}%</p>}
              </div>
              {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#F1F5F9] px-5 py-4">
          <button
            type="button"
            onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : onClose()}
            className="rounded text-[13px] text-[#64748B] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Próximo <ChevronRight size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              {saving ? 'Cadastrando…' : <><span>Cadastrar profissional</span> <Check size={14} aria-hidden="true" /></>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
