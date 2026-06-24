'use client'

import { ChevronLeft, ChevronRight, Search, Plus, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDayLong, isTodayUtil } from '@/lib/calendar-utils'

interface CalendarHeaderProps {
  selectedDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNew: () => void
  searchQuery: string
  onSearchChange: (v: string) => void
}

export default function CalendarHeader({
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onNew,
  searchQuery,
  onSearchChange,
}: CalendarHeaderProps) {
  const isViewingToday = isTodayUtil(selectedDate)
  const dayLabel = formatDayLong(selectedDate)
  const capitalised = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)

  return (
    <div className="border-b border-[#E2E8F0] bg-white px-6 py-4 space-y-3">
      {/* Row 1: title + navigation + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Day navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Dia anterior"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            )}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <CalendarDays size={14} className="text-[#94A3B8]" aria-hidden="true" />
            <span
              className="min-w-[220px] text-center text-[13px] font-medium text-[#0F172A]"
              aria-live="polite"
              aria-atomic="true"
            >
              {capitalised}
            </span>
          </div>

          <button
            type="button"
            onClick={onNext}
            aria-label="Próximo dia"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            )}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Today button */}
        <button
          type="button"
          onClick={onToday}
          disabled={isViewingToday}
          aria-label="Ir para hoje"
          className={cn(
            'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            isViewingToday
              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] cursor-default'
              : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
          )}
        >
          Hoje
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* New appointment */}
        <button
          type="button"
          onClick={onNew}
          aria-label="Novo agendamento"
          className={cn(
            'flex items-center gap-2 rounded-md bg-[#2563EB] px-3 py-1.5',
            'text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          )}
        >
          <Plus size={14} aria-hidden="true" />
          Novo
        </button>
      </div>

      {/* Row 2: search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Buscar cliente ou serviço…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar cliente ou serviço"
          className={cn(
            'w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3',
            'text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]',
            'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
          )}
        />
      </div>
    </div>
  )
}
