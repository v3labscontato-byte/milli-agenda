'use client'

import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#059669',
  '#D97706', '#DC2626', '#0891B2', '#475569',
]

type Step = 1 | 2

interface SmartFormCategoriaProps {
  open: boolean
  onClose: () => void
  onCreated: (name: string, color: string) => Promise<void>
}

export default function SmartFormCategoria({ open, onClose, onCreated }: SmartFormCategoriaProps) {
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setStep(1); setName(''); setColor(COLORS[0]); setSaving(false); setError('') }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  async function handleSave() {
    if (!name.trim()) { setError('Nome obrigatório'); return }
    setSaving(true); setError('')
    try {
      await onCreated(name.trim(), color)
      onClose()
    } catch {
      setError('Erro ao criar categoria. Tente novamente.')
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Nova categoria">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-sm flex-col rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Etapa {step} de 2</p>
            <div className="mt-1 flex gap-1.5">
              {[1, 2].map((s) => (
                <span key={s} className={cn('h-1.5 rounded-full transition-all duration-150', s === step ? 'w-5 bg-[#2563EB]' : s < step ? 'w-1.5 bg-[#2563EB]/40' : 'w-1.5 bg-[#E2E8F0]')} />
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Nova categoria</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Organize seus serviços por categoria</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                  placeholder="Ex: Cabelo, Unhas, Estética"
                  autoFocus
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#475569]">Cor de identificação</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-9 w-full rounded-lg transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        color === c ? 'ring-2 ring-white shadow-lg' : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 3px ${c}` : undefined }}
                      aria-label={`Cor ${c}`}
                      aria-pressed={color === c}
                    >
                      {color === c && <Check size={14} className="mx-auto text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Confirmar</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Revise antes de criar</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white" style={{ backgroundColor: color }}>
                  {name[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">{name}</p>
                  <p className="text-[12px] text-[#94A3B8]">0 serviços</p>
                </div>
              </div>
              {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#F1F5F9] px-5 py-4">
          <button type="button" onClick={() => step > 1 ? setStep(1) : onClose()}
            className="rounded text-[13px] text-[#64748B] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          {step === 1 ? (
            <button type="button" onClick={() => setStep(2)} disabled={!name.trim()}
              className="rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Próximo →
            </button>
          ) : (
            <button type="button" onClick={() => { void handleSave() }} disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              {saving ? 'Criando…' : <><Check size={13} /> Criar categoria</>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
