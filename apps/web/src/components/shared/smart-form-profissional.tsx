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
            i + 1 === step ? 'w-6 bg-[var(--color-brand)]' : i + 1 < step ? 'w-2 bg-[var(--color-brand)]/40' : 'w-2 bg-[var(--color-border-primary)]',
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
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        specialty: specialty.trim() || undefined,
        commissionPct: Number(commissionPct),
        workDays,
        workStart: startTime,
        workEnd: endTime,
        active: true,
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
      <div className="absolute inset-0 bg-[var(--color-text-primary)]/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-surface-tertiary)] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Etapa {step} de 4 — {STEP_LABELS[step]}
            </p>
            <ProgressDots step={step} total={4} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
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
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Novo profissional — Dados pessoais</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Informações básicas do profissional</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-name" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Nome completo *</label>
                <input
                  id="sf-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  autoFocus
                  className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-phone" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Telefone / WhatsApp</label>
                <input
                  id="sf-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-email" className="text-[12px] font-medium text-[var(--color-text-secondary)]">E-mail</label>
                <input
                  id="sf-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Cargo e escala */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Cargo e horário de trabalho</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Defina o cargo e os dias de atendimento</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-cargo" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Cargo *</label>
                {roles.length > 0 ? (
                  <select
                    id="sf-cargo"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  >
                    <option value="">Selecionar cargo…</option>
                    {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                ) : (
                  <input
                    id="sf-cargo"
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Cabeleireiro, Barbeiro..."
                    className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Dias de trabalho</label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar dias">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      aria-pressed={workDays.includes(idx)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]',
                        workDays.includes(idx)
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                          : 'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)]',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Horário de atendimento</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">Das</span>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border border-[var(--color-border-primary)] rounded-md px-3 py-2 text-[13px] bg-white appearance-none pr-8 cursor-pointer min-w-[100px] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                      }}
                    >
                      {WORK_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <span className="text-[13px] text-[var(--color-text-tertiary)] mt-4">às</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">Até</span>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border border-[var(--color-border-primary)] rounded-md px-3 py-2 text-[13px] bg-white appearance-none pr-8 cursor-pointer min-w-[100px] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                      }}
                    >
                      {WORK_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Serviços */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Quais serviços este profissional realiza?</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Selecione os serviços habilitados (opcional)</p>
              </div>
              {services.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-tertiary)]">Nenhum serviço cadastrado ainda. Você pode pular e configurar depois.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedServices(new Set(services.map((s) => s.id)))}
                      className="text-[12px] text-[var(--color-brand)] hover:underline focus-visible:outline-none"
                    >
                      Selecionar todos
                    </button>
                    <span className="text-[var(--color-border-primary)]">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedServices(new Set())}
                      className="text-[12px] text-[var(--color-text-secondary)] hover:underline focus-visible:outline-none"
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
                        <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border-primary)] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]">
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
                            className="accent-[var(--color-brand)]"
                          />
                          <div className="flex-1">
                            <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{s.name}</p>
                            <p className="text-[11px] text-[var(--color-text-tertiary)]">{dur} · R$ {Number(s.price).toFixed(2).replace('.', ',')}</p>
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
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Comissionamento</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Como este profissional será remunerado?</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-commission" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Percentual de comissão</label>
                <div className="flex items-center gap-2">
                  <input
                    id="sf-commission"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(e.target.value)}
                    className="w-20 rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  />
                  <span className="text-[13px] text-[var(--color-text-secondary)]">%</span>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Resumo</p>
                <p className="mt-2 text-[14px] font-semibold text-[var(--color-text-primary)]">{name}</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">{specialty}</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
                  {workDays.map((d) => DAY_LABELS[d]).join(', ')} · {startTime}–{endTime}
                </p>
                {selectedServices.size > 0 && (
                  <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{selectedServices.size} serviço(s) habilitado(s)</p>
                )}
                {commissionPct && <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">Comissão: {commissionPct}%</p>}
              </div>
              {error && <p className="text-[12px] text-[var(--color-danger)]">{error}</p>}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-surface-tertiary)] px-5 py-4">
          <button
            type="button"
            onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : onClose()}
            className="rounded text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
          >
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
            >
              Próximo <ChevronRight size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-light)]"
            >
              {saving ? 'Cadastrando…' : <><span>Cadastrar profissional</span> <Check size={14} aria-hidden="true" /></>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
