'use client'

import Link from 'next/link'
import { ChevronRight, Bell, FileText, LogOut, Package, Tag, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookingClient } from '@/hooks/use-booking-client'
import { usePublicTenant } from '@/hooks/use-public-tenant'

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
      ? 'hover:border-[#FEE2E2] hover:bg-[#FEE2E2]'
      : 'hover:border-primary-light hover:bg-primary-xlight',
  )
  const inner = (
    <>
      <span className={cn('shrink-0', danger ? 'text-[#DC2626]' : 'text-content-secondary')} aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className={cn('text-body font-medium', danger ? 'text-[#DC2626]' : 'text-content-primary')}>{label}</p>
        {sublabel && <p className="text-[11px] text-content-subtle">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="shrink-0 text-content-muted" aria-hidden="true" />}
    </>
  )
  if (href) return <Link href={href} className={cls}>{inner}</Link>
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PerfilPage() {
  const { client, clearClient } = useBookingClient()
  const { tenant } = usePublicTenant()

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 text-[40px]" aria-hidden="true">👤</span>
        <h2 className="text-[18px] font-bold text-content-primary">Minha conta</h2>
        <p className="mt-1 text-body text-content-subtle">
          Identifique-se para ver seus dados e agendamentos.
        </p>
        <Link
          href="/booking/meus-agendamentos"
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Identificar-me
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-xlight to-white px-5 pb-6 pt-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2563EB] text-[26px] font-bold text-white shadow-md"
            aria-label={`Avatar de ${client.name}`}
          >
            {initials(client.name)}
          </div>
          <h1 className="mt-3 text-h2 font-bold text-content-primary">{client.name}</h1>
          {client.email && <p className="mt-0.5 text-body text-content-subtle">{client.email}</p>}
          <p className="text-body text-content-subtle">{client.phone}</p>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-6">
        {/* Menu */}
        <nav aria-label="Menu do perfil" className="space-y-2">
          <MenuItem
            icon={<Calendar size={18} />}
            label="Meus Agendamentos"
            sublabel="Ver próximos e histórico"
            href="/booking/meus-agendamentos"
          />
          <MenuItem
            icon={<Package size={18} />}
            label="Meus Pacotes"
            href="/booking/pacotes"
          />
          <MenuItem
            icon={<Users size={18} />}
            label="Programa de Afiliados"
            href="/booking/afiliados"
          />
          <MenuItem
            icon={<Tag size={18} />}
            label="Cupons e Promoções"
            href="/booking/notificacoes"
          />
          <MenuItem icon={<Bell size={18} />}     label="Notificações"        href="/booking/notificacoes" />
          <MenuItem icon={<FileText size={18} />} label="Políticas do salão"  href="/booking/politicas" />
        </nav>

        <div className="pt-2">
          <MenuItem
            icon={<LogOut size={18} />}
            label="Sair"
            sublabel="Limpar identificação desta sessão"
            danger
            onClick={clearClient}
          />
        </div>

        <p className="pt-2 text-center text-caption text-content-disabled">
          {tenant?.name ?? 'Milli Agenda'} · Versão 1.0.0
        </p>
      </div>
    </div>
  )
}
