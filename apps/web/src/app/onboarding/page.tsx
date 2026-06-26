'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'

type Step = 1 | 2 | 3 | 4 | 5

interface NichoTemplate {
  slug: string
  name: string
  emoji: string
  comingSoon?: boolean
}

interface DaySchedule {
  day: string
  label: string
  open: boolean
  start: string
  end: string
}

interface ImportResult {
  categoriesCreated: number
  servicesCreated: number
  rolesCreated: number
  nichoSlug: string
}

const DAYS: DaySchedule[] = [
  { day: 'seg', label: 'Segunda',  open: true,  start: '08:00', end: '18:00' },
  { day: 'ter', label: 'Terça',    open: true,  start: '08:00', end: '18:00' },
  { day: 'qua', label: 'Quarta',   open: true,  start: '08:00', end: '18:00' },
  { day: 'qui', label: 'Quinta',   open: true,  start: '08:00', end: '18:00' },
  { day: 'sex', label: 'Sexta',    open: true,  start: '08:00', end: '18:00' },
  { day: 'sab', label: 'Sábado',   open: true,  start: '08:00', end: '14:00' },
  { day: 'dom', label: 'Domingo',  open: false, start: '08:00', end: '12:00' },
]

const COMING_SOON: NichoTemplate[] = [
  { slug: 'podologia',  name: 'Podologia',            emoji: '🦶', comingSoon: true },
  { slug: 'esmalteria', name: 'Esmalteria',            emoji: '💅', comingSoon: true },
  { slug: 'personal',   name: 'Personal Trainer',      emoji: '💪', comingSoon: true },
  { slug: 'spa',        name: 'SPA & Massagem',         emoji: '🧖', comingSoon: true },
  { slug: 'pet',        name: 'Pet Shop',               emoji: '🐾', comingSoon: true },
  { slug: 'tattoo',     name: 'Studio de Tattoo',       emoji: '🎨', comingSoon: true },
  { slug: 'odonto',     name: 'Clínica Odontológica',   emoji: '🦷', comingSoon: true },
]

const EMOJI_MAP: Record<string, string> = {
  'salao-de-beleza': '✂️',
  'barbearia': '💈',
  'clinica-estetica': '💆',
  'outros': '🏪',
}

const OPEN_TIMES  = Array.from({ length: 11 }, (_, i) => { const h = 7 + Math.floor(i / 2); const m = i % 2 === 0 ? '00' : '30'; return `${String(h).padStart(2,'0')}:${m}` })
const CLOSE_TIMES = Array.from({ length: 17 }, (_, i) => { const h = 14 + Math.floor(i / 2); const m = i % 2 === 0 ? '00' : '30'; return `${String(h).padStart(2,'0')}:${m}` })

const STEP_LABELS: Record<Step, string> = { 1: 'Revisão', 2: 'Segmento', 3: 'Serviços', 4: 'Horários', 5: 'Concluído' }

function LeftPanel({ step }: { step: Step }) {
  return (
    <div className="flex w-[35%] flex-col bg-[#2563EB] p-10 text-white">
      <p className="mb-12 text-2xl font-bold">Milli</p>
      <p className="mb-2 text-[13px] font-medium uppercase tracking-widest text-blue-200">Configuração inicial</p>
      <p className="mb-10 text-xl font-semibold">Vamos preparar seu salão</p>
      <nav className="space-y-4">
        {([1, 2, 3, 4, 5] as Step[]).map((s) => {
          const done = step > s
          const current = step === s
          return (
            <div key={s} className="flex items-center gap-3">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors duration-150',
                  done || current
                    ? 'border-white bg-white text-[#2563EB]'
                    : 'border-blue-300 bg-transparent text-blue-300',
                ].join(' ')}
              >
                {done ? '✓' : s}
              </span>
              <span className={current || done ? 'font-medium text-white' : 'text-blue-300'}>
                {STEP_LABELS[s]}
              </span>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [tenantInfo, setTenantInfo] = useState<{ name: string; slug: string; plan: string } | null>(null)
  const [templates, setTemplates] = useState<NichoTemplate[]>([])
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [nichoError, setNichoError] = useState('')
  const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS)

  useEffect(() => {
    authApi.getOnboardingStatus()
      .then((s) => {
        if (s.completed) router.push('/dashboard')
        else setTenantInfo(s.tenant)
      })
      .catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/templates`)
      .then((r) => r.json())
      .then((json: { data?: Array<{ slug: string; name: string }> }) => {
        const list = json.data ?? []
        setTemplates(list.map((t) => ({ slug: t.slug, name: t.name, emoji: EMOJI_MAP[t.slug] ?? '🏪' })))
      })
      .catch(() => {
        setTemplates([
          { slug: 'salao-de-beleza', name: 'Salão de Beleza', emoji: '✂️' },
          { slug: 'barbearia',       name: 'Barbearia',        emoji: '💈' },
          { slug: 'clinica-estetica',name: 'Clínica Estética', emoji: '💆' },
          { slug: 'outros',          name: 'Outros',            emoji: '🏪' },
        ])
      })
  }, [])

  const handleNichoSelect = async (slug: string) => {
    setSelectedNicho(slug)
    setNichoError('')
    setIsImporting(true)
    try {
      const result = await authApi.selectNicho(slug)
      setImportResult(result)
      setStep(3)
    } catch {
      setNichoError('Erro ao configurar o segmento. Tente novamente.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleComplete = async () => {
    try {
      await authApi.completeOnboarding()
    } finally {
      router.push('/dashboard')
    }
  }

  const toggleDay = (idx: number) => {
    setSchedule((prev) => prev.map((d, i) => i === idx ? { ...d, open: !d.open } : d))
  }

  const updateTime = (idx: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  return (
    <div className="flex min-h-screen">
      <LeftPanel step={step} />

      <div className="flex flex-1 flex-col items-center justify-center bg-white p-10">

        {/* Step 1 — Revisão */}
        {step === 1 && (
          <div className="w-full max-w-lg">
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Bem-vindo ao Milli!</h1>
            <p className="mb-8 text-[14px] text-[#64748B]">Confirme as informações do seu salão antes de continuar.</p>
            {tenantInfo ? (
              <div className="rounded-xl border border-[#E2E8F0] p-6 space-y-4">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[#64748B]">Nome do salão</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#0F172A]">{tenantInfo.name}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[#64748B]">Endereço de acesso</p>
                  <p className="mt-1 text-[14px] text-[#475569]">milli.app/<span className="font-medium text-[#2563EB]">{tenantInfo.slug}</span></p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[#64748B]">Plano</p>
                  <span className="mt-1 inline-block rounded-full bg-[#DBEAFE] px-3 py-1 text-[13px] font-medium text-[#2563EB] capitalize">{tenantInfo.plan}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#DBEAFE] border-t-[#2563EB]" />
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!tenantInfo}
              className="mt-8 w-full rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Segmento */}
        {step === 2 && (
          <div className="w-full max-w-xl">
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Qual é o seu segmento?</h1>
            <p className="mb-8 text-[14px] text-[#64748B]">Escolha o tipo de negócio para configurarmos serviços e categorias automaticamente.</p>

            {isImporting && (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
                <div className="rounded-2xl bg-white p-10 text-center shadow-2xl">
                  <span className="mb-4 flex h-12 w-12 animate-spin rounded-full border-4 border-[#DBEAFE] border-t-[#2563EB] mx-auto" />
                  <p className="text-[15px] font-semibold text-[#0F172A]">Criando seu ambiente de trabalho...</p>
                  <p className="mt-1 text-[13px] text-[#64748B]">Isso levará apenas alguns segundos.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {templates.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => handleNichoSelect(t.slug)}
                  className={[
                    'flex flex-col items-start rounded-xl p-5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    selectedNicho === t.slug
                      ? 'border-2 border-[#2563EB] bg-[#EFF6FF]'
                      : 'border border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  <span className="mb-2 text-3xl">{t.emoji}</span>
                  <span className="text-[14px] font-semibold text-[#0F172A]">{t.name}</span>
                </button>
              ))}
            </div>

            {nichoError && (
              <p className="mb-4 rounded-lg bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#DC2626]">{nichoError}</p>
            )}

            <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[#94A3B8]">Em breve</p>
            <div className="grid grid-cols-2 gap-3">
              {COMING_SOON.map((t) => (
                <div
                  key={t.slug}
                  className="flex cursor-not-allowed flex-col items-start rounded-xl border border-[#E2E8F0] p-5 opacity-50 pointer-events-none"
                >
                  <span className="mb-2 text-3xl">{t.emoji}</span>
                  <span className="text-[14px] font-semibold text-[#0F172A]">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Ambiente pronto */}
        {step === 3 && (
          <div className="w-full max-w-lg text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5] mx-auto">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Ambiente configurado!</h1>
            <p className="mb-8 text-[14px] text-[#64748B]">Criamos tudo automaticamente com base no seu segmento.</p>
            {importResult && (
              <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl border border-[#E2E8F0] p-6">
                <div>
                  <p className="text-2xl font-bold text-[#2563EB]">{importResult.servicesCreated}</p>
                  <p className="text-[12px] text-[#64748B]">serviços</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2563EB]">{importResult.categoriesCreated}</p>
                  <p className="text-[12px] text-[#64748B]">categorias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2563EB]">{importResult.rolesCreated}</p>
                  <p className="text-[12px] text-[#64748B]">funções</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setStep(4)}
              className="w-full rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 4 — Horários */}
        {step === 4 && (
          <div className="w-full max-w-2xl">
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Horário de funcionamento</h1>
            <p className="mb-8 text-[14px] text-[#64748B]">Para finalizar, configure os horários de atendimento.</p>
            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-left font-medium text-[#64748B]">Dia</th>
                    <th className="px-4 py-3 text-left font-medium text-[#64748B]">Abertura</th>
                    <th />
                    <th className="px-4 py-3 text-left font-medium text-[#64748B]">Fechamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {schedule.map((d, idx) => (
                    <tr
                      key={d.day}
                      className={['bg-white transition-opacity duration-150', !d.open ? 'opacity-40 pointer-events-none' : ''].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <label className="flex cursor-pointer items-center gap-3" style={{ pointerEvents: 'auto' }}>
                          <input
                            type="checkbox"
                            checked={d.open}
                            onChange={() => toggleDay(idx)}
                            className="h-4 w-4 rounded accent-[#2563EB]"
                          />
                          <span className="font-medium text-[#0F172A]">{d.label}</span>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={d.start}
                          onChange={(e) => updateTime(idx, 'start', e.target.value)}
                          disabled={!d.open}
                          className="appearance-none rounded-lg border border-[#E2E8F0] px-3 py-1.5 pr-8 text-[13px] text-[#0F172A] bg-white cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                        >
                          {OPEN_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-3 text-center text-[12px] text-[#94A3B8]">às</td>
                      <td className="px-4 py-3">
                        <select
                          value={d.end}
                          onChange={(e) => updateTime(idx, 'end', e.target.value)}
                          disabled={!d.open}
                          className="appearance-none rounded-lg border border-[#E2E8F0] px-3 py-1.5 pr-8 text-[13px] text-[#0F172A] bg-white cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                        >
                          {CLOSE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setStep(5)}
              className="mt-8 w-full rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="mt-3 w-full rounded text-center text-[13px] text-[#64748B] transition-colors duration-150 hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Pular
            </button>
          </div>
        )}

        {/* Step 5 — Concluído */}
        {step === 5 && (
          <div className="w-full max-w-lg text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5] mx-auto">
              <span className="text-4xl font-bold text-[#10B981]">✓</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Seu ambiente está pronto!</h1>
            <p className="mb-2 text-[14px] text-[#64748B]">
              Tudo configurado. Agora você pode gerenciar agendamentos, profissionais, serviços e muito mais.
            </p>
            <p className="mb-10 text-[13px] text-[#94A3B8]">Você pode ajustar qualquer configuração a qualquer momento nas Configurações.</p>
            <button
              onClick={handleComplete}
              className="w-full rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Ir para o Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
