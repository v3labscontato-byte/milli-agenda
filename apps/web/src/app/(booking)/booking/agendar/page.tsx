'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import StepService from '@/components/booking/step-service'
import StepProfessional from '@/components/booking/step-professional'
import StepDatetime from '@/components/booking/step-datetime'
import StepConfirm, { SuccessScreen } from '@/components/booking/step-confirm'
import { SERVICES, PROFESSIONALS, type BookingService, type BookingProfessional } from '@/lib/booking-mock'

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS = ['Serviço', 'Profissional', 'Data e Hora', 'Confirmação']

function ProgressBar({ step }: { step: Step }) {
  if (step === 5) return null
  return (
    <div className="border-b border-background-secondary px-5 py-3" aria-label={`Passo ${step} de 4`}>
      <div className="flex gap-1.5">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < step ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-content-subtle">
        {STEP_LABELS[step - 1]} · Passo {step} de 4
      </p>
    </div>
  )
}

export default function AgendarPage() {
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
      const data = JSON.parse(raw) as { apptId?: string; serviceId?: string; proId?: string }
      const svc  = SERVICES.find((s) => s.id === data.serviceId)      ?? null
      const pro  = PROFESSIONALS.find((p) => p.id === data.proId)     ?? null
      if (svc)  setService(svc)
      if (pro)  setProfessional(pro)
      setIsReschedule(true)
      setStep(svc && pro ? 3 : svc ? 2 : 1)
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
    <div className="flex flex-col">
      <ProgressBar step={step} />

      {/* Reschedule banner */}
      {isReschedule && step < 5 && (
        <div className="mx-5 mt-3 rounded-xl border border-warning-border bg-warning-light px-3 py-2">
          <p className="text-[12px] font-semibold text-warning-medium">
            ⚠️ REAGENDAMENTO {service ? `— ${service.name}` : ''}
          </p>
          <p className="text-[11px] text-content-subtle">Escolha nova data e horário abaixo.</p>
        </div>
      )}

      {/* key forces remount → restarts animate-fade-in on every step change */}
      <div key={step} className="animate-fade-in motion-reduce:animate-none">
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
  )
}
