'use client'

import { useState } from 'react'
import { Star, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookingAppointment } from '@/lib/booking-mock'

const TAGS = ['Pontualidade', 'Atendimento', 'Resultado', 'Ambiente']

interface AvaliacaoModalProps {
  appt: BookingAppointment
  onClose: () => void
  onSubmit: (apptId: string, rating: number) => void
}

export default function AvaliacaoModal({ appt, onClose, onSubmit }: AvaliacaoModalProps) {
  const [rating,   setRating]   = useState(0)
  const [hovered,  setHovered]  = useState(0)
  const [tags,     setTags]     = useState<Set<string>>(new Set())
  const [comment,  setComment]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  function toggleTag(t: string) {
    setTags((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  async function handleSubmit() {
    if (rating === 0) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setDone(true)
    await new Promise((r) => setTimeout(r, 1800))
    onSubmit(appt.id, rating)
  }

  const display = hovered || rating

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-content-primary/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Avaliar atendimento"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Sheet */}
      <div className="animate-fade-in motion-reduce:animate-none w-full max-w-md rounded-t-3xl bg-white px-6 pb-10 pt-5 shadow-modal">
        {done ? (
          /* Success state */
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-success-xlight motion-reduce:animate-none">
              <CheckCircle2 size={36} className="text-success-medium" aria-hidden="true" />
            </div>
            <h2 className="text-[18px] font-bold text-content-primary">Obrigada pela avaliação!</h2>
            <p className="mt-2 text-body text-content-subtle">
              +50 pontos creditados na sua conta 🏆
            </p>
          </div>
        ) : (
          <>
            {/* Handle bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />

            {/* Close */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-content-primary">Como foi seu atendimento? ✨</h2>
                <p className="mt-0.5 text-[13px] text-content-secondary">
                  {appt.serviceEmoji} {appt.service} com {appt.professional}
                </p>
                <p className="text-[12px] text-content-subtle">{appt.dateLabel}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar avaliação"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-content-subtle transition-colors hover:bg-background hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Star rating */}
            <div className="mb-5">
              <p className="mb-2 text-[13px] font-medium text-content-secondary">Sua avaliação geral</p>
              <div
                className="flex gap-2"
                role="group"
                aria-label="Nota de 1 a 5 estrelas"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                    aria-pressed={rating === n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    className="transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                  >
                    <Star
                      size={36}
                      className={cn('transition-colors', n <= display ? 'fill-warning text-warning' : 'fill-background-secondary text-border')}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tag chips */}
            <div className="mb-5">
              <p className="mb-2 text-[13px] font-medium text-content-secondary">O que você achou?</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tags.has(t)}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
                      tags.has(t)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-content-secondary hover:border-primary hover:text-primary',
                    )}
                  >
                    {tags.has(t) ? '✓ ' : ''}{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="avaliacao-comment" className="mb-1 block text-[13px] font-medium text-content-secondary">
                Deixe um comentário <span className="font-normal text-content-subtle">(opcional)</span>
              </label>
              <textarea
                id="avaliacao-comment"
                rows={3}
                placeholder="Conte como foi sua experiência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-body text-content-primary placeholder:text-content-subtle focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={rating === 0 || loading}
              onClick={handleSubmit}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3.5',
                'text-[15px] font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
                rating > 0 && !loading
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'cursor-not-allowed bg-background-secondary text-content-muted',
              )}
            >
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                : '🏆'}
              {loading ? 'Enviando...' : 'Enviar avaliação +50 pts'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
