import { Bell, Plus } from 'lucide-react'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title = 'Dashboard' }: TopbarProps) {
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6"
      role="banner"
    >
      {/* Left: page title */}
      <h1 className="text-[15px] font-semibold text-[#0F172A]">{title}</h1>

      {/* Right: global actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          aria-label="Notificações (1 nova)"
          className={[
            'relative flex h-9 w-9 items-center justify-center rounded-md',
            'text-[#475569] transition-colors',
            'hover:bg-[#F1F5F9] hover:text-[#0F172A]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
          ].join(' ')}
        >
          <Bell size={18} aria-hidden="true" />
          {/* Notification dot — unread indicator */}
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444]"
            aria-hidden="true"
          />
        </button>

        {/* Visual divider */}
        <div className="h-5 w-px bg-[#E2E8F0]" aria-hidden="true" />

        {/* Primary CTA — single action on screen (DESIGN.md: ≤ 3 interactions) */}
        <button
          type="button"
          className={[
            'flex items-center gap-2 rounded-sm bg-[#2563EB] px-3 py-1.5',
            'text-[14px] font-medium text-white',
            'transition-colors hover:bg-[#1D4ED8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          ].join(' ')}
        >
          <Plus size={14} aria-hidden="true" />
          Novo Agendamento
        </button>

        {/* User avatar */}
        <div
          className={[
            'flex h-8 w-8 shrink-0 select-none items-center justify-center',
            'rounded-full bg-[#2563EB] text-[12px] font-semibold text-white',
          ].join(' ')}
          aria-label="Usuário: Admin"
          role="img"
        >
          A
        </div>
      </div>
    </header>
  )
}
