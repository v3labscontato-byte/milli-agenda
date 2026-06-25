'use client'

import { useState } from 'react'
import {
  NOTIF_EVENTS,
  NOTIF_EVENT_LABELS,
  type NotifEvent,
  type NotifChannel,
} from '@/lib/configuracoes-mock'
import { Toggle, SectionCard, SaveButton, useSaveState } from './_primitives'

const CHANNELS: { id: NotifChannel; label: string }[] = [
  { id: 'email',    label: 'Email'    },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'system',   label: 'Sistema'  },
]

// Toggles começam desligados — integração real ainda não disponível
const EMPTY_MATRIX: Record<NotifEvent, Record<NotifChannel, boolean>> = NOTIF_EVENTS.reduce(
  (acc, event) => {
    acc[event] = { email: false, whatsapp: false, system: false }
    return acc
  },
  {} as Record<NotifEvent, Record<NotifChannel, boolean>>,
)

export default function SectionNotificacoes() {
  const [matrix, setMatrix] = useState(EMPTY_MATRIX)
  const [saveState, triggerSave] = useSaveState()

  function toggle(event: NotifEvent, channel: NotifChannel) {
    setMatrix((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !prev[event][channel],
      },
    }))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Preferências de Notificação</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Escolha quando e como você e seus clientes recebem notificações.
          </p>
        </div>

        {/* Matrix table */}
        <SectionCard title="Canais de Notificação">
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Preferências de notificação por canal">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  <th scope="col" className="pb-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
                    Evento
                  </th>
                  {CHANNELS.map((ch) => (
                    <th
                      key={ch.id}
                      scope="col"
                      className="w-24 pb-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]"
                    >
                      {ch.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {NOTIF_EVENTS.map((event) => (
                  <tr key={event} className="group">
                    <td className="py-3 pr-4 text-[13px] text-[#0F172A]">
                      {NOTIF_EVENT_LABELS[event]}
                    </td>
                    {CHANNELS.map((ch) => (
                      <td key={ch.id} className="py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            checked={matrix[event][ch.id]}
                            onChange={() => toggle(event, ch.id)}
                            label={`${NOTIF_EVENT_LABELS[event]} via ${ch.label}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* WhatsApp */}
        {/* TODO: integração real via API */}
        <SectionCard title="WhatsApp Business">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 rounded-full border-2 border-[#CBD5E1]" aria-hidden="true" />
              <p className="text-[13px] font-medium text-[#0F172A]">WhatsApp não conectado</p>
            </div>
            <button
              type="button"
              disabled
              title="Em breve"
              className="cursor-not-allowed rounded-md bg-[#2563EB] px-3 py-1.5 text-[12px] font-medium text-white opacity-50"
            >
              Conectar
            </button>
          </div>
        </SectionCard>

        {/* Email */}
        {/* TODO: integração real via API */}
        <SectionCard title="E-mail">
          <p className="text-[13px] text-[#64748B]">Nenhum e-mail configurado</p>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar notificações" />
        </div>
      </div>
    </div>
  )
}
