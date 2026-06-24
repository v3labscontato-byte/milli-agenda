'use client'

import { useEffect, useState } from 'react'
import { X, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServicoCategory, ServicoStatus } from '@/lib/servicos-mock'
import { MOCK_SERVICOS } from '@/lib/servicos-mock'

const CATEGORIES: ServicoCategory[] = ['Cabelo', 'Barba', 'Unhas', 'Estética', 'Sobrancelha']

const ALL_PROFESSIONALS = Array.from(
  new Set(MOCK_SERVICOS.flatMap((s) => s.professionals))
).sort((a, b) => a.localeCompare(b, 'pt-BR'))

const LABEL = 'text-[12px] font-medium text-[#475569]'
const INPUT = cn(
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
  'placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
)

interface FormState {
  nome: string
  category: ServicoCategory | ''
  duration: string
  price: string
  description: string
  professionals: string[]
  status: ServicoStatus
}

const EMPTY: FormState = {
  nome: '', category: '', duration: '60', price: '', description: '',
  professionals: [], status: 'active',
}

interface NovoServicoModalProps {
  open: boolean
  onClose: () => void
}

export default function NovoServicoModal({ open, onClose }: NovoServicoModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => { if (open) setForm(EMPTY) }, [open])

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

  function toggleProfissional(name: string) {
    setForm((f) => ({
      ...f,
      professionals: f.professionals.includes(name)
        ? f.professionals.filter((p) => p !== name)
        : [...f.professionals, name],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('novo serviço', form)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo serviço"
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
              <Scissors size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Novo Serviço</h2>
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
          <form id="novo-serv-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5">

            {/* Nome + Categoria */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="ns-nome" className={LABEL}>Nome do serviço *</label>
                <input
                  id="ns-nome" type="text" required
                  value={form.nome} onChange={setField('nome')}
                  placeholder="Ex.: Corte + Escova"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-category" className={LABEL}>Categoria *</label>
                <select id="ns-category" required value={form.category} onChange={setField('category')} className={INPUT}>
                  <option value="">Selecionar…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Duração + Preço + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="ns-duration" className={LABEL}>Duração (min) *</label>
                <input
                  id="ns-duration" type="number" required min="5" step="5"
                  value={form.duration} onChange={setField('duration')}
                  placeholder="60"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-price" className={LABEL}>Preço (R$) *</label>
                <input
                  id="ns-price" type="number" required min="0" step="0.01"
                  value={form.price} onChange={setField('price')}
                  placeholder="0,00"
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ns-status" className={LABEL}>Status</label>
                <select id="ns-status" value={form.status} onChange={setField('status')} className={INPUT}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label htmlFor="ns-desc" className={LABEL}>Descrição</label>
              <textarea
                id="ns-desc" rows={3}
                value={form.description} onChange={setField('description')}
                placeholder="Descreva o serviço, técnicas utilizadas, resultados esperados…"
                className={cn(INPUT, 'resize-none')}
              />
            </div>

            {/* Profissionais */}
            <div className="space-y-2">
              <p className={LABEL}>Profissionais habilitados</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar profissionais">
                {ALL_PROFESSIONALS.map((name) => {
                  const active = form.professionals.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleProfissional(name)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        active
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]',
                      )}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
              {form.professionals.length > 0 && (
                <p className="text-[11px] text-[#94A3B8]">
                  {form.professionals.length} selecionado{form.professionals.length !== 1 ? 's' : ''}
                </p>
              )}
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
            form="novo-serv-form"
            className="flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1"
          >
            <Scissors size={13} aria-hidden="true" />
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  )
}
