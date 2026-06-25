'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEATURES } from '@/lib/features'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('milli_access_token') ?? ''
}

const PRESET_COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#059669',
  '#D97706', '#DC2626', '#0891B2', '#475569',
]

interface ServiceCat {
  id: string
  name: string
  color: string
  order: number
}

const MOCK_CATEGORIES: ServiceCat[] = [
  { id: '1', name: 'Cabelo', color: '#2563EB', order: 1 },
  { id: '2', name: 'Unhas', color: '#DB2777', order: 2 },
  { id: '3', name: 'Maquiagem', color: '#059669', order: 3 },
]

export default function SectionCategoriasServicos() {
  const [categories, setCategories] = useState<ServiceCat[]>(MOCK_CATEGORIES)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(PRESET_COLORS[0])

  const fetchCategories = useCallback(async () => {
    if (!FEATURES.realServicos) {
      setIsLoading(false)
      return
    }
    try {
      const token = getToken()
      const res = await fetch(`${API_URL}/services/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async () => {
    if (!newName.trim()) return
    if (!FEATURES.realServicos) {
      const id = Math.random().toString(36).substr(2, 9)
      setCategories(prev => [...prev, { id, name: newName, color: newColor, order: prev.length + 1 }])
      setNewName('')
      setNewColor(PRESET_COLORS[0])
      setIsAdding(false)
      return
    }
    try {
      const token = getToken()
      const res = await fetch(`${API_URL}/services/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName, color: newColor }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(prev => [...prev, data])
        setNewName('')
        setNewColor(PRESET_COLORS[0])
        setIsAdding(false)
      }
    } catch (err) {
      console.error('Failed to create category:', err)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    if (!FEATURES.realServicos) {
      setCategories(prev =>
        prev.map(cat => (cat.id === id ? { ...cat, name: editName, color: editColor } : cat))
      )
      setEditingId(null)
      setEditName('')
      setEditColor(PRESET_COLORS[0])
      return
    }
    try {
      const token = getToken()
      const res = await fetch(`${API_URL}/services/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName, color: editColor }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(prev =>
          prev.map(cat => (cat.id === id ? data : cat))
        )
        setEditingId(null)
        setEditName('')
        setEditColor(PRESET_COLORS[0])
      }
    } catch (err) {
      console.error('Failed to update category:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!FEATURES.realServicos) {
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return
    }
    try {
      const token = getToken()
      await fetch(`${API_URL}/services/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  const startEdit = (cat: ServiceCat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
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
        <h2 className="text-[15px] font-semibold text-[#0F172A]">Categorias de Serviços</h2>
        <p className="mt-0.5 text-[13px] text-[#64748B]">Organize seus serviços por categoria</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
        <div className="rounded-lg border border-[#E2E8F0] bg-white">
          {categories.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[14px] text-[#64748B]">
                Nenhuma categoria cadastrada. Adicione a primeira categoria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4">
                  {editingId === cat.id ? (
                    <div className="flex w-full items-center gap-3">
                      <div className="flex w-full gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 rounded border border-[#E2E8F0] px-2 py-1 text-[13px]"
                          placeholder="Nome da categoria"
                        />
                        <div className="flex gap-1">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className={cn(
                                'h-6 w-6 rounded border-2',
                                editColor === color ? 'border-[#0F172A]' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="flex h-8 w-8 items-center justify-center rounded bg-[#10B981] hover:bg-[#059669]"
                      >
                        <Check size={16} className="text-white" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 items-center justify-center rounded bg-[#E2E8F0] hover:bg-[#CBD5E1]"
                      >
                        <X size={16} className="text-[#475569]" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-[14px] text-[#0F172A]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#F1F5F9]"
                        >
                          <Pencil size={16} className="text-[#475569]" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#FEE2E2]"
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
            <div className="border-t border-[#E2E8F0] p-4">
              <button
                onClick={() => {
                  setIsAdding(true)
                  setNewName('')
                  setNewColor(PRESET_COLORS[0])
                }}
                className="flex items-center gap-2 text-[14px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                <Plus size={16} />
                Nova Categoria
              </button>
            </div>
          )}

          {isAdding && (
            <div className="border-t border-[#E2E8F0] p-4">
              <div className="mb-3 space-y-2">
                <label className="text-[12px] font-medium uppercase text-[#64748B]">Nome</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-[13px]"
                  placeholder="Ex: Cabelo, Unhas, Maquiagem..."
                  autoFocus
                />
              </div>
              <div className="mb-4 space-y-2">
                <label className="text-[12px] font-medium uppercase text-[#64748B]">Cor</label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={cn(
                        'h-8 w-8 rounded border-2',
                        newColor === color ? 'border-[#0F172A]' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded border border-[#E2E8F0] bg-white py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC]"
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
