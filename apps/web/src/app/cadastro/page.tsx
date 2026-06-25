'use client'

import { Suspense, useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ApiError } from '@/lib/api/client'
import { passwordStrength } from '@/lib/password-strength'

// ─── Design tokens ────────────────────────────────────────────────────────────

const INPUT_BASE = [
  'w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#0F172A]',
  'placeholder:text-[#64748B]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'disabled:opacity-60 transition-colors duration-150',
].join(' ')
const INPUT_OK  = 'border-[#E2E8F0] focus:border-[#2563EB]'
const INPUT_ERR = 'border-[#EF4444] focus:border-[#EF4444]'
const LABEL     = 'block text-[13px] font-medium text-[#475569] mb-1.5'
const ERR_MSG   = 'mt-1 text-[12px] text-[#DC2626]'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = passwordStrength(password)
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i < score ? color : '#E2E8F0' }}
          />
        ))}
      </div>
      <p className="text-[12px] font-medium" style={{ color }}>{label}</p>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Salão', 'Responsável', 'Plano'] as const

function StepBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex items-center gap-0">
      {STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const done    = n < current
        const active  = n === current
        const isLast  = i === STEPS.length - 1
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors duration-150',
                  done   ? 'bg-[#2563EB] text-white'
                  : active ? 'border-2 border-[#2563EB] bg-white text-[#2563EB]'
                           : 'border-2 border-[#E2E8F0] bg-white text-[#94A3B8]',
                ].join(' ')}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : n}
              </div>
              <span
                className={[
                  'text-[11px] font-medium',
                  active ? 'text-[#2563EB]' : done ? 'text-[#475569]' : 'text-[#94A3B8]',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={[
                  'mx-1 h-px flex-1 self-start mt-3.5 transition-colors duration-150',
                  n < current ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  name, price, features, highlight, loading,
  onChoose,
}: {
  name: string
  price: string
  features: string[]
  highlight?: boolean
  loading: boolean
  onChoose: () => void
}) {
  return (
    <div
      className={[
        'flex flex-col rounded-xl border p-5 transition-shadow duration-150',
        highlight
          ? 'border-[#2563EB] shadow-[0_0_0_1px_#2563EB]'
          : 'border-[#E2E8F0]',
      ].join(' ')}
    >
      <p className="text-[15px] font-semibold text-[#0F172A]">{name}</p>
      <p className="mt-1 text-[22px] font-bold text-[#0F172A]">{price}</p>
      <ul className="mt-4 flex flex-col gap-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[#475569]">
            <Check size={13} className="shrink-0 text-[#10B981]" />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onChoose}
        disabled={loading}
        className={[
          'mt-5 w-full rounded-lg py-2.5 text-[13px] font-semibold transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
          highlight
            ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:bg-[#93C5FD]'
            : 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-60',
        ].join(' ')}
      >
        {loading ? 'Criando conta…' : 'Escolher'}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FormState {
  salonName: string
  slug: string
  phone: string
  ownerName: string
  email: string
  password: string
  confirmPassword: string
}

type Errors = Partial<Record<keyof FormState, string>>

const PLAN_PARAM_MAP: Record<string, 'starter' | 'pro'> = {
  starter:      'starter',
  professional: 'pro',
  pro:          'pro',
  enterprise:   'pro',
}

function CadastroForm() {
  const { register } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const preselectedPlan = PLAN_PARAM_MAP[searchParams.get('plan') ?? '']

  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [showCfm, setShowCfm]   = useState(false)
  const [errors, setErrors]     = useState<Errors>({})

  const [form, setForm] = useState<FormState>({
    salonName: '', slug: '', phone: '',
    ownerName: '', email: '', password: '', confirmPassword: '',
  })

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function handleSalonName(value: string) {
    setForm((f) => ({
      ...f,
      salonName: value,
      slug: toSlug(value),
    }))
    if (errors.salonName) setErrors((e) => ({ ...e, salonName: undefined }))
    if (errors.slug)      setErrors((e) => ({ ...e, slug: undefined }))
  }

  // ── Validations ─────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const e: Errors = {}
    if (form.salonName.trim().length < 3) e.salonName = 'Mínimo 3 caracteres'
    if (!/^[a-z0-9-]{3,}$/.test(form.slug)) e.slug = 'Mínimo 3 caracteres: letras, números e hífens'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: Errors = {}
    if (form.ownerName.trim().length < 3)  e.ownerName = 'Mínimo 3 caracteres'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (form.password.length < 6)           e.password = 'Mínimo 6 caracteres'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'As senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  function nextStep() {
    setApiError('')
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))
  }

  function prevStep() {
    setApiError('')
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleChoosePlan(plan: 'starter' | 'pro') {
    setApiError('')
    setLoading(true)
    try {
      await register({
        salonName: form.salonName,
        slug:      form.slug,
        ownerName: form.ownerName,
        email:     form.email,
        password:  form.password,
        phone:     form.phone || undefined,
        plan,
      })
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApiError('Este slug já está em uso. Volte e escolha outro.')
      } else {
        setApiError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Logo */}
          <div className="mb-6 text-center">
            <p className="text-[28px] font-bold text-[#2563EB]">Milli</p>
            <p className="mt-1 text-[14px] text-[#64748B]">Cadastre seu salão grátis</p>
          </div>

          <StepBar current={step} />

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className={LABEL}>Nome do salão</label>
                <input
                  type="text"
                  placeholder="Bella Vista Hair Studio"
                  value={form.salonName}
                  onChange={(e) => handleSalonName(e.target.value)}
                  autoComplete="organization"
                  className={`${INPUT_BASE} ${errors.salonName ? INPUT_ERR : INPUT_OK}`}
                />
                {errors.salonName && <p className={ERR_MSG}>{errors.salonName}</p>}
              </div>

              <div>
                <label className={LABEL}>Slug (link único)</label>
                <input
                  type="text"
                  placeholder="bella-vista"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className={`${INPUT_BASE} ${errors.slug ? INPUT_ERR : INPUT_OK}`}
                />
                {form.slug && !errors.slug && (
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    milliagenda.com.br/<span className="font-medium text-[#2563EB]">{form.slug}</span>
                  </p>
                )}
                {errors.slug && <p className={ERR_MSG}>{errors.slug}</p>}
              </div>

              <div>
                <label className={LABEL}>Telefone <span className="font-normal text-[#94A3B8]">(opcional)</span></label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  autoComplete="tel"
                  className={`${INPUT_BASE} ${INPUT_OK}`}
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Próximo →
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className={LABEL}>Seu nome completo</label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={form.ownerName}
                  onChange={(e) => set('ownerName', e.target.value)}
                  autoComplete="name"
                  className={`${INPUT_BASE} ${errors.ownerName ? INPUT_ERR : INPUT_OK}`}
                />
                {errors.ownerName && <p className={ERR_MSG}>{errors.ownerName}</p>}
              </div>

              <div>
                <label className={LABEL}>E-mail de acesso</label>
                <input
                  type="email"
                  placeholder="joao@seuSalao.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                  className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
                />
                {errors.email && <p className={ERR_MSG}>{errors.email}</p>}
              </div>

              <div>
                <label className={LABEL}>Senha</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    autoComplete="new-password"
                    className={`${INPUT_BASE} ${errors.password ? INPUT_ERR : INPUT_OK} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    {showPwd ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <p className={ERR_MSG}>{errors.password}</p>}
                <StrengthBar password={form.password} />
              </div>

              <div>
                <label className={LABEL}>Confirmar senha</label>
                <div className="relative">
                  <input
                    type={showCfm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    className={`${INPUT_BASE} ${errors.confirmPassword ? INPUT_ERR : INPUT_OK} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCfm((v) => !v)}
                    aria-label={showCfm ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    {showCfm ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className={ERR_MSG}>{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 rounded-lg border border-[#E2E8F0] py-3 text-[14px] font-semibold text-[#475569] transition-colors duration-150 hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!!form.confirmPassword && form.confirmPassword !== form.password}
                  className="flex-1 rounded-lg bg-[#2563EB] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              {apiError && (
                <p role="alert" className="rounded-lg bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#DC2626]">
                  {apiError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <PlanCard
                  name="Starter"
                  price="Grátis"
                  features={['1 profissional', '50 agend./mês', '15 dias trial']}
                  highlight={preselectedPlan === 'starter'}
                  loading={loading}
                  onChoose={() => handleChoosePlan('starter')}
                />
                <PlanCard
                  name="Pro"
                  price="R$97/mês"
                  features={['10 profissionais', 'Agendamentos ilimitados', 'Relatórios avançados']}
                  highlight={preselectedPlan ? preselectedPlan === 'pro' : true}
                  loading={loading}
                  onChoose={() => handleChoosePlan('pro')}
                />
              </div>

              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="w-full rounded-lg border border-[#E2E8F0] py-2.5 text-[13px] font-medium text-[#475569] transition-colors duration-150 hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:opacity-60"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-[12px] text-[#475569]">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-medium text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  )
}
