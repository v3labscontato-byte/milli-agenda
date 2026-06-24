'use client'

import { useState } from 'react'
import { ChevronRight, User, Bell, Heart, FileText, LogOut, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLIENT, formatPrice } from '@/lib/booking-mock'

// CLIENT.avatarBg is always #7C3AED (purple-medium token)
function Avatar() {
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-medium text-[26px] font-bold text-white shadow-md"
      aria-label={`Avatar de ${CLIENT.name}`}
    >
      {CLIENT.initials}
    </div>
  )
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick?: () => void
}

function MenuItem({ icon, label, danger, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-4 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
        danger
          ? 'hover:border-danger-light hover:bg-danger-light'
          : 'hover:border-primary-light hover:bg-primary-xlight',
      )}
    >
      <span className={cn('shrink-0', danger ? 'text-danger-medium' : 'text-content-secondary')} aria-hidden="true">
        {icon}
      </span>
      <span className={cn('flex-1 text-left text-body font-medium', danger ? 'text-danger-medium' : 'text-content-primary')}>
        {label}
      </span>
      {!danger && <ChevronRight size={16} className="shrink-0 text-content-muted" aria-hidden="true" />}
    </button>
  )
}

export default function PerfilPage() {
  const [signedOut, setSignedOut] = useState(false)

  if (signedOut) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 text-[40px]" aria-hidden="true">👋</span>
        <h2 className="text-[18px] font-bold text-content-primary">Até a próxima!</h2>
        <p className="mt-1 text-body text-content-subtle">Você saiu da sua conta.</p>
        <button
          type="button"
          onClick={() => setSignedOut(false)}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Entrar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-6 pt-8">
        <div className="flex flex-col items-center text-center">
          <Avatar />
          <h1 className="mt-3 text-h2 font-bold text-content-primary">{CLIENT.name}</h1>
          <p className="mt-0.5 text-body text-content-subtle">{CLIENT.email}</p>
          <p className="text-body text-content-subtle">{CLIENT.phone}</p>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-6">
        {/* Stats */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4">
          <Trophy size={22} className="shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold text-content-primary">
              {CLIENT.visits} visitas · {formatPrice(CLIENT.totalSpent)} gastos
            </p>
            <p className="text-small text-content-subtle">Cliente desde {CLIENT.since}</p>
          </div>
        </div>

        {/* Menu */}
        <nav aria-label="Menu do perfil" className="space-y-2">
          <MenuItem icon={<User size={18} />}     label="Meus dados" />
          <MenuItem icon={<Bell size={18} />}     label="Notificações" />
          <MenuItem icon={<Heart size={18} />}    label="Profissional favorito" />
          <MenuItem icon={<FileText size={18} />} label="Políticas do salão" />
        </nav>

        <div className="pt-2">
          <MenuItem
            icon={<LogOut size={18} />}
            label="Sair da conta"
            danger
            onClick={() => setSignedOut(true)}
          />
        </div>

        <p className="pt-2 text-center text-caption text-content-disabled">
          Salão Bella Vista · Versão 1.0.0
        </p>
      </div>
    </div>
  )
}
