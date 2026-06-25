'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ApiError } from '@/lib/api/client'

const INPUT = [
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-[#0F172A]',
  'placeholder:text-[#94A3B8]',
  'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'disabled:opacity-60',
].join(' ')

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [slug,     setSlug]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, slug)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Email, senha ou slug do salão incorretos.')
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]">
            <Scissors size={22} className="text-white" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-bold text-[#0F172A]">Milli Agenda</h1>
            <p className="mt-1 text-[14px] text-[#64748B]">Acesse o painel do seu salão</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="space-y-4">
            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="l-slug" className="block text-[12px] font-medium text-[#475569]">
                Slug do salão
              </label>
              <input
                id="l-slug"
                type="text"
                required
                placeholder="ex: bella-vista"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                disabled={loading}
                autoComplete="organization"
                className={INPUT}
              />
              <p className="text-[11px] text-[#94A3B8]">O identificador do seu estabelecimento</p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="l-email" className="block text-[12px] font-medium text-[#475569]">
                Email
              </label>
              <input
                id="l-email"
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className={INPUT}
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="l-senha" className="block text-[12px] font-medium text-[#475569]">
                Senha
              </label>
              <input
                id="l-senha"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className={INPUT}
              />
            </div>

            {/* Erro */}
            {error && (
              <p role="alert" className="rounded-lg bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#DC2626]">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !slug || !email || !password}
              className={[
                'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold text-white',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                loading || !slug || !email || !password
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
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
