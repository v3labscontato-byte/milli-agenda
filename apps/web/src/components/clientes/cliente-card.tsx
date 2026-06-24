'use client'

import { cn } from '@/lib/utils'
import type { ClientTag } from '@/lib/clientes-mock'

// ─── Tag badge ────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<ClientTag, { bg: string; text: string; label: string }> = {
  VIP:        { bg: '#FFFBEB', text: '#B45309', label: 'VIP' },
  Novo:       { bg: '#EFF6FF', text: '#2563EB', label: 'Novo' },
  Inativo:    { bg: '#F1F5F9', text: '#64748B', label: 'Inativo' },
  Aniversário:{ bg: '#FDF2F8', text: '#9D174D', label: '🎂 Aniversário' },
  Fidelidade: { bg: '#F0FDF4', text: '#166534', label: 'Fidelidade' },
}

interface ClienteTagBadgeProps {
  tag: ClientTag
  className?: string
}

export function ClienteTagBadge({ tag, className }: ClienteTagBadgeProps) {
  const s = TAG_STYLES[tag]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        className,
      )}
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#4F46E5', '#9333EA', '#16A34A', '#CA8A04',
]

function nameToColor(name: string): string {
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

interface ClienteAvatarProps {
  name: string
  size?: number
}

export function ClienteAvatar({ name, size = 36 }: ClienteAvatarProps) {
  return (
    <span
      className="flex shrink-0 select-none items-center justify-center rounded-full text-[12px] font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: nameToColor(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
