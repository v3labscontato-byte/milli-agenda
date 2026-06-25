'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ApiError } from '@/lib/api/client'

const INPUT_BASE = [
  'w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#0F172A]',
  'placeholder:text-[#64748B]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'disabled:opacity-60',
].join(' ')
const INPUT_OK  = 'border-[#E2E8F0] focus:border-[#2563EB]'
const INPUT_ERR = 'border-[#EF4444] focus:border-[#EF4444]'

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors,   setErrors]   = useState({ email: '', password: '' })

  function validate() {
    const e = { email: '', password: '' }
    if (!email.trim())    e.email    = 'Informe o e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido'
    if (!password.trim()) e.password = 'Informe a senha'
    setErrors(e)
    return !e.email && !e.password
  }

  async function handleLogin() {
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setApiError('Credenciais inválidas. Verifique e tente novamente.')
      } else {
        setApiError('Erro ao conectar com o servidor. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Logo */}
          <div className="mb-8 text-center">
            <p className="text-[28px] font-bold text-[#2563EB]">Milli</p>
            <p className="mt-1 text-[14px] text-[#64748B]">Acesse o painel do seu salão</p>
          </div>

          {/* Fields */}
          <div className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="l-email" className="block text-[13px] font-medium text-[#475569]">
                E-mail
              </label>
              <input
                id="l-email"
                type="email"
                placeholder="admin@seuSalao.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                }}
                disabled={loading}
                autoComplete="email"
                className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
              />
              {errors.email && <p className="text-[12px] text-[#DC2626]">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="l-senha" className="block text-[13px] font-medium text-[#475569]">
                Senha
              </label>
              <div className="relative">
                <input
                  id="l-senha"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                  }}
                  disabled={loading}
                  autoComplete="current-password"
                  className={`${INPUT_BASE} ${errors.password ? INPUT_ERR : INPUT_OK} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  {showPwd
                    ? <EyeOff size={16} aria-hidden="true" />
                    : <Eye    size={16} aria-hidden="true" />
                  }
                </button>
              </div>
              {errors.password && <p className="text-[12px] text-[#DC2626]">{errors.password}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <p role="alert" className="rounded-lg bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#DC2626]">
                {apiError}
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
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
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              className="rounded text-[13px] text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              Esqueceu a senha?
            </button>
            <p className="text-[12px] text-[#475569]">
              Não tem conta?{' '}
              <Link
                href="/cadastro"
                className="font-medium text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] rounded"
              >
                Cadastre seu salão grátis →
              </Link>
            </p>
            <p className="text-[11px] text-[#94A3B8]">Milli Agenda © 2026</p>
          </div>

        </div>
      </div>
    </div>
  )
}
