'use client'

import { useState } from 'react'
import { Phone, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPublicClientAppointments, TENANT_SLUG } from '@/lib/api/public-booking'
import { useBookingClient, type BookingClientInfo } from '@/hooks/use-booking-client'

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

interface PhoneIdentifyProps {
  onFound: (client: BookingClientInfo) => void
}

export default function PhoneIdentify({ onFound }: PhoneIdentifyProps) {
  const { setClient } = useBookingClient()
  const [phone, setPhone]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError]       = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const rawDigits = phone.replace(/\D/g, '')
    if (rawDigits.length < 10) return
    setLoading(true)
    setNotFound(false)
    setError('')
    try {
      const { client } = await fetchPublicClientAppointments(TENANT_SLUG, phone)
      if (!client) {
        setNotFound(true)
      } else {
        const info: BookingClientInfo = {
          id: client.id,
          name: client.name,
          phone: client.phone ?? phone,
          email: client.email,
        }
        setClient(info)
        onFound(info)
      }
    } catch {
      setError('Erro ao buscar agendamentos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = [
    'w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3.5',
    'text-body text-content-primary placeholder:text-content-subtle',
    'focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light',
  ].join(' ')

  return (
    <div className="flex flex-col px-5 py-8">
      <div className="mb-6 text-center">
        <span className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-xlight text-[32px]" aria-hidden="true">
          📅
        </span>
        <h2 className="mt-3 text-[20px] font-bold text-content-primary">Meus Agendamentos</h2>
        <p className="mt-1 text-body text-content-subtle">Informe seu telefone para ver seus agendamentos</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="phone-identify" className="mb-1.5 block text-[12px] font-medium text-content-secondary">
            Telefone cadastrado
          </label>
          <div className="relative">
            <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-content-subtle" aria-hidden="true" />
            <input
              id="phone-identify"
              type="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => { setPhone(maskPhone(e.target.value)); setNotFound(false) }}
              className={inputCls}
              autoComplete="tel"
            />
          </div>
        </div>

        {notFound && (
          <p className="rounded-xl border border-border bg-background px-4 py-3 text-[13px] text-content-secondary">
            Nenhum agendamento encontrado para este telefone.
          </p>
        )}

        {error && (
          <p className="text-[13px] text-danger-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={phone.replace(/\D/g, '').length < 10 || loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5',
            'text-[15px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            phone.replace(/\D/g, '').length >= 10 && !loading
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'cursor-not-allowed bg-background-secondary text-content-muted',
          )}
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
            : <Search size={16} aria-hidden="true" />}
          {loading ? 'Buscando...' : 'Buscar meus agendamentos'}
        </button>

        <div className="relative flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[12px] text-content-subtle">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border bg-background py-3.5 text-[14px] font-medium text-content-muted opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google <span className="text-[11px]">(em breve)</span>
        </button>
      </form>
    </div>
  )
}
