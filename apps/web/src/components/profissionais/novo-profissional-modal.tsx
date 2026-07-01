'use client'

import { useEffect, useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfissionalRole } from '@/lib/profissionais-mock'

const ROLES: ProfissionalRole[] = [
  'Cabeleireira', 'Cabeleireiro', 'Colorista',
  'Barbeiro', 'Manicure', 'Nail Designer', 'Esteticista',
]

const WEEK_DAYS = [
  { value: 1, label: 'Seg' }, { value: 2, label: 'Ter' }, { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' }, { value: 5, label: 'Sex' }, { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

const LABEL = 'text-sm font-medium text-[#64748B]'
const INPUT = cn(
  'w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px] text-[#0F172A]',
  'placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface FormState {
  nome: string
  role: ProfissionalRole | ''
  email: string
  phone: string
  cpf: string
  birthDate: string
  hireDate: string
  workDays: number[]
  workStart: string
  workEnd: string
  commissionPct: string
  bio: string
}

const EMPTY: FormState = {
  nome: '', role: '', email: '', phone: '', cpf: '',
  birthDate: '', hireDate: '', workDays: [1,2,3,4,5],
  workStart: '09:00', workEnd: '18:00', commissionPct: '50', bio: '',
}

interface NovoProfissionalModalProps {
  open: boolean
  onClose: () => void
  onCreate?: (payload: unknown) => Promise<void>
}

export default function NovoProfissionalModal({ open, onClose, onCreate }: NovoProfissionalModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => { if (open) { setForm(EMPTY); setSaving(false); setSubmitError(null) } }, [open])

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

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(day)
        ? f.workDays.filter((d) => d !== day)
        : [...f.workDays, day],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!onCreate) { onClose(); return }
    setSaving(true)
    setSubmitError(null)
    const payload = {
      name: form.nome,
      role: form.role,
      email: form.email,
      phone: form.phone,
      cpf: form.cpf,
      birthDate: form.birthDate || null,
      hireDate: form.hireDate || null,
      workDays: form.workDays,
      workStart: form.workStart,
      workEnd: form.workEnd,
      commissionPct: Number(form.commissionPct) || 0,
      bio: form.bio,
    }
    try {
      await onCreate(payload)
      onClose()
    } catch {
      setSubmitError('Erro ao cadastrar profissional. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo profissional"
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
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <UserPlus size={16} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Profissional</h2>
              <p className="text-[12px] text-[#64748B]">Preencha os dados do novo profissional</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="novo-prof-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
            {/* Nome + Cargo */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="np-nome" className={LABEL}>Nome completo *</label>
                <input id="np-nome" type="text" required value={form.nome}
                  onChange={setField('nome')} placeholder="Ex.: Lena Santos"
                  autoComplete="name" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-role" className={LABEL}>Cargo *</label>
                <select id="np-role" required value={form.role}
                  onChange={setField('role')} className={INPUT}>
                  <option value="">Selecionar…</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="np-email" className={LABEL}>E-mail</label>
                <input id="np-email" type="email" value={form.email}
                  onChange={setField('email')} placeholder="email@millisalon.com.br"
                  autoComplete="email" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-phone" className={LABEL}>Telefone</label>
                <input id="np-phone" type="tel" value={form.phone}
                  onChange={setField('phone')} placeholder="(11) 99999-9999"
                  autoComplete="tel" className={INPUT} />
              </div>
            </div>

            {/* CPF + datas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="np-cpf" className={LABEL}>CPF</label>
                <input id="np-cpf" type="text" value={form.cpf}
                  onChange={setField('cpf')} placeholder="000.000.000-00" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-birth" className={LABEL}>Nascimento</label>
                <input id="np-birth" type="date" value={form.birthDate}
                  onChange={setField('birthDate')} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-hire" className={LABEL}>Contratação</label>
                <input id="np-hire" type="date" value={form.hireDate}
                  onChange={setField('hireDate')} className={INPUT} />
              </div>
            </div>

            {/* Dias de trabalho */}
            <div className="space-y-1.5">
              <p className={LABEL}>Dias de trabalho</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar dias">
                {WEEK_DAYS.map((day) => {
                  const active = form.workDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={active}
                      className={cn(
                        'h-8 w-10 rounded-lg border text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        active
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]',
                      )}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Horário + comissão */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="np-start" className={LABEL}>Início</label>
                <input id="np-start" type="time" value={form.workStart}
                  onChange={setField('workStart')} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-end" className={LABEL}>Fim</label>
                <input id="np-end" type="time" value={form.workEnd}
                  onChange={setField('workEnd')} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="np-commission" className={LABEL}>Comissão (%)</label>
                <input id="np-commission" type="number" min="0" max="100" step="1"
                  value={form.commissionPct} onChange={setField('commissionPct')}
                  placeholder="50" className={INPUT} />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label htmlFor="np-bio" className={LABEL}>Bio / Observações</label>
              <textarea id="np-bio" rows={3} value={form.bio}
                onChange={setField('bio')}
                placeholder="Especialidades, formação, informações relevantes…"
                className={cn(INPUT, 'resize-none')} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col gap-2 border-t border-[#E2E8F0] px-5 py-4">
          {submitError && (
            <p className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#DC2626]">{submitError}</p>
          )}
          <div className="flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={saving}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" form="novo-prof-form" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1 disabled:opacity-60">
              <UserPlus size={13} aria-hidden="true" />
              {saving ? 'Cadastrando…' : 'Cadastrar profissional'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
