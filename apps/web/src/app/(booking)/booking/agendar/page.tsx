'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import StepService from '@/components/booking/step-service'
import StepProfessional from '@/components/booking/step-professional'
import StepDatetime from '@/components/booking/step-datetime'
import StepConfirm, { SuccessScreen } from '@/components/booking/step-confirm'
import { type BookingService, type BookingProfessional } from '@/lib/booking-mock'
import { usePublicTenant } from '@/hooks/use-public-tenant'

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS = ['Serviço', 'Profissional', 'Data e Hora', 'Confirmação']

function ProgressBar({ step, primaryColor }: { step: Step; primaryColor: string }) {
  if (step === 5) return null
  const progress = Math.round((step / 4) * 100)
  return (
    <div
      className="shrink-0 bg-white px-4 py-3"
      style={{ borderBottom: '1px solid #E2E8F0' }}
      aria-label={`Passo ${step} de 4`}
    >
      <p className="mb-2 text-[11px] text-[#64748B]">
        {STEP_LABELS[step - 1]} · Passo {step} de 4
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="h-full rounded-full transition-all duration-300 motion-reduce:transition-none"
          style={{ width: `${progress}%`, backgroundColor: primaryColor }}
        />
      </div>
    </div>
  )
}

export default function AgendarPage() {
  const { tenant: tenantData } = usePublicTenant()
  const primaryColor = tenantData?.primaryColor ?? '#81736f'

  const [step, setStep]                 = useState<Step>(1)
  const [service, setService]           = useState<BookingService | null>(null)
  const [professional, setProfessional] = useState<BookingProfessional | null>(null)
  const [date, setDate]                 = useState<string | null>(null)
  const [time, setTime]                 = useState<string | null>(null)
  const [isReschedule, setIsReschedule] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('reschedule')
    if (!raw) return
    try {
      const data = JSON.parse(raw) as { apptId?: string }
      void data
      setIsReschedule(true)
      sessionStorage.removeItem('reschedule')
    } catch { /* ignore malformed data */ }
  }, [])

  function reset() {
    setStep(1)
    setService(null)
    setProfessional(null)
    setDate(null)
    setTime(null)
    setIsReschedule(false)
  }

  return (
    <div className="flex h-full flex-col">

      {/* FIXO — step indicator */}
      <ProgressBar step={step} primaryColor={primaryColor} />

      {isReschedule && step < 5 && (
        <div className="mx-5 mt-3 shrink-0 rounded-xl border border-[#FDE047] bg-[#FEF9C3] px-3 py-2">
          <p className="text-[12px] font-semibold text-[#CA8A04]">
            ⚠️ REAGENDAMENTO {service ? `— ${service.name}` : ''}
          </p>
          <p className="text-[11px] text-[#64748B]">Escolha nova data e horário abaixo.</p>
        </div>
      )}

      {/* SCROLLÁVEL — conteúdo do step */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}
      >
        <div key={step} className={cn('animate-fade-in motion-reduce:animate-none', step === 5 && 'h-full')}>
          {step === 1 && (
            <StepService onSelect={(svc) => { setService(svc); setStep(2) }} />
          )}

          {step === 2 && service && (
            <StepProfessional
              service={service}
              onBack={() => setStep(1)}
              onSelect={(pro) => { setProfessional(pro); setStep(3) }}
            />
          )}

          {step === 3 && service && professional && (
            <StepDatetime
              service={service}
              professional={professional}
              onBack={() => setStep(2)}
              onSelect={(d, t) => { setDate(d); setTime(t); setStep(4) }}
            />
          )}

          {step === 4 && service && professional && date && time && (
            <StepConfirm
              service={service}
              professional={professional}
              date={date}
              time={time}
              isReschedule={isReschedule}
              onBack={() => setStep(3)}
              onConfirm={() => setStep(5)}
            />
          )}

          {step === 5 && service && professional && date && time && (
            <SuccessScreen
              service={service}
              professional={professional}
              date={date}
              time={time}
              onNew={reset}
            />
          )}
        </div>
      </div>
    </div>
  )
}
