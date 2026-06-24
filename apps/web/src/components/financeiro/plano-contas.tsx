'use client'

import { useState } from 'react'
import { Plus, X, BookOpen, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_PLANO_CONTAS, type PlanoConta } from '@/lib/financeiro-mock'

const CATEGORIAS_FIXAS     = ['Moradia','Utilidades','Comunicação','Proteção','Tecnologia','Administrativo']
const CATEGORIAS_VARIAVEIS = ['Pessoal','Insumos','Vendas','Operacional','Fiscal','Geral']

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

type ContaStatus = 'pago' | 'pendente' | 'atrasado'

function getContaStatus(c: PlanoConta): ContaStatus {
  if (!c.ativa || c.valor === 0) return 'pendente'
  if (c.pagoMesAtual) return 'pago'
  const today = new Date().getDate()
  return today > c.diaPagamento ? 'atrasado' : 'pendente'
}

function proxVencimento(c: PlanoConta): string {
  if (!c.ativa || c.diaPagamento === 0) return '—'
  const now = new Date()
  const nextMonth = c.pagoMesAtual ? now.getMonth() + 1 : now.getMonth()
  const d = new Date(now.getFullYear(), nextMonth, c.diaPagamento)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function StatusBadge({ status }: { status: ContaStatus }) {
  if (status === 'pago') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
      <CheckCircle2 size={10} aria-hidden="true" />Pago
    </span>
  )
  if (status === 'atrasado') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-medium text-[#DC2626]">
      <AlertCircle size={10} aria-hidden="true" />Atrasado
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
      <Clock size={10} aria-hidden="true" />Pendente
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY = { nome:'', categoria:'', tipo:'fixa' as 'fixa'|'variavel', valor:'', diaPagamento:'5', recorrente:true, ativa:true }

function NovaContaModal({ open, onClose, onSave }: { open:boolean; onClose:()=>void; onSave:(c:Omit<PlanoConta,'id'|'pagoMesAtual'>)=>void }) {
  const [form, setForm] = useState(EMPTY)
  if (!open) return null

  const categorias = form.tipo === 'fixa' ? CATEGORIAS_FIXAS : CATEGORIAS_VARIAVEIS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.categoria || !form.valor) return
    onSave({
      nome: form.nome.trim(), categoria: form.categoria, tipo: form.tipo,
      valor: Number(form.valor), diaPagamento: Math.min(Math.max(Number(form.diaPagamento)||5, 1), 31),
      recorrente: form.recorrente, ativa: form.ativa,
    })
    setForm(EMPTY)
    onClose()
  }

  const INPUT = cn('w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] placeholder:text-[#64748B]')
  const LABEL = 'text-[12px] font-medium text-[#475569]'
  const Toggle = ({ checked, onChange }: { checked:boolean; onChange:()=>void }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={cn('relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]', checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )

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
        <form onSubmit={handleSubmit} className="space-y-3.5 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="nc-nome" className={LABEL}>Nome *</label>
            <input id="nc-nome" type="text" required placeholder="Ex.: Aluguel"
              value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="nc-tipo" className={LABEL}>Tipo *</label>
              <select id="nc-tipo" value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as 'fixa'|'variavel', categoria: '' }))} className={INPUT}>
                <option value="fixa">Fixa</option>
                <option value="variavel">Variável</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nc-cat" className={LABEL}>Categoria *</label>
              <select id="nc-cat" value={form.categoria} required onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className={INPUT}>
                <option value="">Selecionar…</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="nc-valor" className={LABEL}>Valor R$ *</label>
              <input id="nc-valor" type="number" min="0" step="1" required placeholder="0"
                value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} className={INPUT} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nc-dia" className={LABEL}>Dia pag. *</label>
              <input id="nc-dia" type="number" min="1" max="31" required placeholder="5"
                value={form.diaPagamento} onChange={(e) => setForm((f) => ({ ...f, diaPagamento: e.target.value }))} className={INPUT} />
            </div>
          </div>
          {[
            { label:'Recorrente', checked:form.recorrente, fn:() => setForm((f)=>({...f,recorrente:!f.recorrente})) },
            { label:'Conta ativa', checked:form.ativa,      fn:() => setForm((f)=>({...f,ativa:!f.ativa})) },
          ].map(({ label, checked, fn }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
              <span className="text-[13px] font-medium text-[#0F172A]">{label}</span>
              <Toggle checked={checked} onChange={fn} />
            </div>
          ))}
          <div className="flex gap-2.5 pt-1">
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlanoContas() {
  const [contas, setContas] = useState<PlanoConta[]>(MOCK_PLANO_CONTAS)
  const [modalOpen, setModalOpen] = useState(false)
  const [filtro, setFiltro] = useState<'all'|'fixa'|'variavel'>('all')

  function handleSave(data: Omit<PlanoConta, 'id'|'pagoMesAtual'>) {
    setContas((prev) => [...prev, { ...data, id: `pc-${Date.now()}`, pagoMesAtual: false }])
  }
  function markPago(id: string) {
    setContas((prev) => prev.map((c) => c.id === id ? { ...c, pagoMesAtual: true } : c))
  }
  function remove(id: string) {
    setContas((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = filtro === 'all' ? contas : contas.filter((c) => c.tipo === filtro)
  const fixas     = contas.filter((c) => c.tipo === 'fixa').length
  const variaveis = contas.filter((c) => c.tipo === 'variavel').length
  const totalMes  = contas.filter((c) => c.ativa && c.valor > 0).reduce((s,c)=>s+c.valor,0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A]">Plano de Contas</h3>
          <p className="mt-0.5 text-[12px] text-[#475569]">{fixas} fixas · {variaveis} variáveis · Total/mês: {fmtBRL(totalMes)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="Filtrar tipo">
            {([['all','Todas'],['fixa','Fixas'],['variavel','Variáveis']] as const).map(([v,l]) => (
              <button key={v} type="button" onClick={() => setFiltro(v)} aria-pressed={filtro===v}
                className={cn('rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  filtro===v ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]')}>
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
          <table className="w-full min-w-[720px]" aria-label="Plano de contas">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Nome','Tipo','Valor/Mês','Dia Pag.','Próx. Venc.','Status','Ações'].map((h) => (
                  <th key={h} className={cn('px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]',
                    h === 'Valor/Mês' ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[#94A3B8]">Nenhuma conta encontrada.</td></tr>
              ) : filtered.map((c, i) => {
                const st = getContaStatus(c)
                return (
                  <tr key={c.id} className={cn('group transition-colors hover:bg-[#F8FAFC]', i < filtered.length - 1 && 'border-b border-[#F1F5F9]', !c.ativa && 'opacity-60')}>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-[#0F172A]">{c.nome}</p>
                      <p className="text-[11px] text-[#64748B]">{c.categoria}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
                        c.tipo === 'fixa' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#FFF7ED] text-[#C2410C]')}>
                        {c.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-[13px] font-semibold text-[#0F172A]">
                      {c.valor > 0 ? fmtBRL(c.valor) : '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#475569]">
                      {c.diaPagamento > 0 ? `Dia ${String(c.diaPagamento).padStart(2,'0')}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-tabular text-[12px] text-[#475569]">{proxVencimento(c)}</td>
                    <td className="px-4 py-3"><StatusBadge status={st} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        {st !== 'pago' && c.ativa && (
                          <button type="button" onClick={() => markPago(c.id)}
                            className="rounded-sm bg-[#F0FDF4] px-2 py-1 text-[11px] font-medium text-[#16A34A] hover:bg-[#DCFCE7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBF7D0]">
                            Marcar Pago
                          </button>
                        )}
                        <button type="button" onClick={() => remove(c.id)} aria-label={`Remover ${c.nome}`}
                          className="rounded-sm p-1 text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FECACA]">
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NovaContaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
