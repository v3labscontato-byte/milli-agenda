import { Bell, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title = 'Dashboard' }: TopbarProps) {
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6"
      role="banner"
    >
      <h1 className="text-[15px] font-semibold text-[var(--color-content-primary)]">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificações"
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-md',
            'text-[var(--color-content-secondary)] transition-colors',
            'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-content-primary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]',
          )}
        >
          <Bell size={18} aria-hidden="true" />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-danger)]"
            aria-label="1 notificação nova"
          />
        </button>

        <div className="h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />

        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-sm bg-[var(--color-primary)] px-3 py-1.5',
            'text-[14px] font-medium text-white',
            'transition-colors hover:bg-[var(--color-primary-dark)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)] focus-visible:ring-offset-1',
          )}
        >
          <Plus size={14} aria-hidden="true" />
          Novo Agendamento
        </button>

        <div
          className={cn(
            'flex h-8 w-8 shrink-0 select-none items-center justify-center',
            'rounded-full bg-[var(--color-primary)] text-[12px] font-semibold text-white',
          )}
          aria-label="Usuário: Admin"
          role="img"
        >
          A
        </div>
      </div>
    </header>
  )
}
