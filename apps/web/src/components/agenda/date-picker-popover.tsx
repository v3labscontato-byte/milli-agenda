'use client'

import { useState, useRef, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isToday, addMonths, subMonths, format, startOfWeek, endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface DatePickerPopoverProps {
  value: Date
  onChange: (date: Date) => void
  children: React.ReactNode
}

export function DatePickerPopover({ value, onChange, children }: DatePickerPopoverProps) {
  const [open, setOpen]           = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date(value))
  const containerRef              = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    function onMouse(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Sync view month when popover opens
  useEffect(() => {
    if (open) setViewMonth(new Date(value))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd     = endOfWeek(monthEnd,   { weekStartsOn: 0 })
  const days       = eachDayOfInterval({ start: calStart, end: calEnd })

  const monthLabel = format(viewMonth, 'MMMM yyyy', { locale: ptBR })
  const monthCapitalised = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  function handleSelect(date: Date) {
    onChange(date)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Selecionar data"
        className={cn(
          'flex items-center gap-1.5 rounded-md px-1.5 py-1',
          'transition-colors hover:bg-[#F1F5F9]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
          open && 'bg-[#F1F5F9]',
        )}
      >
        {children}
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Calendário — selecionar data"
          className={cn(
            'absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2',
            'w-[272px] rounded-xl border border-[#E2E8F0] bg-white p-4',
            'shadow-[0_8px_24px_0_rgb(0_0_0/0.10)]',
          )}
        >
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              aria-label="Mês anterior"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <span className="text-[13px] font-semibold text-[#0F172A]">
              {monthCapitalised}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              aria-label="Próximo mês"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="py-1 text-center text-[11px] font-medium text-[#94A3B8]">
                {d}
              </div>
            ))}
          </div>

          {/* Day buttons */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const isSelected     = isSameDay(day, value)
              const isCurrentDay   = isToday(day)
              const isCurrentMonth = day.getMonth() === viewMonth.getMonth()
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  aria-label={format(day, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  aria-pressed={isSelected}
                  className={cn(
                    'mx-auto flex h-9 w-9 items-center justify-center rounded-full',
                    'text-[13px] transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    isSelected
                      ? 'bg-[#2563EB] font-semibold text-white'
                      : isCurrentDay
                      ? 'bg-[#EFF6FF] font-semibold text-[#2563EB]'
                      : isCurrentMonth
                      ? 'text-[#0F172A] hover:bg-[#F1F5F9]'
                      : 'text-[#CBD5E1] hover:bg-[#F8FAFC]',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Hoje shortcut */}
          <div className="mt-3 border-t border-[#F1F5F9] pt-3">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className={cn(
                'w-full rounded-md py-1.5 text-center text-[12px] font-medium text-[#2563EB]',
                'transition-colors hover:bg-[#EFF6FF]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              )}
            >
              Ir para hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
