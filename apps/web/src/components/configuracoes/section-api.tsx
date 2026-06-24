'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, Trash2, Plus, CheckCircle2, Circle, Zap, Calendar, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_API_KEYS, MOCK_WEBHOOKS, type ApiKey, type Webhook } from '@/lib/configuracoes-mock'
import { Toggle, SectionCard } from './_primitives'

export default function SectionApi() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_API_KEYS)
  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [gcalConnected, setGcalConnected] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(true)

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCopy(id: string, text: string) {
    void navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function revokeKey(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  function removeWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">API & Integrações</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">Gerencie chaves de acesso, webhooks e integrações externas.</p>
        </div>

        {/* API Keys */}
        <SectionCard title="API Keys">
          <div className="space-y-3">
            {keys.map((key) => {
              const isRevealed = revealed.has(key.id)
              const isCopied = copied === key.id
              return (
                <div key={key.id} className="rounded-lg border border-[#E2E8F0] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#0F172A]">{key.name}</p>
                      <p className="mt-1 font-mono text-[12px] text-[#64748B]">
                        {isRevealed ? 'sk_live_••••••••••••••••••••3f2a' : key.key}
                      </p>
                      <p className="mt-1 text-[11px] text-[#94A3B8]">
                        Criada em {key.createdAt} · Último uso: {key.lastUsed}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleReveal(key.id)}
                        aria-label={isRevealed ? 'Ocultar chave' : 'Revelar chave'}
                        className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                      >
                        {isRevealed ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(key.id, 'sk_live_••••••••••••••••••••3f2a')}
                        aria-label="Copiar chave"
                        className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                      >
                        <span className="flex items-center gap-1">
                          <Copy size={12} aria-hidden="true" />
                          {isCopied ? 'Copiado' : 'Copiar'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => revokeKey(key.id)}
                        aria-label="Revogar chave"
                        className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#64748B] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                      >
                        Revogar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {keys.length === 0 && (
              <p className="py-4 text-center text-[13px] text-[#94A3B8]">Nenhuma API key ativa.</p>
            )}

            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#E2E8F0] py-2.5',
                'text-[12px] text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              )}
            >
              <Plus size={13} aria-hidden="true" />
              Criar nova API Key
            </button>
          </div>
        </SectionCard>

        {/* Webhooks */}
        <SectionCard title="Webhooks">
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="rounded-lg border border-[#E2E8F0] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12px] text-[#0F172A]">{wh.url}</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">
                      Eventos: {wh.events.join(' ')}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {wh.active
                        ? <CheckCircle2 size={11} className="text-[#10B981]" aria-hidden="true" />
                        : <Circle size={11} className="text-[#94A3B8]" aria-hidden="true" />
                      }
                      <span className="text-[11px] text-[#94A3B8]">
                        {wh.active ? 'Ativo' : 'Inativo'} · Última entrega: {wh.lastDelivery}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      aria-label="Editar webhook"
                      className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label="Testar webhook"
                      className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      Testar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWebhook(wh.id)}
                      aria-label="Remover webhook"
                      className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#E2E8F0] py-2.5',
                'text-[12px] text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              )}
            >
              <Plus size={13} aria-hidden="true" />
              Adicionar webhook
            </button>
          </div>
        </SectionCard>

        {/* Integrações */}
        <SectionCard title="Integrações">
          <div className="space-y-3">
            {[
              { id: 'gcal', label: 'Google Calendar', icon: Calendar, connected: gcalConnected, setConnected: setGcalConnected },
              { id: 'outlook', label: 'Outlook / Microsoft 365', icon: Mail, connected: outlookConnected, setConnected: setOutlookConnected },
              { id: 'whatsapp', label: 'WhatsApp Business', icon: Zap, connected: whatsappConnected, setConnected: setWhatsappConnected },
            ].map(({ id, label, icon: Icon, connected, setConnected }) => (
              <div key={id} className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-[#475569]" aria-hidden="true" />
                  <div>
                    <p className="text-[13px] font-medium text-[#0F172A]">{label}</p>
                    <p className="text-[11px] text-[#94A3B8]">{connected ? 'Conectado' : 'Não conectado'}</p>
                  </div>
                </div>
                <Toggle
                  checked={connected}
                  onChange={setConnected}
                  label={`${connected ? 'Desconectar' : 'Conectar'} ${label}`}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="pb-6" />
      </div>
    </div>
  )
}
