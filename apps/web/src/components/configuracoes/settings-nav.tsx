'use client'

import { cn } from '@/lib/utils'
import {
  Store,
  Clock,
  Bell,
  CreditCard,
  Globe,
  Zap,
  Code2,
  Shield,
  Percent,
  Award,
  Tag,
  Users,
  Smartphone,
} from 'lucide-react'

export type TabId =
  | 'meu-salao'
  | 'horarios'
  | 'notificacoes'
  | 'pagamentos'
  | 'site-booking'
  | 'app-cliente'
  | 'tipos-profissionais'
  | 'categorias-servicos'
  | 'plano'
  | 'api'
  | 'lgpd'
  | 'afiliados'
  | 'fidelidade'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
}

const TABS: Tab[] = [
  { id: 'meu-salao',    label: 'Meu Salão',    icon: Store      },
  { id: 'horarios',     label: 'Horários',      icon: Clock      },
  { id: 'notificacoes', label: 'Notificações',  icon: Bell       },
  { id: 'pagamentos',   label: 'Pagamentos',    icon: CreditCard },
  { id: 'site-booking',        label: 'Site Booking',    icon: Globe       },
  { id: 'app-cliente',         label: 'App do Cliente',  icon: Smartphone  },
  { id: 'tipos-profissionais', label: 'Tipos de Prof.',  icon: Users       },
  { id: 'categorias-servicos', label: 'Categorias Serv.', icon: Tag   },
  { id: 'plano',        label: 'Plano',         icon: Zap        },
  { id: 'api',          label: 'API & Integr.', icon: Code2      },
  { id: 'lgpd',         label: 'LGPD',          icon: Shield     },
  { id: 'afiliados',    label: 'Afiliados',     icon: Percent    },
  { id: 'fidelidade',   label: 'Fidelidade',    icon: Award      },
]

interface SettingsNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export default function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <nav
      className="flex h-full w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[#E2E8F0] bg-white py-4"
      aria-label="Seções de configuração"
    >
      <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
        Configurações
      </p>
      <ul className="space-y-0.5 px-2" role="list">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md py-2 pl-[10px] pr-3',
                  'border-l-2',
                  'text-[13px] transition-colors duration-150 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  isActive
                    ? 'border-l-[#2563EB] bg-[#EFF6FF] font-medium text-[#2563EB]'
                    : 'border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                )}
              >
                <Icon size={14} aria-hidden="true" className="shrink-0" />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
