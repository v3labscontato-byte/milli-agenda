'use client'

import { useEffect, useState } from 'react'
import { X, UserPlus, User, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const LABEL = 'text-sm font-medium text-[#64748B]'
const INPUT = cn(
  'w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px] text-[#0F172A]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#2563EB]',
  'placeholder:text-[#94A3B8]',
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
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <UserPlus size={16} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Cliente</h2>
              <p className="text-[12px] text-[#64748B]">Preencha os dados do novo cliente</p>
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

        {/* Body — scrollável */}
        <form id="novo-cliente-form" onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Dados Pessoais */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#DBEAFE]">
                <User size={12} className="text-[#2563EB]" aria-hidden="true" />
              </div>
              <p className="text-[13px] font-semibold text-[#0F172A]">Dados Pessoais</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>
          </div>

          {/* Preferências */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FCE7F3]">
                <Heart size={12} className="text-[#DB2777]" aria-hidden="true" />
              </div>
              <p className="text-[13px] font-semibold text-[#0F172A]">Preferências</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
          </div>

          {error && (
            <p className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#DC2626]" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Footer fixo */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E2E8F0] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={cn(
              'rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-[13px] font-medium text-[#475569]',
              'transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              'disabled:opacity-50',
            )}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="novo-cliente-form"
            disabled={saving}
            className={cn(
              'flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white',
              'transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
              'disabled:opacity-60',
            )}
          >
            <UserPlus size={14} aria-hidden="true" />
            {saving ? 'Cadastrando…' : 'Cadastrar cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}
