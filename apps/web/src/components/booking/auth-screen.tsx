'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SALON } from '@/lib/booking-mock'
import { usePublicTenant } from '@/hooks/use-public-tenant'
import { FEATURES } from '@/lib/features'

type View = 'login' | 'signup'

const inputCls = [
  'w-full rounded-xl border border-border bg-background px-4 py-3',
  'text-body text-content-primary placeholder:text-content-subtle',
  'focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light',
].join(' ')

const labelCls = 'mb-1 block text-[12px] font-medium text-content-secondary'

interface AuthScreenProps {
  onSuccess?: () => void
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-white py-3.5',
        'text-[14px] font-medium text-content-primary transition-colors',
        'hover:border-content-muted hover:bg-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border',
      )}
    >
      <span className="text-[18px]" aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[12px] text-content-subtle">ou</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function LoginView({ onSwitch, onSuccess, salonName }: { onSwitch: () => void; onSuccess?: () => void; salonName: string }) {
  const [email,    setEmail]   = useState('maria@email.com')
  const [password, setPassword] = useState('••••••••')
  const [showPw,   setShowPw]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha.'); return }
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onSuccess?.()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 py-10">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <span className="text-[48px]" aria-hidden="true">{SALON.emoji}</span>
        <h1 className="text-[20px] font-bold text-content-primary">{salonName}</h1>
      </div>

      <h2 className="mb-6 text-[18px] font-semibold text-content-primary">Bem-vinda de volta! 👋</h2>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className={labelCls}>Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="login-pw" className={labelCls}>Senha</label>
          <div className="relative">
            <input
              id="login-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(inputCls, 'pr-12')}
            />
            <button
              type="button"
              aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-content-subtle hover:text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              {showPw ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && <p className="text-[12px] text-danger-medium" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-[50px] w-full items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" /> : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        className="mt-4 text-center text-[13px] font-medium text-primary focus-visible:outline-none focus-visible:underline"
      >
        Esqueci minha senha
      </button>

      <div className="my-6 flex flex-col gap-3">
        <Divider />
        <SocialButton icon="🇬" label="Continuar com Google" />
        <SocialButton icon="🍎" label="Continuar com Apple" />
      </div>

      <p className="mt-auto text-center text-[13px] text-content-subtle">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-primary focus-visible:outline-none focus-visible:underline"
        >
          Cadastre-se
        </button>
      </p>
    </div>
  )
}

function SignupView({ onSwitch, onSuccess, salonName }: { onSwitch: () => void; onSuccess?: () => void; salonName: string }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [terms,    setTerms]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !phone || !password) { setError('Preencha todos os campos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (!terms) { setError('Aceite os termos para continuar.'); return }
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    onSuccess?.()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 py-10">
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <span className="text-[48px]" aria-hidden="true">{SALON.emoji}</span>
        <h1 className="text-[20px] font-bold text-content-primary">{salonName}</h1>
      </div>

      <h2 className="mb-5 text-[18px] font-semibold text-content-primary">Criar sua conta ✨</h2>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor="su-name" className={labelCls}>Nome completo</label>
          <input id="su-name" type="text" autoComplete="name" placeholder="ex: Maria Silva"
            value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="su-email" className={labelCls}>Email</label>
          <input id="su-email" type="email" autoComplete="email" placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="su-phone" className={labelCls}>Telefone (WhatsApp)</label>
          <input id="su-phone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000"
            value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="su-pw" className={labelCls}>Senha</label>
          <input id="su-pw" type="password" autoComplete="new-password" placeholder="Mín. 8 caracteres"
            value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="su-confirm" className={labelCls}>Confirmar senha</label>
          <input id="su-confirm" type="password" autoComplete="new-password" placeholder="Repita a senha"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
          />
          <span className="text-[12px] text-content-secondary">
            Aceito os{' '}
            <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">Termos de Uso</Link>
            {' '}e a{' '}
            <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">Política de Privacidade</Link>
          </span>
        </label>

        {error && <p className="text-[12px] text-danger-medium" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-[50px] w-full items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" /> : 'Criar conta'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-content-subtle">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-primary focus-visible:outline-none focus-visible:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  )
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [view, setView] = useState<View>('login')
  const { tenant } = usePublicTenant()
  const salonName = (FEATURES.realBooking ? tenant?.name : null) ?? SALON.name

  return view === 'login'
    ? <LoginView  onSwitch={() => setView('signup')} onSuccess={onSuccess} salonName={salonName} />
    : <SignupView onSwitch={() => setView('login')}  onSuccess={onSuccess} salonName={salonName} />
}
