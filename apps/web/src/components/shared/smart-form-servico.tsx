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
const SVG_ARROW = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

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
  const [novaCategoria, setNovaCategoria] = useState(false)
  const [nomeCategoria, setNomeCategoria] = useState('')

  useEffect(() => {
    if (open) {
      setStep(1)
      setName(''); setCategoryId(''); setHours(1); setMinutes(0)
      setPrice(''); setSelectedProfs(new Set()); setActive(true)
      setSaving(false); setError(''); setNovaCategoria(false); setNomeCategoria('')
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
        categoryId: categoryId || null,
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
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]"
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
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Novo serviço — Informações básicas</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Como se chama o serviço e a qual categoria pertence?</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-name" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Nome do serviço *</label>
                <input
                  id="sf-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte Feminino"
                  autoFocus
                  className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-category" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Categoria</label>
                <select
                  id="sf-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full appearance-none rounded-md border border-[var(--color-border-primary)] px-3 py-2 pr-8 text-[13px] text-[var(--color-text-primary)] bg-no-repeat bg-[right_0.5rem_center] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  style={{ backgroundImage: SVG_ARROW }}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {!novaCategoria && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setNovaCategoria(true) }}
                    className="text-[12px] text-[var(--color-brand)] hover:underline mt-1"
                  >
                    + Nova categoria
                  </button>
                )}
                {novaCategoria && (
                  <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                    <input
                      value={nomeCategoria}
                      onChange={e => setNomeCategoria(e.target.value)}
                      placeholder="Nome da categoria"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                    />
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!nomeCategoria.trim()) return
                        const token = localStorage.getItem('accessToken')
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/services/categories`,
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ name: nomeCategoria.trim() }),
                          }
                        )
                        const data = await res.json()
                        const nova = data.data ?? data
                        if (nova?.id) {
                          setCategories(prev => [...prev, nova])
                          setCategoryId(nova.id)
                          setNovaCategoria(false)
                          setNomeCategoria('')
                        }
                      }}
                      className="px-3 py-2 bg-[var(--color-brand)] text-white text-[12px] rounded-md whitespace-nowrap"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setNovaCategoria(false); setNomeCategoria('') }}
                      className="px-3 py-2 text-[12px] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Duração e Preço */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Duração e valor</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Quanto tempo dura e qual o valor cobrado?</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Duração</label>
                <div className="flex items-center gap-2" role="group" aria-label="Duração do serviço">
                  <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    aria-label="Horas"
                    className="appearance-none rounded-md border border-[var(--color-border-primary)] px-3 py-2 pr-8 text-[13px] text-[var(--color-text-primary)] bg-no-repeat bg-[right_0.5rem_center] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                    style={{ backgroundImage: SVG_ARROW }}
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}h</option>)}
                  </select>
                  <select
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    aria-label="Minutos"
                    className="appearance-none rounded-md border border-[var(--color-border-primary)] px-3 py-2 pr-8 text-[13px] text-[var(--color-text-primary)] bg-no-repeat bg-[right_0.5rem_center] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                    style={{ backgroundImage: SVG_ARROW }}
                  >
                    {MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sf-price" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Preço *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">R$</span>
                  <input
                    id="sf-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full rounded-md border border-[var(--color-border-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
                  />
                </div>
              </div>
              {durationMin > 0 && priceNum > 0 && (
                <div className="rounded-lg bg-[var(--color-surface-secondary)] px-4 py-3 text-[13px] text-[var(--color-text-secondary)]">
                  Este serviço terá duração de{' '}
                  <strong className="text-[var(--color-text-primary)]">
                    {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : hours === 0 ? '0min' : ''}
                  </strong>{' '}
                  e custará{' '}
                  <strong className="text-[var(--color-text-primary)]">
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
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Quem pode realizar este serviço?</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">Selecione os profissionais habilitados (opcional)</p>
              </div>
              {professionals.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-tertiary)]">Nenhum profissional cadastrado ainda. Você pode pular e adicionar depois.</p>
              ) : (
                <div className="space-y-2">
                  {professionals.map((p) => {
                    const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                    const checked = selectedProfs.has(p.id)
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border-primary)] px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-secondary)]">
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
                          className="accent-[var(--color-brand)]"
                        />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-[11px] font-bold text-[var(--color-brand)]">{initials}</span>
                        <div>
                          <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{p.name}</p>
                          {p.specialty && <p className="text-[11px] text-[var(--color-text-tertiary)]">{p.specialty}</p>}
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
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Como este serviço será exibido?</p>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--color-border-primary)] px-4 py-3">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Ativo</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => setActive((v) => !v)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors duration-150',
                    active ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-secondary)]',
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150',
                    active ? 'translate-x-4' : 'translate-x-0.5',
                  )} />
                </button>
              </label>
              <div className="rounded-xl border border-[var(--color-border-primary)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Resumo</p>
                <p className="mt-2 text-[14px] font-semibold text-[var(--color-text-primary)]">{name || '—'}</p>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
                  {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : ''} · R$ {priceNum.toFixed(2).replace('.', ',')}
                </p>
                {selectedProfs.size > 0 && (
                  <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{selectedProfs.size} profissional(is) habilitado(s)</p>
                )}
                <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">Status: {active ? 'Ativo' : 'Inativo'}</p>
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
            className="rounded text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]"
          >
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]"
            >
              Próximo <ChevronRight size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-dark)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]"
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
