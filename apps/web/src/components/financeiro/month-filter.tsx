'use client'

import { cn } from '@/lib/utils'

export const MONTHS = [
  { key: 'jan-26', label: 'Jan/26' },
  { key: 'fev-26', label: 'Fev/26' },
  { key: 'mar-26', label: 'Mar/26' },
  { key: 'abr-26', label: 'Abr/26' },
  { key: 'mai-26', label: 'Mai/26' },
  { key: 'jun-26', label: 'Jun/26' },
] as const

export type MonthKey = (typeof MONTHS)[number]['key']
export const CURRENT_MONTH: MonthKey = 'jun-26'

interface MonthFilterProps {
  selected: string
  onChange: (month: string) => void
}

export default function MonthFilter({ selected, onChange }: MonthFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar mês">
      {MONTHS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={selected === key}
          className={cn(
            'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            selected === key
              ? 'border-[#2563EB] bg-[#2563EB] text-white'
              : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
