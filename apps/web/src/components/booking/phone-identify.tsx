'use client'

import { useState, useRef, type FormEvent } from 'react'
import { ArrowLeft, Phone, User, Mail, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPublicClientAppointments, createPublicClient, TENANT_SLUG } from '@/lib/api/public-booking'
import type { PublicTenant } from '@/hooks/use-public-tenant'
import { type BookingClientInfo } from '@/hooks/use-booking-client'

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.07 2.18.79 2.93.8.95-.19 1.84-.92 3.15-.99 2.04.17 3.57 1.43 4.05 3.56-1.78.97-2.63 2.57-2.29 4.43.28 1.63 1.08 2.91 2.16 3.06zM15.01 3.3C14.93 5.14 13.55 6.73 12 6.85c-.28-1.7 1.16-3.44 3.01-3.55z"
      />
    </svg>
  )
}

type UIState = 'idle' | 'loading' | 'register' | 'creating'

interface PhoneIdentifyProps {
  onFound: (client: BookingClientInfo) => void
  tenant?: PublicTenant | null
}

export default function PhoneIdentify({ onFound, tenant }: PhoneIdentifyProps) {
  const primary   = tenant?.primaryColor ?? '#81736f'
  const salonName = tenant?.name ?? 'Salão'
  const logoUrl   = tenant?.logoUrl ?? null
  const initials  = salonName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()

  const [phone,   setPhone]   = useState('')
  const [uiState, setUiState] = useState<UIState>('idle')
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState('')
  const triggered = useRef(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function handlePhoneChange(raw: string) {
    const masked = maskPhone(raw)
    setPhone(masked)
    setError('')
    const digits = masked.replace(/\D/g, '')
    if (digits.length < 11) { triggered.current = false; return }
    if (!triggered.current) { triggered.current = true; void lookup(digits) }
  }

  async function lookup(digits: string) {
    setUiState('loading')
    try {
      const { client } = await fetchPublicClientAppointments(TENANT_SLUG, digits)
      if (client) {
        onFound({ id: client.id, name: client.name, phone: client.phone ?? digits, email: client.email })
      } else {
        setUiState('register')
      }
    } catch {
      setError('Erro ao verificar. Tente novamente.')
      setUiState('idle')
      triggered.current = false
    }
  }

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setUiState('creating')
    setError('')
    try {
      const client = await createPublicClient(TENANT_SLUG, {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim() || undefined,
      })
      onFound({ id: client.id, name: client.name, phone: client.phone ?? phone, email: client.email })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.')
      setUiState('register')
    }
  }

  const fieldCls = [
    'w-full h-12 rounded-[12px] border border-[#E2E8F0] bg-white pl-11 pr-4',
    'text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#E2E8F0] transition-colors',
  ].join(' ')

  return (
    <div className="flex h-full flex-col bg-white">

      {/* Toast — sempre no DOM para aria-live funcionar */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0F172A] px-5 py-2 text-[13px] text-white shadow-lg transition-opacity duration-200',
          toast ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {toast}
      </div>

      {/* ── HERO 170px ── */}
      <div
        className="relative h-[170px] shrink-0"
        style={{ backgroundColor: primary }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[13px] font-bold text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.20)', border: '2px solid rgba(255,255,255,0.80)' }}
          >
            {logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoUrl} alt={salonName} className="h-full w-full object-cover" />
              : initials
            }
          </div>
          <div>
            <p className="text-[16px] font-bold leading-tight text-white">{salonName}</p>
            <p className="mt-0.5 text-[10px] text-white/65">⭐ Aceita novos clientes</p>
          </div>
        </div>
      </div>

      {/* ── TELA DE CADASTRO ── */}
      {uiState === 'register' || uiState === 'creating' ? (
        <form
          onSubmit={handleCreateAccount}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8 pt-5"
        >
          <button
            type="button"
            onClick={() => { setUiState('idle'); setPhone(''); setError(''); triggered.current = false }}
            className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Voltar
          </button>

          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A]">Primeiro acesso</h2>
            <p className="mt-0.5 text-[13px] text-[#475569]">Crie sua conta em segundos</p>
          </div>

          <div
            className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            <Phone size={11} aria-hidden="true" />
            {phone}
          </div>

          <div className="relative">
            <label htmlFor="r-name" className="sr-only">Nome completo</label>
            <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input
              id="r-name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldCls}
              autoComplete="name"
              autoFocus
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="r-email" className="sr-only">E-mail (opcional)</label>
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input
              id="r-email"
              type="email"
              placeholder="E-mail (opcional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldCls}
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="rounded-[10px] border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2.5 text-[12px] text-[#DC2626]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || uiState === 'creating'}
            className={cn(
              'h-[50px] w-full rounded-[14px] text-[15px] font-semibold text-white transition-opacity',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              (!name.trim() || uiState === 'creating') && 'cursor-not-allowed opacity-40',
            )}
            style={{ backgroundColor: primary }}
          >
            {uiState === 'creating'
              ? <span className="inline-flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />Criando conta...</span>
              : 'Criar conta e entrar'
            }
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
            <Shield size={12} aria-hidden="true" />
            <span>Seus dados estão protegidos</span>
          </div>
        </form>
      ) : (
        /* ── FORM PRINCIPAL (idle / loading) ── */
        <div className="relative flex flex-1 flex-col px-5 pb-6 pt-6">

          {/* Overlay verificando */}
          {uiState === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90">
              <span
                className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E2E8F0]"
                style={{ borderTopColor: primary }}
                aria-hidden="true"
              />
              <p className="text-[14px] font-semibold text-[#0F172A]">Verificando...</p>
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                <Phone size={11} aria-hidden="true" />
                {phone}
              </div>
            </div>
          )}

          <h2 className="text-[18px] font-bold text-[#0F172A]">Agende seus serviços</h2>
          <p className="mt-0.5 text-[13px] text-[#475569]">Informe seu telefone para entrar ou criar conta</p>

          <div className="relative mt-5">
            <label htmlFor="l-phone" className="sr-only">Telefone</label>
            <Phone
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: primary }}
              aria-hidden="true"
            />
            <input
              id="l-phone"
              type="tel"
              inputMode="numeric"
              placeholder="(11) 9 0000-0000"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={uiState === 'loading'}
              className="w-full rounded-[12px] bg-white pl-11 pr-4 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors disabled:opacity-50"
              style={{
                height: 50,
                border: `2px solid ${primary}`,
                '--tw-ring-color': primary,
              } as React.CSSProperties}
              autoComplete="tel"
              autoFocus
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#94A3B8]">Login automático ao digitar 11 dígitos</p>

          {error && (
            <p className="mt-2 rounded-[10px] border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2.5 text-[12px] text-[#DC2626]">
              {error}
            </p>
          )}

          <div className="relative mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-[12px] text-[#94A3B8]">ou acesse com</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => showToast('Em breve')}
              aria-label="Login com Google — em breve disponível"
              className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
            >
              <GoogleIcon />
              Continuar com Google
              <span className="text-[11px] text-[#94A3B8]">(em breve)</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Em breve')}
              aria-label="Login com Apple — em breve disponível"
              className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
            >
              <AppleIcon />
              Continuar com Apple
              <span className="text-[11px] text-[#94A3B8]">(em breve)</span>
            </button>
          </div>

          <div className="mt-auto flex items-center justify-center gap-2 pt-4 text-[11px] text-[#94A3B8]">
            <Shield size={12} aria-hidden="true" />
            <span>Seus dados estão protegidos</span>
          </div>
        </div>
      )}
    </div>
  )
}
