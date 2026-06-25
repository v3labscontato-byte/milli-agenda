'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type MetaTipo = 'receita' | 'agendamentos' | 'clientes' | 'avaliacoes'
type Periodo = 'diaria' | 'semanal' | 'mensal'
type Step = 1 | 2

const TIPOS: { id: MetaTipo; label: string; emoji: string; prefix: string }[] = [
  { id: 'receita',      label: 'Receita Bruta',  emoji: '💰', prefix: 'R$' },
  { id: 'agendamentos', label: 'Agendamentos',    emoji: '📅', prefix: ''   },
  { id: 'clientes',     label: 'Novos Clientes',  emoji: '👥', prefix: ''   },
  { id: 'avaliacoes',   label: 'Avaliações',      emoji: '⭐', prefix: ''   },
]

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'diaria',  label: 'Diária'  },
  { id: 'semanal', label: 'Semanal' },
  { id: 'mensal',  label: 'Mensal'  },
]

interface SmartFormMetaProps {
  open: boolean
  onClose: () => void
}

export default function SmartFormMeta({ open, onClose }: SmartFormMetaProps) {
  const [step, setStep] = useState<Step>(1)
  const [tipo, setTipo] = useState<MetaTipo>('receita')
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [valor, setValor] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1); setTipo('receita'); setPeriodo('mensal')
      setValor(''); setSaving(false)
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      setDataInicio(`${y}-${m}-${d}`)
      const last = new Date(y, now.getMonth() + 1, 0)
      setDataFim(`${y}-${m}-${String(last.getDate()).padStart(2, '0')}`)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  const tipoInfo = TIPOS.find((t) => t.id === tipo)!

  function handleSave() {
    if (!valor) return
    setSaving(true)
    // TODO: POST /reports/goals quando tabela Goal existir no banco
    try {
      const metas = JSON.parse(localStorage.getItem('milli_metas') || '[]') as unknown[]
      metas.push({ id: Date.now(), tipo, periodo, valor: Number(valor), dataInicio, dataFim, criadaEm: new Date().toISOString() })
      localStorage.setItem('milli_metas', JSON.stringify(metas))
    } catch { /* noop */ }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Nova meta">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              {step === 1 ? 'Tipo e período' : 'Valor e vigência'}
            </p>
            <div className="mt-1 flex gap-1.5">
              {[1, 2].map((s) => (
                <span key={s} className={cn('h-1.5 rounded-full transition-all', s === step ? 'w-5 bg-[#2563EB]' : s < step ? 'w-1.5 bg-[#2563EB]/40' : 'w-1.5 bg-[#E2E8F0]')} />
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#475569] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Nova meta financeira</p>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Defina uma meta para acompanhar seu desempenho</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTipo(t.id)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                      tipo === t.id ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                    )}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-[13px] font-medium text-[#0F172A]">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#475569]">Período</label>
                <div className="flex gap-2">
                  {PERIODOS.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPeriodo(p.id)}
                      className={cn(
                        'flex-1 rounded-full border py-1 text-[12px] font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        periodo === p.id ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]'
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Valor da meta</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#475569]">Valor alvo *</label>
                <div className="flex items-center gap-2">
                  {tipoInfo.prefix && <span className="text-[13px] text-[#64748B]">{tipoInfo.prefix}</span>}
                  <input type="number" min="0" value={valor} onChange={(e) => setValor(e.target.value)}
                    placeholder={tipoInfo.prefix ? '5000' : '50'}
                    autoFocus
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] placeholder:text-[#64748B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Início</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Fim</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                </div>
              </div>
              {valor && (
                <div className="rounded-lg bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#475569]">
                  Meta de <strong className="text-[#0F172A]">{tipoInfo.prefix} {valor}</strong> em {tipoInfo.label.toLowerCase()} para o período de <strong className="text-[#0F172A]">{dataInicio} a {dataFim}</strong>
                </div>
              )}
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
            <button type="button" onClick={() => setStep(2)}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              Próximo <ChevronRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={handleSave} disabled={!valor || saving}
              className="flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]">
              {saving ? 'Criando…' : <><Check size={13} /> Criar meta</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
