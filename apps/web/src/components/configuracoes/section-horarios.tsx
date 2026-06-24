'use client'

import { useState } from 'react'
import { MOCK_BUSINESS_HOURS, HOUR_OPTIONS, type BusinessHours, type DaySchedule } from '@/lib/configuracoes-mock'
import { Toggle, SelectInput, SectionCard, SaveButton, useSaveState } from './_primitives'

function HourSelect({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <SelectInput id={id} value={value} onChange={onChange} className="w-24" aria-label={label}>
      {HOUR_OPTIONS.map((h) => (
        <option key={h} value={h}>{h}</option>
      ))}
    </SelectInput>
  )
}

export default function SectionHorarios() {
  const [hours, setHours] = useState<BusinessHours>(MOCK_BUSINESS_HOURS)
  const [saveState, triggerSave] = useSaveState()

  function updateDay(index: number, patch: Partial<DaySchedule>) {
    setHours((prev) => {
      const days = [...prev.days]
      days[index] = { ...days[index], ...patch }
      return { ...prev, days }
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Horários de Funcionamento</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Defina os horários e políticas de agendamento do seu salão.
          </p>
        </div>

        {/* Dias da semana */}
        <SectionCard title="Dias e Horários">
          <div className="space-y-3">
            {hours.days.map((day, i) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-20 shrink-0">
                  <span className="text-[13px] font-medium text-[#0F172A]">{day.dayLabel}</span>
                </div>
                <Toggle
                  checked={day.open}
                  onChange={(v) => updateDay(i, { open: v })}
                  label={`${day.dayLabel} aberto`}
                />
                <span className="w-16 text-[12px] text-[#94A3B8]">
                  {day.open ? 'Aberto' : 'Fechado'}
                </span>
                {day.open && (
                  <>
                    <HourSelect
                      id={`start-${day.day}`}
                      value={day.start}
                      onChange={(v) => updateDay(i, { start: v })}
                      label={`Abertura — ${day.dayLabel}`}
                    />
                    <span className="text-[12px] text-[#94A3B8]">até</span>
                    <HourSelect
                      id={`end-${day.day}`}
                      value={day.end}
                      onChange={(v) => updateDay(i, { end: v })}
                      label={`Fechamento — ${day.dayLabel}`}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Intervalo de almoço */}
        <SectionCard title="Intervalo de Almoço">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Toggle
                checked={hours.lunchBreak.active}
                onChange={(v) =>
                  setHours((prev) => ({ ...prev, lunchBreak: { ...prev.lunchBreak, active: v } }))
                }
                label="Ativar intervalo de almoço"
              />
              <span className="text-[13px] text-[#475569]">
                {hours.lunchBreak.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {hours.lunchBreak.active && (
              <div className="flex items-center gap-3">
                <HourSelect
                  id="lunch-start"
                  value={hours.lunchBreak.start}
                  onChange={(v) =>
                    setHours((prev) => ({ ...prev, lunchBreak: { ...prev.lunchBreak, start: v } }))
                  }
                  label="Início do intervalo de almoço"
                />
                <span className="text-[12px] text-[#94A3B8]">até</span>
                <HourSelect
                  id="lunch-end"
                  value={hours.lunchBreak.end}
                  onChange={(v) =>
                    setHours((prev) => ({ ...prev, lunchBreak: { ...prev.lunchBreak, end: v } }))
                  }
                  label="Fim do intervalo de almoço"
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Políticas de agendamento */}
        <SectionCard title="Políticas de Agendamento">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">Antecedência mínima</p>
                <p className="text-[12px] text-[#64748B]">Tempo mínimo antes do horário para aceitar agendamento</p>
              </div>
              <SelectInput
                id="min-advance"
                value={hours.minAdvanceHours}
                onChange={(v) => setHours((prev) => ({ ...prev, minAdvanceHours: Number(v) }))}
                className="w-36"
              >
                <option value={0}>Sem restrição</option>
                <option value={0.5}>30 minutos</option>
                <option value={1}>1 hora</option>
                <option value={2}>2 horas</option>
                <option value={4}>4 horas</option>
                <option value={8}>8 horas</option>
                <option value={24}>24 horas</option>
              </SelectInput>
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">Antecedência máxima</p>
                  <p className="text-[12px] text-[#64748B]">Com quantos dias de antecedência é possível agendar</p>
                </div>
                <SelectInput
                  id="max-advance"
                  value={hours.maxAdvanceDays}
                  onChange={(v) => setHours((prev) => ({ ...prev, maxAdvanceDays: Number(v) }))}
                  className="w-36"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </SelectInput>
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">Intervalo entre agendamentos</p>
                  <p className="text-[12px] text-[#64748B]">Tempo extra de preparação entre atendimentos</p>
                </div>
                <SelectInput
                  id="slot-gap"
                  value={hours.slotGapMinutes}
                  onChange={(v) => setHours((prev) => ({ ...prev, slotGapMinutes: Number(v) }))}
                  className="w-36"
                >
                  <option value={0}>0 minutos</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                </SelectInput>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar horários" />
        </div>
      </div>
    </div>
  )
}
