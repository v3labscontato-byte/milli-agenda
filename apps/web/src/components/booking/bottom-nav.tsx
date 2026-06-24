'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/booking',                        label: 'Início',       icon: Home          },
  { href: '/booking/agendar',                label: 'Agendar',      icon: Calendar      },
  { href: '/booking/meus-agendamentos',      label: 'Agendamentos', icon: ClipboardList },
  { href: '/booking/perfil',                 label: 'Perfil',       icon: User          },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/booking'
            ? pathname === '/booking' || pathname === '/booking/'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-[56px] min-w-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-content-subtle hover:text-content-secondary',
              )}
            >
              <Icon size={22} aria-hidden="true" />
              <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-content-subtle')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
