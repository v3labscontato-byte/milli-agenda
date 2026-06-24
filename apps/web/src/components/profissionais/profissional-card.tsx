'use client'

import type { ProfissionalRole, ProfissionalStatus } from '@/lib/profissionais-mock'

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS: [string, string][] = [
  ['#EFF6FF', '#1D4ED8'], ['#F3E8FF', '#6B21A8'], ['#F0FDF4', '#166534'],
  ['#FEF3C7', '#B45309'], ['#FEF2F2', '#991B1B'], ['#F0F9FF', '#075985'],
]

function colorForName(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

interface ProfissionalAvatarProps {
  name: string
  size?: number
  className?: string
}

export function ProfissionalAvatar({ name, size = 36, className = '' }: ProfissionalAvatarProps) {
  const [bg, text] = colorForName(name)
  const fontSize = Math.round(size * 0.36)
  return (
    <div
      className={`shrink-0 select-none items-center justify-center rounded-full font-semibold flex ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, color: text, fontSize }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<ProfissionalRole, { bg: string; text: string }> = {
  Cabeleireira:   { bg: '#EFF6FF', text: '#2563EB' },
  Cabeleireiro:   { bg: '#EFF6FF', text: '#2563EB' },
  Colorista:      { bg: '#F3E8FF', text: '#7C3AED' },
  Barbeiro:       { bg: '#F1F5F9', text: '#475569' },
  Manicure:       { bg: '#FDF2F8', text: '#9D174D' },
  'Nail Designer':{ bg: '#FDF2F8', text: '#BE185D' },
  Esteticista:    { bg: '#F0FDF4', text: '#166534' },
}

export function RoleBadge({ role }: { role: ProfissionalRole }) {
  const s = ROLE_STYLES[role]
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {role}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export const STATUS_STYLES: Record<ProfissionalStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: '#F0FDF4', text: '#166534', label: 'Ativo'    },
  vacation: { bg: '#FEF3C7', text: '#B45309', label: 'Férias'   },
  inactive: { bg: '#F1F5F9', text: '#64748B', label: 'Inativo'  },
}

export function StatusBadge({ status }: { status: ProfissionalStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}
