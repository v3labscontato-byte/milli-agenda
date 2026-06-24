'use client'

import { useState, useCallback } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id?: string
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full',
        'transition-colors duration-150 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-2',
        checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm',
          'transition-transform duration-150 motion-reduce:transition-none',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
        aria-hidden="true"
      />
    </button>
  )
}

// ─── SaveButton ───────────────────────────────────────────────────────────────

interface SaveButtonProps {
  state: SaveState
  onClick: () => void
  label?: string
}

export function SaveButton({ state, onClick, label = 'Salvar alterações' }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'saving'}
      aria-busy={state === 'saving'}
      className={cn(
        'flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium',
        'transition-colors duration-150 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] focus-visible:ring-offset-1',
        state === 'saved'
          ? 'bg-[#10B981] text-white'
          : state === 'error'
          ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
          : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
        state === 'saving' && 'cursor-not-allowed opacity-70',
      )}
    >
      {state === 'saving' && (
        <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      )}
      {state === 'saved' && <Check size={13} aria-hidden="true" />}
      {state === 'saving' ? 'Salvando…' : state === 'saved' ? 'Salvo!' : state === 'error' ? 'Erro ao salvar' : label}
    </button>
  )
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

interface FieldLabelProps {
  htmlFor: string
  children: React.ReactNode
}

export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-medium text-[#475569]">
      {children}
    </label>
  )
}

// ─── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
}

export function TextInput({
  id, value, onChange, placeholder, type = 'text', disabled = false, className,
}: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
        'placeholder:text-[#94A3B8]',
        'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]',
        className,
      )}
    />
  )
}

// ─── SelectInput ──────────────────────────────────────────────────────────────

interface SelectInputProps {
  id: string
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function SelectInput({ id, value, onChange, children, className, disabled, 'aria-label': ariaLabel }: SelectInputProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A]',
        'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:bg-[#F1F5F9]',
        className,
      )}
    >
      {children}
    </select>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]',
        className,
      )}
    >
      {title && (
        <p className="mb-4 text-[14px] font-semibold text-[#0F172A]">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── useSaveState ─────────────────────────────────────────────────────────────

export function useSaveState(): [SaveState, () => Promise<void>] {
  const [state, setState] = useState<SaveState>('idle')

  const trigger = useCallback(async () => {
    setState('saving')
    await new Promise<void>((r) => setTimeout(r, 800))
    setState('saved')
    setTimeout(() => setState('idle'), 2000)
  }, [])

  return [state, trigger]
}
