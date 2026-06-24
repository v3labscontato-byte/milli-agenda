'use client'

import { useState } from 'react'
import { ChevronRight, User, Bell, Heart, FileText, LogOut, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLIENT, formatPrice } from '@/lib/booking-mock'

function Avatar() {
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full text-[26px] font-bold text-white shadow-md"
      style={{ backgroundColor: CLIENT.avatarBg }}
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
        'flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-4 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
        danger
          ? 'hover:border-[#FEE2E2] hover:bg-[#FFF5F5]'
          : 'hover:border-[#DBEAFE] hover:bg-[#EFF6FF]',
      )}
    >
      <span className={cn('shrink-0', danger ? 'text-[#DC2626]' : 'text-[#475569]')} aria-hidden="true">
        {icon}
      </span>
      <span className={cn('flex-1 text-left text-[14px] font-medium', danger ? 'text-[#DC2626]' : 'text-[#0F172A]')}>
        {label}
      </span>
      {!danger && <ChevronRight size={16} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />}
    </button>
  )
}

export default function PerfilPage() {
  const [signedOut, setSignedOut] = useState(false)

  if (signedOut) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 text-[40px]" aria-hidden="true">👋</span>
        <h2 className="text-[18px] font-bold text-[#0F172A]">Até a próxima!</h2>
        <p className="mt-1 text-[14px] text-[#64748B]">Você saiu da sua conta.</p>
        <button
          type="button"
          onClick={() => setSignedOut(false)}
          className="mt-6 rounded-xl bg-[#2563EB] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Entrar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#EFF6FF] to-white px-5 pb-6 pt-8">
        <div className="flex flex-col items-center text-center">
          <Avatar />
          <h1 className="mt-3 text-[20px] font-bold text-[#0F172A]">{CLIENT.name}</h1>
          <p className="mt-0.5 text-[14px] text-[#64748B]">{CLIENT.email}</p>
          <p className="text-[14px] text-[#64748B]">{CLIENT.phone}</p>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
          <Trophy size={22} className="shrink-0 text-[#F59E0B]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[#0F172A]">
              {CLIENT.visits} visitas · {formatPrice(CLIENT.totalSpent)} gastos
            </p>
            <p className="text-[12px] text-[#64748B]">Cliente desde {CLIENT.since}</p>
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

        <p className="pt-2 text-center text-[11px] text-[#CBD5E1]">
          Salão Bella Vista · Versão 1.0.0
        </p>
      </div>
    </div>
  )
}
