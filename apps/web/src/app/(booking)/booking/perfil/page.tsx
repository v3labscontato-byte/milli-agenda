'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, User, Bell, Heart, FileText, LogOut, Package, Tag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLIENT, CLIENT_PACOTES, formatPrice, getLoyaltyConfig } from '@/lib/booking-mock'

const loyaltyCfg = getLoyaltyConfig(CLIENT.pontos)

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
  sublabel?: string
  danger?: boolean
  href?: string
  onClick?: () => void
}

function MenuItem({ icon, label, sublabel, danger, href, onClick }: MenuItemProps) {
  const cls = cn(
    'flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-4 transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light',
    danger
      ? 'hover:border-danger-light hover:bg-danger-light'
      : 'hover:border-primary-light hover:bg-primary-xlight',
  )
  const inner = (
    <>
      <span className={cn('shrink-0', danger ? 'text-danger-medium' : 'text-content-secondary')} aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className={cn('text-body font-medium', danger ? 'text-danger-medium' : 'text-content-primary')}>{label}</p>
        {sublabel && <p className="text-[11px] text-content-subtle">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="shrink-0 text-content-muted" aria-hidden="true" />}
    </>
  )
  if (href) return <Link href={href} className={cls}>{inner}</Link>
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>
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
        {/* Loyalty summary */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4">
          <span className="text-[22px]" aria-hidden="true">{loyaltyCfg.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold text-content-primary">
              {CLIENT.pontos.toLocaleString('pt-BR')} pontos · {formatPrice(CLIENT.totalSpent)} gastos
            </p>
            <p className="text-small text-content-subtle">
              Nível {loyaltyCfg.label} · Cliente desde {CLIENT.since}
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav aria-label="Menu do perfil" className="space-y-2">
          <MenuItem
            icon={<span className="text-[16px]">🏆</span>}
            label="Fidelidade"
            sublabel={`${CLIENT.pontos.toLocaleString('pt-BR')} pts · ${loyaltyCfg.label}`}
            href="/booking/fidelidade"
          />
          <MenuItem
            icon={<Users size={18} />}
            label="Programa de Afiliados"
            sublabel={`${formatPrice(CLIENT.creditoAfiliado)} em créditos`}
            href="/booking/afiliados"
          />
          <MenuItem
            icon={<Package size={18} />}
            label="Meus Pacotes"
            sublabel={`${CLIENT.pacotesAtivos} pacotes ativos`}
            href="/booking/pacotes"
          />
          <MenuItem
            icon={<Tag size={18} />}
            label="Cupons e Promoções"
            sublabel="Ver cupons disponíveis"
            href="/booking/notificacoes"
          />
          <MenuItem icon={<Bell size={18} />}     label="Notificações"         href="/booking/notificacoes" />
          <MenuItem icon={<User size={18} />}     label="Meus dados"         href="/booking/meus-dados" />
          <MenuItem icon={<FileText size={18} />} label="Políticas do salão"  href="/booking/politicas" />
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
