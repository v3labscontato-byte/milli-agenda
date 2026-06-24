'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  MOCK_NOTIF_PREFS,
  NOTIF_EVENTS,
  NOTIF_EVENT_LABELS,
  type NotifPrefs,
  type NotifEvent,
  type NotifChannel,
} from '@/lib/configuracoes-mock'
import { Toggle, SectionCard, SaveButton, useSaveState } from './_primitives'

const CHANNELS: { id: NotifChannel; label: string }[] = [
  { id: 'email',    label: 'Email'    },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'system',   label: 'Sistema'  },
]

export default function SectionNotificacoes() {
  const [prefs, setPrefs] = useState<NotifPrefs>(MOCK_NOTIF_PREFS)
  const [saveState, triggerSave] = useSaveState()

  function toggle(event: NotifEvent, channel: NotifChannel) {
    setPrefs((prev) => ({
      ...prev,
      matrix: {
        ...prev.matrix,
        [event]: {
          ...prev.matrix[event],
          [channel]: !prev.matrix[event][channel],
        },
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
                            checked={prefs.matrix[event][ch.id]}
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
        <SectionCard title="WhatsApp Business">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {prefs.whatsappConnected ? (
                <CheckCircle2 size={16} className="text-[#10B981]" aria-hidden="true" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-[#CBD5E1]" aria-hidden="true" />
              )}
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">
                  {prefs.whatsappConnected ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-[12px] text-[#64748B]">{prefs.whatsappNumber}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {prefs.whatsappConnected ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, whatsappConnected: false }))}
                    className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-[#475569] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    Desconectar
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-[#475569] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                  >
                    Testar mensagem
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, whatsappConnected: true }))}
                  className="rounded-md bg-[#2563EB] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Conectar WhatsApp
                </button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Email */}
        <SectionCard title="E-mail">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">Endereço remetente</p>
              <p className="text-[12px] text-[#64748B]">{prefs.emailSender}</p>
            </div>
            <span className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[11px] font-medium text-[#065F46]">
              Verificado
            </span>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar notificações" />
        </div>
      </div>
    </div>
  )
}
