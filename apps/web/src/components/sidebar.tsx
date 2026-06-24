'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
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

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'      },
  { href: '/agenda',          icon: Calendar,        label: 'Agenda'         },
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
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2',
        'text-body transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0F172A]',
        // Full-width bg block for active — never border-left stripe (DESIGN.md rule)
        isActive
          ? 'bg-[#2563EB] text-white font-medium'
          : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]',
      )}
    >
      <Icon size={16} className="shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      // bg-sidebar = #0F172A from tailwind config
      className={cn(
        'flex h-full shrink-0 flex-col bg-[#0F172A]',
        'border-r border-[#1E293B]',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Navegação principal"
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-[#1E293B] px-3',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <span className="select-none text-[16px] font-semibold tracking-tight text-white">
            Milli
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md',
            'text-[#64748B] transition-colors hover:bg-[#1E293B] hover:text-[#94A3B8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
          )}
        >
          <ChevronLeft
            size={15}
            className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
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
      <div className="shrink-0 border-t border-[#1E293B] px-2 py-3">
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
              onClick={() => { /* auth.signOut() */ }}
              title={collapsed ? 'Sair' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2',
                'text-body text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#CBD5E1]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              )}
            >
              <LogOut size={16} className="shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">Sair</span>}
            </button>
          </li>
        </ul>

        {/* User identity — visible only when expanded */}
        {!collapsed && (
          <div className="mt-2 border-t border-[#1E293B] px-3 pt-3">
            <p className="truncate text-small font-semibold text-white">Admin</p>
            <p className="truncate text-[11px] text-[#64748B]">admin@milli.com.br</p>
          </div>
        )}
      </div>
    </aside>
  )
}
