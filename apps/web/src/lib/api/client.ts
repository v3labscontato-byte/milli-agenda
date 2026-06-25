export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token || null
  }

  private getToken(): string | null {
    if (this.token) return this.token
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getTenantSlug(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('tenantSlug')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const tenantSlug = this.getTenantSlug()
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))

      // Auto-logout when a stored token is rejected — do not trigger on login failures
      if (res.status === 401 && typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant')
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        window.location.href = '/login'
        return undefined as unknown as T
      }

      throw new ApiError(res.status, body.message || 'Erro desconhecido')
    }

    const json = await res.json()
    // Unwrap { success: true, data: T } envelope from TransformInterceptor
    return (json && typeof json.success === 'boolean' ? json.data : json) as T
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' })
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
)
