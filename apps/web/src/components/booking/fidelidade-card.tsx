'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CLIENT, getLoyaltyConfig, formatPrice, HISTORICO_PONTOS, type PontosHistorico } from '@/lib/booking-mock'

function PointsRow({ entry }: { entry: PontosHistorico }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[13px] font-medium text-content-primary">{entry.description}</p>
        <p className="text-[11px] text-content-subtle">{entry.date}</p>
      </div>
      <span className={cn('text-[13px] font-semibold tabular-nums', entry.type === 'earned' ? 'text-success-medium' : 'text-danger-medium')}>
        {entry.type === 'earned' ? '+' : ''}{entry.points} pts
      </span>
    </div>
  )
}

interface FidelidadeCardProps {
  compact?: boolean
}

export default function FidelidadeCard({ compact = false }: FidelidadeCardProps) {
  const [showHistory, setShowHistory] = useState(false)
  const pts = CLIENT.pontos
  const cfg = getLoyaltyConfig(pts)
  const progress = cfg.nextMin
    ? Math.min(100, Math.round(((pts - cfg.min) / (cfg.nextMin - cfg.min)) * 100))
    : 100

  if (compact) {
    return (
      <Link
        href="/booking/perfil"
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5',
          'transition-colors hover:border-primary-light hover:bg-primary-xlight',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
        )}
      >
        <span className="text-[22px]" aria-hidden="true">{cfg.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-content-primary">{pts.toLocaleString('pt-BR')} pontos</p>
          <p className="text-[11px] text-content-subtle">Nível {cfg.label} · {formatPrice(pts / 10)} em créditos</p>
        </div>
        <span className="text-[12px] font-medium text-primary">Ver →</span>
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-content-primary">🏆 Programa Fidelidade</h3>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', cfg.twColor,
          cfg.level === 'GOLD' ? 'bg-warning-light' :
          cfg.level === 'SILVER' ? 'bg-background-secondary' :
          cfg.level === 'DIAMOND' ? 'bg-primary-xlight' : 'bg-background-secondary'
        )}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Points balance */}
      <div className="mb-1">
        <span className="text-[28px] font-bold tabular-nums text-content-primary">
          {pts.toLocaleString('pt-BR')}
        </span>
        <span className="ml-1.5 text-[14px] font-medium text-content-subtle">pontos</span>
      </div>
      <p className="mb-4 text-[12px] text-content-subtle">
        = {formatPrice(pts / 10)} em créditos (100 pts = R$10)
      </p>

      {/* Progress to next level */}
      {cfg.nextLabel && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-content-subtle">
            <span>{cfg.label}</span>
            <span>{cfg.nextLabel}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                cfg.level === 'GOLD' ? 'bg-warning' :
                cfg.level === 'SILVER' ? 'bg-content-secondary' : 'bg-warning-medium'
              )}
              style={{ width: `${progress}%` }}
              aria-label={`${progress}% para ${cfg.nextLabel}`}
            />
          </div>
          <p className="mt-1 text-[11px] text-content-subtle">
            Faltam {(cfg.nextMin! - pts).toLocaleString('pt-BR')} pts para {cfg.nextLabel}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Resgatar pontos
        </button>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-content-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          aria-expanded={showHistory}
        >
          {showHistory ? 'Ocultar' : 'Ver histórico'}
        </button>
      </div>

      {/* History */}
      {showHistory && (
        <div className="animate-fade-in motion-reduce:animate-none border-t border-background-secondary pt-1">
          {HISTORICO_PONTOS.map((e, i) => (
            <div key={e.id} className={cn(i < HISTORICO_PONTOS.length - 1 && 'border-b border-background-secondary')}>
              <PointsRow entry={e} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
