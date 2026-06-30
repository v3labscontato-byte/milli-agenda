'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isTodayUtil } from '@/lib/calendar-utils'
import { DatePickerPopover } from './date-picker-popover'

interface CalendarHeaderProps {
  selectedDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNew: () => void
  onDateSelect: (date: Date) => void
  searchQuery: string
  onSearchChange: (v: string) => void
}

export default function CalendarHeader({
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onNew,
  onDateSelect,
  searchQuery,
  onSearchChange,
}: CalendarHeaderProps) {
  const isViewingToday = isTodayUtil(selectedDate)
  const dateLabel = format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const dayLabel  = format(selectedDate, 'EEEE', { locale: ptBR })
  const dayCapit  = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)

  return (
    <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">

        {/* ── Date navigation ── */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Dia anterior"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              'text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            )}
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToday}
            disabled={isViewingToday}
            aria-label="Ir para hoje"
            className={cn(
              'rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              isViewingToday
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] cursor-default'
                : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
            )}
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Próximo dia"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              'text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
            )}
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>

        {/* ── Date picker trigger ── */}
        <DatePickerPopover value={selectedDate} onChange={onDateSelect}>
          <div className="flex flex-col leading-tight" aria-live="polite" aria-atomic="true">
            <span className="text-[13px] font-semibold text-[#0F172A]">{dateLabel}</span>
            <span className="text-[11px] text-[#94A3B8]">{dayCapit}</span>
          </div>
        </DatePickerPopover>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Search ── */}
        <div className="relative w-52">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar cliente ou serviço…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar cliente ou serviço"
            className={cn(
              'w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3',
              'text-[12px] text-[#0F172A] placeholder:text-[#94A3B8]',
              'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
              'transition-colors',
            )}
          />
        </div>

        {/* ── New appointment ── */}
        <button
          type="button"
          onClick={onNew}
          aria-label="Novo agendamento"
          className={cn(
            'flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5',
            'text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]',
            'shadow-[0_1px_3px_rgba(37,99,235,0.30)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
          )}
        >
          <Plus size={13} aria-hidden="true" />
          Novo Agendamento
        </button>

      </div>
    </div>
  )
}
