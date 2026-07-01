'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, TrendingUp } from 'lucide-react'
import { CLIENT, HISTORICO_PONTOS, getLoyaltyConfig, formatPrice, type PontosHistorico } from '@/lib/booking-mock'

const cfg = getLoyaltyConfig(CLIENT.pontos)

const LEVELS = [
  { label: 'BRONZE',  emoji: '🥉', min: 0,    color: '#CD7F32' },
  { label: 'SILVER',  emoji: '🥈', min: 500,  color: '#94A3B8' },
  { label: 'GOLD',    emoji: '🥇', min: 1000, color: '#F59E0B' },
  { label: 'DIAMOND', emoji: '💎', min: 2500, color: '#7C3AED' },
]

function HistoricoRow({ item }: { item: PontosHistorico }) {
  const earned = item.type === 'earned'
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: earned ? '#DCFCE7' : '#FEE2E2' }}
        aria-hidden="true"
      >
        <span className="text-[14px]">{earned ? '⬆️' : '⬇️'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-content-primary">{item.description}</p>
        <p className="text-[11px] text-content-subtle">{item.date}</p>
      </div>
      <span
        className="text-[13px] font-semibold tabular-nums"
        style={{ color: earned ? '#16A34A' : '#DC2626' }}
      >
        {earned ? '+' : ''}{item.points.toLocaleString('pt-BR')} pts
      </span>
    </div>
  )
}

export default function FidelidadePage() {
  const router = useRouter()

  const progressPct = cfg.nextMin != null
    ? Math.min(100, Math.round(((CLIENT.pontos - cfg.min) / (cfg.nextMin - cfg.min)) * 100))
    : 100

  const pointsToNext = cfg.nextMin != null ? cfg.nextMin - CLIENT.pontos : 0

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-[16px] font-semibold text-content-primary">Fidelidade</h1>
      </div>

      {/* Saldo + nível */}
      <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-5 pt-5">
        <div className="flex flex-col items-center text-center">
          <span className="text-[40px]" aria-hidden="true">{cfg.emoji}</span>
          <p className="mt-1 text-[28px] font-bold tabular-nums text-content-primary">
            {CLIENT.pontos.toLocaleString('pt-BR')} pts
          </p>
          <p className="text-[14px] font-semibold text-content-secondary">Nível {cfg.label}</p>

          {cfg.nextMin != null && cfg.nextLabel != null && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-[11px] text-content-subtle mb-1">
                <span>{CLIENT.pontos.toLocaleString('pt-BR')} pts</span>
                <span>{cfg.nextMin.toLocaleString('pt-BR')} pts — {cfg.nextLabel}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${progressPct}% para ${cfg.nextLabel}`}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-content-subtle">
                Faltam {pointsToNext.toLocaleString('pt-BR')} pts para {cfg.nextLabel}
              </p>
            </div>
          )}
          {cfg.nextMin == null && (
            <p className="mt-2 text-[12px] text-content-subtle">Você está no nível máximo! 🎉</p>
          )}
        </div>
      </div>

      <div className="space-y-5 px-5 pt-2">
        {/* Resgate */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-content-primary">Resgatar pontos</p>
              <p className="mt-0.5 text-[12px] text-content-subtle">
                Seus pontos valem {formatPrice(CLIENT.pontos * 0.10)} em crédito
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-xl bg-[#F1F5F9] px-4 py-2 text-[13px] font-semibold text-content-muted"
            >
              Em breve
            </button>
          </div>
        </div>

        {/* Níveis */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" aria-hidden="true" />
            <h2 className="text-[14px] font-semibold text-content-primary">Critérios de progressão</h2>
          </div>
          <div className="space-y-2">
            {LEVELS.map((lvl) => {
              const active = cfg.label === lvl.label
              return (
                <div
                  key={lvl.label}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: active ? lvl.color : '#E2E8F0',
                    backgroundColor: active ? `${lvl.color}18` : '#fff',
                  }}
                >
                  <span className="text-[18px]" aria-hidden="true">{lvl.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: active ? lvl.color : '#0F172A' }}>
                      {lvl.label} {active && '← você está aqui'}
                    </p>
                    <p className="text-[11px] text-content-subtle">
                      A partir de {lvl.min.toLocaleString('pt-BR')} pts
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Histórico */}
        <div>
          <h2 className="mb-1 text-[14px] font-semibold text-content-primary">Histórico de pontos</h2>
          <div className="divide-y divide-[#F1F5F9] rounded-2xl border border-[#E2E8F0] bg-white px-4">
            {HISTORICO_PONTOS.map((item) => (
              <HistoricoRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
