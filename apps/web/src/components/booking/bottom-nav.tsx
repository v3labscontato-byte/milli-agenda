'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/booking', label: 'Início',       icon: Home          },
  { href: '/booking/agendar',             label: 'Agendar',      icon: Calendar      },
  { href: '/booking/meus-agendamentos',   label: 'Agendamentos', icon: ClipboardList },
  { href: '/booking/perfil',              label: 'Perfil',       icon: User          },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8F0] bg-white"
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
                isActive ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#475569]',
              )}
            >
              <Icon size={22} aria-hidden="true" />
              <span className={cn('text-[10px] font-medium', isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
