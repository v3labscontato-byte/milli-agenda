'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ClipboardList, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/booking',                   label: 'Início',       icon: Home          },
  { href: '/booking/agendar',           label: 'Agendar',      icon: Calendar      },
  { href: '/booking/meus-agendamentos', label: 'Agendamentos', icon: ClipboardList },
  { href: '/booking/perfil',            label: 'Perfil',       icon: User          },
]

interface BottomNavProps {
  primaryColor?: string
}

export default function BottomNav({ primaryColor = '#81736f' }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="w-full shrink-0 bg-white"
      style={{
        borderTop: '1px solid #eaebec',
        boxShadow: '0px 2px 48px rgba(0,0,0,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex h-[70px] items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/booking'
            ? pathname === '/booking' || pathname === '/booking/'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors"
              style={{ color: isActive ? primaryColor : '#9c9899' }}
            >
              <Icon size={22} aria-hidden="true" />
              <span className="text-[10px] font-medium" style={{ letterSpacing: '0.5px' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
