'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEATURES } from '@/lib/features'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('accessToken') ?? ''
}

interface ProfRole {
  id: string
  name: string
  description?: string | null
  order: number
}

const MOCK_ROLES: ProfRole[] = [
  { id: '1', name: 'Cabeleireiro', description: null, order: 0 },
  { id: '2', name: 'Colorista', description: null, order: 1 },
  { id: '3', name: 'Manicure', description: null, order: 2 },
]

export default function SectionTiposProfissionais() {
  const [roles, setRoles] = useState<ProfRole[]>(FEATURES.realProfissionais ? [] : MOCK_ROLES)
  const [isLoading, setIsLoading] = useState(FEATURES.realProfissionais)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const fetchRoles = useCallback(async () => {
    if (!FEATURES.realProfissionais) { setIsLoading(false); return }
    try {
      const res = await fetch(`${API_URL}/api/v1/professionals/roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const json = await res.json()
        setRoles((json as { data?: ProfRole[] }).data ?? (json as ProfRole[]))
      }
    } catch {
      // silently fall through — empty state handles it
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleCreate = async () => {
    if (!newName.trim()) return
    if (!FEATURES.realProfissionais) {
      setRoles((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: newName, description: newDesc || null, order: prev.length }])
      setNewName(''); setNewDesc(''); setIsAdding(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/professionals/roles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc || undefined }),
      })
      if (res.ok) {
        const json = await res.json()
        const created = (json as { data?: ProfRole }).data ?? (json as ProfRole)
        setRoles((prev) => [...prev, created])
        setNewName(''); setNewDesc(''); setIsAdding(false)
      }
    } catch { /* noop */ }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    if (!FEATURES.realProfissionais) {
      setRoles((prev) => prev.map((r) => r.id === id ? { ...r, name: editName, description: editDesc || null } : r))
      setEditingId(null); setEditName(''); setEditDesc('')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/professionals/roles/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc || undefined }),
      })
      if (res.ok) {
        const json = await res.json()
        const updated = (json as { data?: ProfRole }).data ?? (json as ProfRole)
        setRoles((prev) => prev.map((r) => r.id === id ? updated : r))
        setEditingId(null); setEditName(''); setEditDesc('')
      }
    } catch { /* noop */ }
  }

  const handleDelete = async (id: string) => {
    if (!FEATURES.realProfissionais) {
      setRoles((prev) => prev.filter((r) => r.id !== id))
      return
    }
    try {
      await fetch(`${API_URL}/api/v1/professionals/roles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setRoles((prev) => prev.filter((r) => r.id !== id))
    } catch { /* noop */ }
  }

  const startEdit = (role: ProfRole) => {
    setEditingId(role.id)
    setEditName(role.name)
    setEditDesc(role.description ?? '')
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[14px] text-[#64748B]">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <h2 className="text-[15px] font-semibold text-[#0F172A]">Tipos de Profissionais</h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">Configure os cargos disponíveis no seu salão</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
        <div className="rounded-lg border border-[#E2E8F0] bg-white">
          {roles.length === 0 && !isAdding ? (
            <div className="p-6 text-center">
              <p className="text-[14px] text-[#64748B]">
                Nenhum tipo cadastrado. Adicione o primeiro tipo de profissional.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4">
                  {editingId === role.id ? (
                    <div className="flex w-full items-center gap-3">
                      <div className="flex w-full flex-col gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-[#E2E8F0] px-2 py-1 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          placeholder="Nome do cargo"
                        />
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full rounded border border-[#E2E8F0] px-2 py-1 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                          placeholder="Descrição (opcional)"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdate(role.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#10B981] hover:bg-[#059669]"
                      >
                        <Check size={16} className="text-white" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#E2E8F0] hover:bg-[#CBD5E1]"
                      >
                        <X size={16} className="text-[#475569]" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#0F172A]">{role.name}</p>
                        {role.description && (
                          <p className="mt-0.5 truncate text-[12px] text-[#64748B]">{role.description}</p>
                        )}
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => startEdit(role)}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded hover:bg-[#F1F5F9]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          )}
                        >
                          <Pencil size={16} className="text-[#475569]" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded hover:bg-[#FEE2E2]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                          )}
                        >
                          <Trash2 size={16} className="text-[#DC2626]" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isAdding && (
            <div className={cn('p-4', roles.length > 0 && 'border-t border-[#E2E8F0]')}>
              <button
                onClick={() => { setIsAdding(true); setNewName(''); setNewDesc('') }}
                className={cn(
                  'flex items-center gap-2 text-[14px] font-medium text-[#2563EB] hover:text-[#1D4ED8]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                )}
              >
                <Plus size={16} />
                Novo Tipo
              </button>
            </div>
          )}

          {isAdding && (
            <div className={cn('p-4', roles.length > 0 && 'border-t border-[#E2E8F0]')}>
              <div className="mb-3 space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  placeholder="Ex: Cabeleireiro, Colorista, Barbeiro..."
                  autoFocus
                />
              </div>
              <div className="mb-4 space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Descrição</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded border border-[#E2E8F0] bg-white py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
