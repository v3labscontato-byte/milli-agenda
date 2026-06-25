'use client'

import { Suspense, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { passwordStrength } from '@/lib/password-strength'

const INPUT_BASE = [
  'w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#0F172A]',
  'placeholder:text-[#64748B]',
  'focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
  'disabled:opacity-60',
].join(' ')
const INPUT_OK  = 'border-[#E2E8F0] focus:border-[#2563EB]'
const INPUT_ERR = 'border-[#EF4444] focus:border-[#EF4444]'
const INPUT_GOOD = 'border-[#10B981] focus:border-[#10B981]'

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => passwordStrength(password), [password])
  if (!password) return null
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

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const strength  = passwordStrength(password)
  const matches   = confirm.length > 0 && confirm === password
  const mismatch  = confirm.length > 0 && confirm !== password
  const tooWeak   = strength.score <= 1
  const disabled  = loading || !password || tooWeak || !matches || !token

  async function handleSubmit() {
    setApiError('')
    if (disabled) return
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      router.push('/login?msg=senha-alterada')
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message || 'Não foi possível redefinir a senha.')
      } else {
        setApiError('Erro ao conectar com o servidor. Tente novamente.')
      }
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
            <p className="mt-1 text-[14px] text-[#64748B]">Defina sua nova senha</p>
          </div>

          {!token ? (
            <div className="space-y-5 text-center">
              <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
                Link inválido ou expirado. Solicite um novo link de recuperação.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block rounded text-[13px] font-medium text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <div className="space-y-5">

              {/* New password */}
              <div className="space-y-1.5">
                <label htmlFor="rp-senha" className="block text-[13px] font-medium text-[#475569]">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="rp-senha"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    className={`${INPUT_BASE} ${INPUT_OK} pr-11`}
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
                <StrengthBar password={password} />
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="rp-confirm" className="block text-[13px] font-medium text-[#475569]">
                  Confirmar nova senha
                </label>
                <input
                  id="rp-confirm"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                  disabled={loading}
                  autoComplete="new-password"
                  className={`${INPUT_BASE} ${mismatch ? INPUT_ERR : matches ? INPUT_GOOD : INPUT_OK}`}
                />
                {mismatch && <p className="text-[12px] text-[#DC2626]">As senhas não coincidem</p>}
              </div>

              {apiError && (
                <p role="alert" className="rounded-lg bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#DC2626]">
                  {apiError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled}
                className={[
                  'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold text-white',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
                  disabled
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
                {loading ? 'Salvando…' : 'Redefinir senha'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
