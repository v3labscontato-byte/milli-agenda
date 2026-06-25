'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api/client'
import type { ServicoInput } from '@/hooks/use-servicos'

interface Category { id: string; name: string; color: string }
interface Professional { id: string; name: string; specialty?: string }

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Básico', 2: 'Valores', 3: 'Profissionais', 4: 'Visibilidade',
}

const HOURS = Array.from({ length: 9 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

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

interface SmartFormServicoProps {
  open: boolean
  onClose: () => void
  onCreated: (input: ServicoInput) => Promise<void>
}

export default function SmartFormServico({ open, onClose, onCreated }: SmartFormServicoProps) {
  const [step, setStep] = useState<Step>(1)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(0)
  const [price, setPrice] = useState('')

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfs, setSelectedProfs] = useState<Set<string>>(new Set())

  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setStep(1)
      setName(''); setCategoryId(''); setHours(1); setMinutes(0)
      setPrice(''); setSelectedProfs(new Set()); setActive(true)
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
    api.get<Category[]>('/api/v1/services/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [open])

  useEffect(() => {
    if (step !== 3) return
    api.get<Professional[]>('/api/v1/professionals')
      .then(setProfessionals)
      .catch(() => setProfessionals([]))
  }, [step])

  const durationMin = hours * 60 + minutes
  const priceNum = parseFloat(price.replace(',', '.')) || 0

  async function handleSave() {
    if (!name.trim()) { setError('Nome obrigatório'); return }
    if (priceNum <= 0) { setError('Informe um preço válido'); return }
    setSaving(true); setError('')
    try {
      await onCreated({
        name: name.trim(),
        durationMin: durationMin || 30,
        price: priceNum,
        active,
      })
      onClose()
    } catch {
      setError('Erro ao criar serviço. Tente novamente.')
      setSaving(false)
    }
  }

  function canAdvance() {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return priceNum > 0
    return true
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Novo serviço">
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

          {/* STEP 1 — Informações básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Novo serviço — Informações básicas</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Como se chama o serviço e a qual categoria pertence?</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Nome do serviço *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte Feminino"
                  autoFocus
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && (
                  <p className="text-[12px] text-[#94A3B8]">
                    Nenhuma categoria cadastrada. Configure em{' '}
                    <span className="text-[#2563EB]">Configurações → Categorias</span>.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Duração e Preço */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Duração e valor</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Quanto tempo dura e qual o valor cobrado?</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Duração</label>
                <div className="flex items-center gap-2">
                  <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}h</option>)}
                  </select>
                  <select
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Preço *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#64748B]">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                </div>
              </div>
              {durationMin > 0 && priceNum > 0 && (
                <div className="rounded-lg bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#475569]">
                  Este serviço terá duração de{' '}
                  <strong className="text-[#0F172A]">
                    {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : hours === 0 ? '0min' : ''}
                  </strong>{' '}
                  e custará{' '}
                  <strong className="text-[#0F172A]">
                    R$ {priceNum.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Profissionais */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Quem pode realizar este serviço?</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Selecione os profissionais habilitados (opcional)</p>
              </div>
              {professionals.length === 0 ? (
                <p className="text-[13px] text-[#94A3B8]">Nenhum profissional cadastrado ainda. Você pode pular e adicionar depois.</p>
              ) : (
                <div className="space-y-2">
                  {professionals.map((p) => {
                    const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                    const checked = selectedProfs.has(p.id)
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E2E8F0] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedProfs((prev) => {
                              const n = new Set(prev)
                              if (n.has(p.id)) n.delete(p.id); else n.add(p.id)
                              return n
                            })
                          }}
                          className="accent-[#2563EB]"
                        />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-bold text-[#2563EB]">{initials}</span>
                        <div>
                          <p className="text-[13px] font-medium text-[#0F172A]">{p.name}</p>
                          {p.specialty && <p className="text-[11px] text-[#94A3B8]">{p.specialty}</p>}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Visibilidade */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Como este serviço será exibido?</p>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
                <span className="text-[13px] font-medium text-[#0F172A]">Ativo</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => setActive((v) => !v)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors duration-150',
                    active ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150',
                    active ? 'translate-x-4' : 'translate-x-0.5',
                  )} />
                </button>
              </label>
              <div className="rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Resumo</p>
                <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{name || '—'}</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">
                  {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : ''} · R$ {priceNum.toFixed(2).replace('.', ',')}
                </p>
                {selectedProfs.size > 0 && (
                  <p className="mt-0.5 text-[12px] text-[#94A3B8]">{selectedProfs.size} profissional(is) habilitado(s)</p>
                )}
                <p className="mt-0.5 text-[12px] text-[#94A3B8]">Status: {active ? 'Ativo' : 'Inativo'}</p>
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
              {saving ? 'Criando…' : 'Criar serviço'}
              {!saving && <Check size={14} aria-hidden="true" />}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
