'use client'

import { useState } from 'react'
import { Plus, X, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_PLANO_CONTAS, type PlanoConta } from '@/lib/financeiro-mock'

// ─── Nova Conta Modal ─────────────────────────────────────────────────────────

const CATEGORIAS_FIXAS     = ['Moradia','Utilidades','Comunicação','Proteção','Tecnologia','Administrativo']
const CATEGORIAS_VARIAVEIS = ['Pessoal','Insumos','Vendas','Operacional','Fiscal','Geral']

interface NovaContaModalProps {
  open: boolean
  onClose: () => void
  onSave: (c: Omit<PlanoConta, 'id'>) => void
}

const EMPTY = { nome: '', categoria: '', tipo: 'fixa' as 'fixa' | 'variavel', ativa: true }

function NovaContaModal({ open, onClose, onSave }: NovaContaModalProps) {
  const [form, setForm] = useState(EMPTY)
  if (!open) return null

  const categorias = form.tipo === 'fixa' ? CATEGORIAS_FIXAS : CATEGORIAS_VARIAVEIS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.categoria) return
    onSave({ nome: form.nome.trim(), categoria: form.categoria, tipo: form.tipo, ativa: form.ativa })
    setForm(EMPTY)
    onClose()
  }

  const INPUT = cn('w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] placeholder:text-[#64748B]')
  const LABEL = 'text-[12px] font-medium text-[#475569]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Nova conta">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF]">
              <BookOpen size={14} className="text-[#2563EB]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Nova Conta</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="nc-nome" className={LABEL}>Nome da conta *</label>
            <input id="nc-nome" type="text" required placeholder="Ex.: Aluguel"
              value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} className={INPUT} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nc-tipo" className={LABEL}>Tipo</label>
            <select id="nc-tipo" value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as 'fixa'|'variavel', categoria: '' }))}
              className={INPUT}>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nc-cat" className={LABEL}>Categoria</label>
            <select id="nc-cat" value={form.categoria} required
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className={INPUT}>
              <option value="">Selecionar…</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
            <span className="text-[13px] font-medium text-[#0F172A]">Conta ativa</span>
            <button type="button" role="switch" aria-checked={form.ativa}
              onClick={() => setForm((f) => ({ ...f, ativa: !f.ativa }))}
              className={cn('relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                form.ativa ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
              <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                form.ativa ? 'translate-x-4' : 'translate-x-0.5')} />
            </button>
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-md border border-[#E2E8F0] py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-md bg-[#2563EB] py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlanoContas() {
  const [contas, setContas] = useState<PlanoConta[]>(MOCK_PLANO_CONTAS)
  const [modalOpen, setModalOpen] = useState(false)
  const [filtro, setFiltro] = useState<'all' | 'fixa' | 'variavel'>('all')

  function handleSave(data: Omit<PlanoConta, 'id'>) {
    setContas((prev) => [...prev, { ...data, id: `pc-${Date.now()}` }])
  }

  function toggleAtiva(id: string) {
    setContas((prev) => prev.map((c) => c.id === id ? { ...c, ativa: !c.ativa } : c))
  }

  const filtered = filtro === 'all' ? contas : contas.filter((c) => c.tipo === filtro)
  const fixas    = contas.filter((c) => c.tipo === 'fixa').length
  const variaveis = contas.filter((c) => c.tipo === 'variavel').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Plano de Contas</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{fixas} fixas · {variaveis} variáveis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="Filtrar tipo">
            {([['all','Todas'],['fixa','Fixas'],['variavel','Variáveis']] as const).map(([v,l]) => (
              <button key={v} type="button" onClick={() => setFiltro(v)} aria-pressed={filtro === v}
                className={cn('rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  filtro === v ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
                {l}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-[#2563EB] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <Plus size={13} aria-hidden="true" /> Nova Conta
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]" aria-label="Plano de contas">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Nome','Categoria','Tipo','Status','Ações'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-[13px] text-[#94A3B8]">Nenhuma conta encontrada.</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id} className={cn('transition-colors hover:bg-[#F8FAFC]', i < filtered.length - 1 && 'border-b border-[#F1F5F9]')}>
                  <td className="px-5 py-3 text-[13px] font-medium text-[#0F172A]">{c.nome}</td>
                  <td className="px-5 py-3 text-[12px] text-[#475569]">{c.categoria}</td>
                  <td className="px-5 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
                      c.tipo === 'fixa' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#FFF7ED] text-[#C2410C]')}>
                      {c.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
                      c.ativa ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]')}>
                      {c.ativa ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" role="switch" aria-checked={c.ativa}
                      onClick={() => toggleAtiva(c.id)}
                      aria-label={c.ativa ? `Desativar ${c.nome}` : `Ativar ${c.nome}`}
                      className={cn('relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        c.ativa ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
                      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        c.ativa ? 'translate-x-4' : 'translate-x-0.5')} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NovaContaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
