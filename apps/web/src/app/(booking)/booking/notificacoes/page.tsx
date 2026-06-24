'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificacoesList from '@/components/booking/notificacoes-list'

type NotifKey = 'reminder24h' | 'reminder2h' | 'confirm' | 'promo' | 'points' | 'affiliate'

const NOTIF_SETTINGS: Array<{ key: NotifKey; label: string; default: boolean }> = [
  { key: 'reminder24h', label: 'Lembrete 24h antes',              default: true  },
  { key: 'reminder2h',  label: 'Lembrete 2h antes',               default: true  },
  { key: 'confirm',     label: 'Confirmação de agendamento',       default: true  },
  { key: 'promo',       label: 'Promoções e cupons',               default: false },
  { key: 'points',      label: 'Pontos e fidelidade',              default: true  },
  { key: 'affiliate',   label: 'Programa de afiliados',            default: true  },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
        on ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          on ? 'translate-x-5' : 'translate-x-0.5',
        )}
        aria-hidden="true"
      />
    </button>
  )
}

export default function NotificacoesPage() {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Record<NotifKey, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.key, s.default])) as Record<NotifKey, boolean>
  )

  function toggle(key: NotifKey) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-background-secondary px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-lg py-2 pr-2 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="font-medium">Notificações</span>
        </button>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Configurações de notificações"
          aria-expanded={showSettings}
          className="flex h-10 w-10 items-center justify-center rounded-full text-content-subtle transition-colors hover:bg-background hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 py-5">
        {/* Settings panel */}
        {showSettings && (
          <div className="animate-fade-in motion-reduce:animate-none mb-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-content-primary">Configurações</h2>
            <div className="space-y-3">
              {NOTIF_SETTINGS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-content-primary">{s.label}</span>
                  <Toggle on={settings[s.key]} onToggle={() => toggle(s.key)} />
                </div>
              ))}
            </div>
          </div>
        )}

        <NotificacoesList />
      </div>
    </div>
  )
}
