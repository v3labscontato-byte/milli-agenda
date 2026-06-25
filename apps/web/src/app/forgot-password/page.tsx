'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'

const INPUT_BASE = [
  'w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#0F172A]',
  'placeholder:text-[#64748B]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'disabled:opacity-60',
].join(' ')
const INPUT_OK  = 'border-[#E2E8F0] focus:border-[#2563EB]'
const INPUT_ERR = 'border-[#EF4444] focus:border-[#EF4444]'

const CONFIRM_MSG = 'Se este e-mail estiver cadastrado, você receberá um link em breve.'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido')
      return
    }
    setLoading(true)
    const tenantSlug = window.location.hostname.split('.')[0] || 'default'
    try {
      await authApi.forgotPassword(email, tenantSlug)
    } catch {
      // Never reveal whether the e-mail exists — always show the same message
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Logo */}
          <div className="mb-8 text-center">
            <p className="text-[28px] font-bold text-[#2563EB]">Milli</p>
            <p className="mt-1 text-[14px] text-[#64748B]">Recuperar sua senha</p>
          </div>

          {sent ? (
            <div className="space-y-5 text-center">
              <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-[13px] text-[#16A34A]">
                {CONFIRM_MSG}
              </p>
              <Link
                href="/login"
                className="inline-block rounded text-[13px] font-medium text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="block text-[13px] font-medium text-[#475569]">
                  E-mail
                </label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="admin@seuSalao.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                  disabled={loading}
                  autoComplete="email"
                  className={`${INPUT_BASE} ${error ? INPUT_ERR : INPUT_OK}`}
                />
                {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={[
                  'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold text-white',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                  loading
                    ? 'cursor-not-allowed bg-[#93C5FD]'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8]',
                ].join(' ')}
              >
                {loading && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
                {loading ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="rounded text-[13px] text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  ← Voltar para o login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
