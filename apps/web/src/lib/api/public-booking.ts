const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'studio-homolog'

export interface PublicService {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: string | number
  categoryId: string | null
  category: { id: string; name: string } | null
}

export interface PublicProfessional {
  id: string
  name: string
  specialty: string | null
  avatarUrl: string | null
  workDays: number[]
}

export interface PublicSlot {
  startAt: string
  endAt: string
}

export interface PublicAppointmentResult {
  id: string
  startAt: string
  endAt: string
  status: string
  client: { id: string; name: string }
  service: { id: string; name: string; durationMin: number }
  professional: { id: string; name: string }
}

export interface CreatePublicAppointmentBody {
  name: string
  phone: string
  email?: string
  serviceId: string
  professionalId: string
  date: string
  time: string
  notes?: string
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = (await res.json()) as { success?: boolean; data?: T }
  if (!res.ok) {
    const msg = (json as unknown as { message?: string })?.message ?? `HTTP ${res.status}`
    throw new Error(msg)
  }
  return (json.success === true && json.data !== undefined ? json.data : json) as T
}

export function fetchPublicServices(slug: string, categoryId?: string): Promise<PublicService[]> {
  const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/services${qs}`)
}

export function fetchPublicProfessionals(slug: string, serviceId?: string): Promise<PublicProfessional[]> {
  const qs = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : ''
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/professionals${qs}`)
}

export function fetchPublicSlots(
  slug: string,
  professionalId: string,
  date: string,
  durationMin: number,
): Promise<PublicSlot[]> {
  const qs = `?date=${date}&durationMin=${durationMin}`
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/professionals/${professionalId}/slots${qs}`)
}

export function createPublicAppointment(
  slug: string,
  body: CreatePublicAppointmentBody,
): Promise<PublicAppointmentResult> {
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export interface PublicClientInfo {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export interface PublicAppointmentItem {
  id: string
  status: string
  startAt: string
  endAt: string
  notes: string | null
  service: { name: string; durationMin: number; price: string | number }
  professional: { name: string; avatarUrl: string | null; specialty: string | null }
}

export interface PublicClientAppointments {
  client: PublicClientInfo | null
  appointments: PublicAppointmentItem[]
}

export function fetchPublicClientAppointments(
  slug: string,
  phone: string,
): Promise<PublicClientAppointments> {
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/appointments?phone=${encodeURIComponent(phone)}`)
}

export function fetchPublicAppointmentById(
  slug: string,
  id: string,
): Promise<PublicAppointmentItem> {
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/appointments/${id}`)
}

export function cancelPublicAppointment(
  slug: string,
  id: string,
  phone: string,
): Promise<{ id: string; status: string }> {
  return apiFetch(`${API_BASE}/api/v1/public/${slug}/appointments/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })
}

export function slotToTimeStr(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}
