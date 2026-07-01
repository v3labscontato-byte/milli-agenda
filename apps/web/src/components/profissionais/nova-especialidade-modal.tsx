'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, Plus, Check, Pencil, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api/client'
import type { Profissional } from '@/lib/profissionais-mock'

interface Specialty {
  id: string
  name: string
  professionals: { professional: { id: string; name: string } }[]
}

interface Props {
  open: boolean
  onClose: () => void
  profissionais: Profissional[]
  onRefetch: () => Promise<Profissional[] | undefined>
}

type View = 'list' | 'step1' | 'step2'

export default function NovaEspecialidadeModal({ open, onClose, profissionais, onRefetch }: Props) {
  const [view, setView]                       = useState<View>('list')
  const [specialties, setSpecialties]         = useState<Specialty[]>([])
  const [loading, setLoading]                 = useState(false)
  const [nome, setNome]                       = useState('')
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([])
  const [saving, setSaving]                   = useState(false)
  const [editingId, setEditingId]             = useState<string | null>(null)
  const [editingName, setEditingName]         = useState('')

  const fetchSpecialties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Specialty[]>('/api/v1/professionals/specialties')
      setSpecialties(Array.isArray(res) ? res : [])
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setView('list')
      setNome('')
      setSelectedProfIds([])
      setEditingId(null)
      fetchSpecialties()
    }
  }, [open, fetchSpecialties])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleCreate() {
    if (!nome.trim()) return
    setSaving(true)
    try {
      await api.post('/api/v1/professionals/specialties', {
        name: nome.trim(),
        professionalIds: selectedProfIds,
      })
      await fetchSpecialties()
      await onRefetch()
      setView('list')
      setNome('')
      setSelectedProfIds([])
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  async function handleSaveEditName(id: string) {
    if (!editingName.trim()) return
    setSaving(true)
    try {
      await api.patch(`/api/v1/professionals/specialties/${id}`, { name: editingName.trim() })
      await fetchSpecialties()
      setEditingId(null)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta especialidade?')) return
    try {
      await api.delete(`/api/v1/professionals/specialties/${id}`)
      await fetchSpecialties()
      await onRefetch()
    } catch { /* ignore */ }
  }

  function toggleProf(id: string) {
    setSelectedProfIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Especialidades"
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
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button
                type="button"
                onClick={() => setView(view === 'step2' ? 'step1' : 'list')}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                aria-label="Voltar"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
            )}
            <h2 className="text-[15px] font-semibold text-[#0F172A]">
              {view === 'list' ? 'Especialidades' : view === 'step1' ? 'Nova Especialidade' : 'Profissionais'}
            </h2>
            {view !== 'list' && (
              <span className="text-[12px] text-[#94A3B8]">
                {view === 'step1' ? '1 de 2' : '2 de 2'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── View: list ── */}
          {view === 'list' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setView('step1'); setNome(''); setSelectedProfIds([]) }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl border border-dashed border-[#CBD5E1] px-4 py-3',
                  'text-[13px] font-medium text-[#2563EB] transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                )}
              >
                <Plus size={14} aria-hidden="true" />
                Nova Especialidade
              </button>

              {loading && (
                <div className="py-8 text-center text-[13px] text-[#94A3B8]">Carregando…</div>
              )}

              {!loading && specialties.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#E2E8F0]">
                  <p className="text-[13px] text-[#94A3B8]">Nenhuma especialidade cadastrada</p>
                </div>
              )}

              {!loading && specialties.map((sp) => {
                const profs = sp.professionals.map((r) => r.professional)
                const isEditing = editingId === sp.id
                return (
                  <div
                    key={sp.id}
                    className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveEditName(sp.id); if (e.key === 'Escape') setEditingId(null) }}
                          className="flex-1 rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveEditName(sp.id)}
                          disabled={saving}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          aria-label="Salvar nome"
                        >
                          <Check size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          aria-label="Cancelar"
                        >
                          <X size={13} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#0F172A]">{sp.name}</p>
                          {profs.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {profs.map((prof) => (
                                <span
                                  key={prof.id}
                                  className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#475569]"
                                >
                                  {prof.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-0.5 text-[11px] text-[#94A3B8]">Nenhum profissional associado</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditingId(sp.id); setEditingName(sp.name) }}
                            className="flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                            aria-label={`Editar ${sp.name}`}
                          >
                            <Pencil size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(sp.id)}
                            className="flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                            aria-label={`Excluir ${sp.name}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── View: step 1 — nome ── */}
          {view === 'step1' && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#475569]">
                Dê um nome para a nova especialidade. Ex: "Corte Feminino", "Escova", "Depilação".
              </p>
              <div>
                <label htmlFor="esp-nome" className="mb-1.5 block text-sm font-medium text-[#64748B]">
                  Nome da especialidade
                </label>
                <input
                  id="esp-nome"
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && nome.trim()) setView('step2') }}
                  placeholder="Ex: Coloração"
                  className={cn(
                    'w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-[13px] text-[#0F172A]',
                    'placeholder:text-[#94A3B8]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                  )}
                />
              </div>
            </div>
          )}

          {/* ── View: step 2 — profissionais ── */}
          {view === 'step2' && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#475569]">
                Selecione os profissionais que podem realizar <strong>{nome}</strong>:
              </p>
              <div className="space-y-2">
                {profissionais.length === 0 && (
                  <p className="text-[13px] text-[#94A3B8]">Nenhum profissional cadastrado ainda.</p>
                )}
                {profissionais.map((p) => {
                  const selected = selectedProfIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProf(p.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        selected
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]',
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                        selected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] bg-white',
                      )}>
                        {selected && <Check size={11} className="text-white" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#0F172A]">{p.name}</p>
                        <p className="text-[11px] text-[#94A3B8]">{p.role || '—'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {view !== 'list' && (
          <div className="flex shrink-0 items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
            <button
              type="button"
              onClick={() => setView(view === 'step2' ? 'step1' : 'list')}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Voltar
            </button>

            {view === 'step1' && (
              <button
                type="button"
                disabled={!nome.trim()}
                onClick={() => setView('step2')}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  nome.trim()
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                    : 'cursor-not-allowed bg-[#E2E8F0] text-[#94A3B8]',
                )}
              >
                Próximo
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            )}

            {view === 'step2' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleCreate()}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  saving
                    ? 'cursor-not-allowed bg-[#E2E8F0] text-[#94A3B8]'
                    : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
                )}
              >
                {saving ? 'Salvando…' : 'Criar especialidade'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
