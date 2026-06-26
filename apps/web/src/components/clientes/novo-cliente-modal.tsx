'use client'

import { useEffect, useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB]',
  'placeholder:text-[#64748B]',
)

interface NovoClienteModalProps {
  open: boolean
  onClose: () => void
  onCreate?: (payload: {
    name: string
    phone: string
    email: string
    cpf: string
    birthDate: string
    favoriteProfessionalId: string
    notes: string
  }) => Promise<void>
}

interface FormState {
  nome: string
  telefone: string
  email: string
  cpf: string
  nascimento: string
  profissional: string
  observacoes: string
}

const EMPTY: FormState = {
  nome: '', telefone: '', email: '', cpf: '',
  nascimento: '', profissional: '', observacoes: '',
}

export default function NovoClienteModal({ open, onClose, onCreate }: NovoClienteModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profissionais, setProfissionais] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (open) { setForm(EMPTY); setSaving(false); setError(null) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/professionals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((r: unknown) => {
        const list = Array.isArray((r as { data?: unknown }).data)
          ? (r as { data: { id: string; name: string }[] }).data
          : []
        setProfissionais(list.map((p) => ({ id: p.id, name: p.name })))
      })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setError(null)
    if (!onCreate) { onClose(); return }
    setSaving(true)
    try {
      await onCreate({
        name: form.nome.trim(),
        phone: form.telefone.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        birthDate: form.nascimento,
        favoriteProfessionalId: form.profissional,
        notes: form.observacoes.trim(),
      })
      onClose()
    } catch {
      setError('Não foi possível cadastrar o cliente. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo cliente"
    >
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <UserPlus size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Cliente</h2>
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
        <form onSubmit={handleSubmit} className="px-5 py-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {/* Nome — full width */}
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="nc-nome" className={LABEL}>Nome completo *</label>
              <input
                id="nc-nome"
                type="text"
                value={form.nome}
                onChange={set('nome')}
                required
                placeholder="Ex.: Maria Silva"
                autoComplete="name"
                className={INPUT}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label htmlFor="nc-telefone" className={LABEL}>Telefone *</label>
              <input
                id="nc-telefone"
                type="tel"
                value={form.telefone}
                onChange={set('telefone')}
                required
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                className={INPUT}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="nc-email" className={LABEL}>E-mail</label>
              <input
                id="nc-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="email@exemplo.com"
                autoComplete="email"
                className={INPUT}
              />
            </div>

            {/* CPF */}
            <div className="space-y-1.5">
              <label htmlFor="nc-cpf" className={LABEL}>CPF</label>
              <input
                id="nc-cpf"
                type="text"
                value={form.cpf}
                onChange={set('cpf')}
                placeholder="000.000.000-00"
                className={INPUT}
              />
            </div>

            {/* Nascimento */}
            <div className="space-y-1.5">
              <label htmlFor="nc-nascimento" className={LABEL}>Data de nascimento</label>
              <input
                id="nc-nascimento"
                type="date"
                value={form.nascimento}
                onChange={set('nascimento')}
                className={INPUT}
              />
            </div>

            {/* Profissional favorito — full width */}
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="nc-prof" className={LABEL}>Profissional favorito</label>
              <select
                id="nc-prof"
                value={form.profissional}
                onChange={set('profissional')}
                className={INPUT}
              >
                <option value="">Selecionar…</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Observações — full width */}
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="nc-obs" className={LABEL}>Observações</label>
              <textarea
                id="nc-obs"
                value={form.observacoes}
                onChange={set('observacoes')}
                rows={3}
                placeholder="Alergias, preferências, informações importantes…"
                className={cn(INPUT, 'resize-none')}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-md bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#DC2626]" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={cn(
                'rounded-md border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569]',
                'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                'disabled:opacity-50',
              )}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                'flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white',
                'transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                'disabled:opacity-60',
              )}
            >
              <UserPlus size={13} aria-hidden="true" />
              {saving ? 'Cadastrando…' : 'Cadastrar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
