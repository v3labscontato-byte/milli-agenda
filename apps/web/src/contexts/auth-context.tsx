'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { authApi, type RegisterPayload, type LoginResponse } from '@/lib/api/auth'

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface AuthTenant {
  id: string
  name: string
  slug: string
}

interface AuthState {
  user: AuthUser | null
  tenant: AuthTenant | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, slug?: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function getTenantSlug(): string {
  // Prefer slug stored after last login/register
  const stored = localStorage.getItem('tenantSlug')
  if (stored) return stored
  // Use subdomain only on the real product domain
  const hostname = window.location.hostname
  if (hostname.endsWith('.milliagenda.com.br')) return hostname.split('.')[0]
  return process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'bella-vista'
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const rawUser = localStorage.getItem('user')
    const rawTenant = localStorage.getItem('tenant')

    if (token && rawUser && rawTenant) {
      api.setToken(token)
      setState({
        user: JSON.parse(rawUser) as AuthUser,
        tenant: JSON.parse(rawTenant) as AuthTenant,
        isLoading: false,
        isAuthenticated: true,
      })
    } else {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  async function login(email: string, password: string, slug?: string) {
    const tenantSlug = slug || getTenantSlug()
    const res = await authApi.login({ email, password, tenantSlug })
    storeAuth(res)
  }

  function storeAuth(res: LoginResponse) {
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    localStorage.setItem('tenantSlug', res.tenant.slug)
    localStorage.setItem('user', JSON.stringify(res.user))
    localStorage.setItem('tenant', JSON.stringify(res.tenant))
    setCookie('accessToken', res.accessToken)
    api.setToken(res.accessToken)
    setState({ user: res.user, tenant: res.tenant, isLoading: false, isAuthenticated: true })
  }

  async function register(payload: RegisterPayload) {
    const res = await authApi.register(payload)
    storeAuth(res)
  }

  function logout() {
    const slug = localStorage.getItem('tenantSlug')
    localStorage.clear()
    // Preserve slug so the next login on the same device works without re-entering it
    if (slug) localStorage.setItem('tenantSlug', slug)
    clearCookie('accessToken')
    api.setToken('')
    setState({ user: null, tenant: null, isLoading: false, isAuthenticated: false })
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
