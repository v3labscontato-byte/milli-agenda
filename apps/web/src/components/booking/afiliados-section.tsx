'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CLIENT, formatPrice } from '@/lib/booking-mock'

interface AfiliadosSectionProps {
  compact?: boolean
}

export default function AfiliadosSection({ compact = false }: AfiliadosSectionProps) {
  const [copied, setCopied] = useState(false)
  const refLink = `milliagenda.com/bella?ref=${CLIENT.refCode}`

  function copyLink() {
    navigator.clipboard.writeText(refLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <Link
        href="/booking/afiliados"
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5',
          'transition-colors hover:border-primary-light hover:bg-primary-xlight',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
        )}
      >
        <span className="text-[22px]" aria-hidden="true">💰</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-content-primary">
            {formatPrice(CLIENT.creditoAfiliado)} em créditos de afiliado
          </p>
          <p className="text-[11px] text-content-subtle">3 amigos indicados · clique para ver</p>
        </div>
        <span className="text-[12px] font-medium text-primary">Ver →</span>
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-1 text-[15px] font-semibold text-content-primary">💰 Ganhe indicando o salão!</h3>
      <p className="mb-4 text-[12px] text-content-subtle">Compartilhe seu link e ganhe 5% em créditos a cada atendimento concluído</p>

      {/* Referral link box */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-content-secondary">{refLink}</p>
        <button
          type="button"
          onClick={copyLink}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
            copied ? 'bg-success-xlight text-success-medium' : 'bg-primary text-white hover:bg-primary-dark',
          )}
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { value: formatPrice(CLIENT.creditoAfiliado), label: 'em créditos' },
          { value: '3',  label: 'indicados' },
          { value: '3',  label: 'concluídos' },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl bg-background px-2 py-3 text-center">
            <p className="text-[16px] font-bold text-content-primary">{value}</p>
            <p className="text-[10px] text-content-subtle">{label}</p>
          </div>
        ))}
      </div>

      <Link
        href="/booking/afiliados"
        className="block w-full rounded-xl border border-primary py-2.5 text-center text-[13px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
      >
        Ver histórico completo →
      </Link>
    </div>
  )
}
