'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, User, Mail, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPublicClientAppointments, createPublicClient, TENANT_SLUG } from '@/lib/api/public-booking'
import type { PublicTenant, PublicTenantBusinessHours } from '@/hooks/use-public-tenant'
import { type BookingClientInfo } from '@/hooks/use-booking-client'

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function isOpenNow(bh: PublicTenantBusinessHours | null | undefined): boolean {
  if (!bh?.days) return false
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[new Date().getDay()]
  const cfg = bh.days.find((d) => d.day === today)
  if (!cfg?.open) return false
  const [sh, sm] = cfg.start.split(':').map(Number)
  const [eh, em] = cfg.end.split(':').map(Number)
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  return nowMin >= sh * 60 + sm && nowMin < eh * 60 + em
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

type AccessTab = 'entrar' | 'cadastrar'

interface PhoneIdentifyProps {
  onFound: (client: BookingClientInfo) => void
  tenant?: PublicTenant | null
}

export default function PhoneIdentify({ onFound, tenant }: PhoneIdentifyProps) {
  const router = useRouter()

  const primary      = tenant?.primaryColor ?? '#3D2B1F'
  const salonName    = tenant?.name ?? 'Salão'
  const coverUrl     = tenant?.coverImageUrl ?? null
  const logoUrl      = tenant?.logoUrl ?? null
  const city         = tenant?.city ?? ''
  const state        = tenant?.state ?? ''
  const openNow      = isOpenNow(tenant?.businessHours)
  const locationStr  = [city, state].filter(Boolean).join(', ')
  const initials     = salonName.replace(/\s+/g, '').slice(0, 2).toUpperCase()

  const [tab, setTab] = useState<AccessTab>('entrar')
  const [toast, setToast] = useState('')

  // Entrar
  const [ePhone, setEPhone] = useState('')
  const [eLoading, setELoading] = useState(false)
  const [eError, setEError] = useState('')

  // Cadastrar
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cLoading, setCLoading] = useState(false)
  const [cError, setCError] = useState('')
  const [cMsg, setCMsg] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleContinuar(e: FormEvent) {
    e.preventDefault()
    if (ePhone.replace(/\D/g, '').length < 10) return
    setELoading(true)
    setEError('')
    try {
      const { client } = await fetchPublicClientAppointments(TENANT_SLUG, ePhone)
      if (client) {
        onFound({ id: client.id, name: client.name, phone: client.phone ?? ePhone, email: client.email })
      } else {
        setCPhone(ePhone)
        setCMsg('Telefone não encontrado. Crie sua conta para continuar.')
        setTab('cadastrar')
      }
    } catch {
      setEError('Erro ao verificar telefone. Tente novamente.')
    } finally {
      setELoading(false)
    }
  }

  async function handleCriarConta(e: FormEvent) {
    e.preventDefault()
    if (!cName.trim() || cPhone.replace(/\D/g, '').length < 10) return
    setCLoading(true)
    setCError('')
    try {
      const client = await createPublicClient(TENANT_SLUG, {
        name: cName.trim(),
        phone: cPhone,
        email: cEmail.trim() || undefined,
      })
      onFound({ id: client.id, name: client.name, phone: client.phone ?? cPhone, email: client.email })
    } catch (err) {
      setCError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setCLoading(false)
    }
  }

  const inputCls = [
    'w-full h-12 rounded-[14px] border border-[#E2E8F0] bg-white pl-10 pr-4',
    'text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#D4B896] focus:border-transparent',
    'transition-colors',
  ].join(' ')

  const eCanSubmit = ePhone.replace(/\D/g, '').length >= 10 && !eLoading
  const cCanSubmit = cName.trim().length > 0 && cPhone.replace(/\D/g, '').length >= 10 && !cLoading

  return (
    <div className="flex min-h-svh flex-col bg-[#FAF7F4] pb-20">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0F172A] px-5 py-2 text-[13px] text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero */}
      <div
        className="relative h-60 w-full flex-shrink-0"
        style={
          coverUrl
            ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #FAF7F4 0%, #D4B896 55%, #3D2B1F 100%)' }
        }
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* Salon info */}
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/80 text-[13px] font-bold"
            style={logoUrl ? {} : { backgroundColor: primary, color: '#FAF7F4' }}
          >
            {logoUrl
              ? <img src={logoUrl} alt={salonName} className="h-full w-full object-cover" />
              : initials
            }
          </div>
          <div>
            <p className="text-[16px] font-bold leading-tight text-white">{salonName}</p>
            <p className="text-[12px] text-white/80">
              <span className={openNow ? 'text-[#86EFAC]' : 'text-white/60'}>
                {openNow ? '● Aberto agora' : '○ Fechado'}
              </span>
              {locationStr ? ` · ${locationStr}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5">

        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0]" role="tablist" aria-label="Acesso à conta">
          {(['entrar', 'cadastrar'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 border-b-2 pb-3 pt-4 text-[14px] font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4B896]',
                tab !== t && 'border-transparent text-[#94A3B8] hover:text-[#475569]',
              )}
              style={tab === t ? { borderBottomColor: primary, color: primary } : {}}
            >
              {t === 'entrar' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* ── ABA ENTRAR ── */}
        {tab === 'entrar' && (
          <form onSubmit={handleContinuar} className="flex flex-col gap-4 pt-6">
            <div>
              <h2
                className="text-[22px] font-bold text-[#0F172A]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Olá, bem-vindo
              </h2>
              <p className="mt-1 text-[14px] text-[#475569]">
                Informe seu telefone para acessar seus agendamentos
              </p>
            </div>

            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={ePhone}
                onChange={(e) => { setEPhone(maskPhone(e.target.value)); setEError('') }}
                className={inputCls}
                autoComplete="tel"
                autoFocus
              />
            </div>

            {eError && (
              <p className="rounded-[14px] border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2.5 text-[13px] text-[#DC2626]">
                {eError}
              </p>
            )}

            <button
              type="submit"
              disabled={!eCanSubmit}
              className={cn(
                'h-12 w-full rounded-[14px] text-[15px] font-semibold text-[#FAF7F4] transition-opacity',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                !eCanSubmit && 'cursor-not-allowed opacity-40',
              )}
              style={{ backgroundColor: primary }}
            >
              {eLoading
                ? <span className="inline-flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />Verificando...</span>
                : 'Continuar'
              }
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[12px] text-[#94A3B8]">ou acesse com</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <button
              type="button"
              onClick={() => showToast('Em breve')}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="flex items-center justify-center gap-2 pb-2 pt-1 text-[12px] text-[#94A3B8]">
              <Shield size={13} aria-hidden="true" />
              <span>Seus dados estão protegidos</span>
            </div>
          </form>
        )}

        {/* ── ABA CADASTRAR ── */}
        {tab === 'cadastrar' && (
          <form onSubmit={handleCriarConta} className="flex flex-col gap-4 pt-6">
            <div>
              <h2
                className="text-[22px] font-bold text-[#0F172A]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Primeiro acesso
              </h2>
              <p className="mt-1 text-[14px] text-[#475569]">
                Crie sua conta para gerenciar seus agendamentos
              </p>
            </div>

            {cMsg && (
              <div className="rounded-[14px] border border-[#E2E8F0] bg-white px-4 py-3 text-[13px] text-[#475569]">
                {cMsg}
              </div>
            )}

            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Nome completo"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className={inputCls}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={cPhone}
                onChange={(e) => { setCPhone(maskPhone(e.target.value)); setCError('') }}
                className={inputCls}
                autoComplete="tel"
              />
            </div>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="email"
                placeholder="E-mail (opcional)"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </div>

            {cError && (
              <p className="rounded-[14px] border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-2.5 text-[13px] text-[#DC2626]">
                {cError}
              </p>
            )}

            <button
              type="submit"
              disabled={!cCanSubmit}
              className={cn(
                'h-12 w-full rounded-[14px] text-[15px] font-semibold text-[#FAF7F4] transition-opacity',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                !cCanSubmit && 'cursor-not-allowed opacity-40',
              )}
              style={{ backgroundColor: primary }}
            >
              {cLoading
                ? <span className="inline-flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />Criando conta...</span>
                : 'Criar conta'
              }
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[12px] text-[#94A3B8]">ou cadastre com</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <button
              type="button"
              onClick={() => showToast('Em breve')}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2E8F0]"
            >
              <GoogleIcon />
              Cadastrar com Google
            </button>

            <div className="flex items-center justify-center gap-2 pb-2 pt-1 text-[12px] text-[#94A3B8]">
              <Shield size={13} aria-hidden="true" />
              <span>Seus dados estão protegidos</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
