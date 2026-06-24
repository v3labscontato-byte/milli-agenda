'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { NOTIFICACOES, type BookingNotification } from '@/lib/booking-mock'

function NotifCard({ n, onRead }: { n: BookingNotification; onRead: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRead(n.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
        n.read
          ? 'border-border bg-white hover:bg-background'
          : 'border-primary-light bg-primary-xlight hover:bg-primary-light/40',
      )}
    >
      <span className="mt-0.5 shrink-0 text-[22px]" aria-hidden="true">{n.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-[13px] font-semibold', n.read ? 'text-content-primary' : 'text-primary')}>
            {n.title}
          </p>
          {!n.read && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Não lida" />
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-content-secondary">{n.body}</p>
        <p className="mt-1.5 text-[11px] text-content-subtle">{n.timeLabel}</p>
      </div>
    </button>
  )
}

interface NotificacoesListProps {
  maxItems?: number
}

export default function NotificacoesList({ maxItems }: NotificacoesListProps) {
  const [items, setItems] = useState<BookingNotification[]>(NOTIFICACOES)

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const groups = (['HOJE', 'ESTA SEMANA', 'MAIS ANTIGAS'] as const).map((g) => ({
    label: g,
    items: (maxItems ? items.slice(0, maxItems) : items).filter((n) => n.group === g),
  })).filter((g) => g.items.length > 0)

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <span className="mb-3 text-[40px]" aria-hidden="true">🔔</span>
        <p className="text-[15px] font-medium text-content-primary">Nenhuma notificação</p>
        <p className="mt-1 text-[13px] text-content-subtle">Você está em dia!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.label} aria-labelledby={`notif-group-${g.label}`}>
          <p
            id={`notif-group-${g.label}`}
            className="mb-2 text-[11px] font-bold tracking-wider text-content-subtle"
          >
            {g.label}
          </p>
          <div className="space-y-2">
            {g.items.map((n) => (
              <NotifCard key={n.id} n={n} onRead={markRead} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
