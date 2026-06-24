'use client'

import type { ServicoCategory, ServicoStatus } from '@/lib/servicos-mock'

// ─── Category badge ───────────────────────────────────────────────────────────

export const CATEGORY_STYLES: Record<ServicoCategory, { bg: string; text: string; dot: string }> = {
  Cabelo:      { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  Barba:       { bg: '#F1F5F9', text: '#475569', dot: '#64748B' },
  Unhas:       { bg: '#FDF2F8', text: '#9D174D', dot: '#BE185D' },
  Estética:    { bg: '#F0FDF4', text: '#166534', dot: '#16A34A' },
  Sobrancelha: { bg: '#FEF3C7', text: '#B45309', dot: '#D97706' },
}

export function CategoryBadge({ category }: { category: ServicoCategory }) {
  const s = CATEGORY_STYLES[category]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} aria-hidden="true" />
      {category}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ServicoStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: '#F0FDF4', text: '#166534', label: 'Ativo'   },
  inactive: { bg: '#F1F5F9', text: '#64748B', label: 'Inativo' },
}

export function ServicoStatusBadge({ status }: { status: ServicoStatus }) {
  const s = STATUS_CFG[status]
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

// ─── Duration chip ────────────────────────────────────────────────────────────

export function DurationChip({ minutes }: { minutes: number }) {
  const label = minutes < 60
    ? `${minutes} min`
    : minutes % 60 === 0
      ? `${Math.floor(minutes / 60)}h`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  return (
    <span className="inline-flex rounded-md border border-[#E2E8F0] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
      {label}
    </span>
  )
}
