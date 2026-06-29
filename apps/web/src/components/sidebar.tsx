'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Users,
  Scissors,
  ListChecks,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'      },
  { href: '/agenda',          icon: Calendar,        label: 'Agenda'         },
  { href: '/comandas',        icon: Receipt,         label: 'Comandas'       },
  { href: '/clientes',        icon: Users,           label: 'Clientes'       },
  { href: '/profissionais',   icon: Scissors,        label: 'Profissionais'  },
  { href: '/servicos',        icon: ListChecks,      label: 'Serviços'       },
  { href: '/financeiro',      icon: BarChart2,       label: 'Financeiro'     },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
]

interface NavLinkProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}

function NavLink({ item, isActive, collapsed }: NavLinkProps) {
  const { icon: Icon, label, href } = item
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2',
        'text-body transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-sidebar)]',
        // Full-width bg block for active — never border-left stripe (DESIGN.md rule)
        isActive
          ? 'bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-text-active)] font-medium'
          : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]',
      )}
    >
      <Icon size={16} className="shrink-0" aria-hidden="true" />
      {collapsed
        ? <span className="sr-only">{label}</span>
        : <span className="truncate">{label}</span>
      }
    </Link>
  )
}

export default function Sidebar() {
  const pathname  = usePathname()
  const { logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col bg-[var(--color-sidebar)]',
        'border-r border-[var(--color-sidebar-border)]',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Navegação principal"
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-[var(--color-sidebar-border)]',
          collapsed ? 'flex-col justify-center gap-1 px-2 py-2' : 'justify-between px-3',
        )}
      >
        {collapsed ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-icon.svg" alt="Milii" className="h-7 w-7 shrink-0 object-contain" />
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Expandir menu"
              aria-expanded={false}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md',
                'text-[var(--color-sidebar-text)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]',
              )}
            >
              <ChevronLeft size={12} className="rotate-180" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-name.svg" alt="Milii Agenda" className="h-9 w-auto shrink-0 object-contain" />
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Recolher menu"
              aria-expanded={true}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                'text-[var(--color-sidebar-text)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]',
              )}
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2" role="navigation">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <NavLink item={item} isActive={isActive} collapsed={collapsed} />
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom: settings + logout + user */}
      <div className="shrink-0 border-t border-[var(--color-sidebar-border)] px-2 py-3">
        <ul className="space-y-0.5" role="list">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                isActive={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              aria-label="Sair"
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2',
                'text-body text-[var(--color-sidebar-text)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]',
              )}
            >
              <LogOut size={16} className="shrink-0" aria-hidden="true" />
              {collapsed
                ? <span className="sr-only">Sair</span>
                : <span className="truncate">Sair</span>
              }
            </button>
          </li>
        </ul>

        {/* User identity — visible only when expanded */}
        {!collapsed && user && (
          <div className="mt-2 border-t border-[var(--color-sidebar-border)] px-3 pt-3">
            <p className="truncate text-small font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-[var(--color-sidebar-text)]">{user.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
