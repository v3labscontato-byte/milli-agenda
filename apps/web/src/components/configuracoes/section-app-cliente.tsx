'use client'

import { useState } from 'react'
import {
  Instagram, MapPin, MessageSquare, Gift, Star,
  Users, Palette, ChevronRight, Loader2, ExternalLink,
} from 'lucide-react'
import { useConfiguracoes } from '@/hooks/use-configuracoes'
import { configuracoesApi } from '@/lib/api/configuracoes'
import { SectionCard, Toggle, FieldLabel, TextInput, SaveButton, useSaveState } from './_primitives'
import ColorPicker from './color-picker'
import PwaPreview from './pwa-preview'

type Panel =
  | 'slogan' | 'color' | 'accepting' | 'instagram'
  | 'google' | 'welcome' | 'referral' | 'points'
  | null

interface GroupItemProps {
  icon: React.ReactNode
  label: string
  value: string
  onClick: () => void
}

function GroupItem({ icon, label, value, onClick }: GroupItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
    >
      <span className="shrink-0 text-[#475569]" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#0F172A]">{label}</p>
        <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">{value || '—'}</p>
      </div>
      <ChevronRight size={14} className="shrink-0 text-[#CBD5E1]" aria-hidden="true" />
    </button>
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
      {children}
    </p>
  )
}

export default function SectionAppCliente() {
  const { settings, loading, error, update } = useConfiguracoes()
  const [panel, setPanel] = useState<Panel>(null)

  // Controlled field values for each panel
  const [fieldValue, setFieldValue] = useState('')
  const [saveState, triggerSave] = useSaveState()

  // Google place detection
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleResult, setGoogleResult] = useState<{ name: string; rating: number; totalRatings: number } | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  // Live color preview
  const [liveColor, setLiveColor] = useState<string | null>(null)

  function openPanel(p: Panel) {
    setPanel(p)
    setGoogleResult(null)
    setGoogleError(null)
    if (p === 'color') {
      setLiveColor(settings?.primaryColor ?? '#3D2B1F')
      return
    }
    const initial: Record<string, string> = {
      slogan:    settings?.slogan ?? '',
      instagram: settings?.instagram ?? '',
      google:    settings?.googlePlaceId ?? '',
      welcome:   settings?.welcomeMessage ?? '',
      referral:  settings?.referralBonus ? String(Number(settings.referralBonus)) : '',
      points:    String(settings?.pointsPerReal ?? 1),
    }
    setFieldValue(p ? (initial[p] ?? '') : '')
  }

  async function savePanel(data: Parameters<typeof update>[0]) {
    const result = await update(data)
    if (result.success) {
      triggerSave()
      setPanel(null)
    }
  }

  async function detectGoogle() {
    if (!settings) return
    setGoogleLoading(true)
    setGoogleError(null)
    setGoogleResult(null)
    const address = [settings.name, settings.city].filter(Boolean).join(' ')
    try {
      const res = await configuracoesApi.getGooglePlace(address)
      if (res) setGoogleResult({ name: res.name, rating: res.rating, totalRatings: res.totalRatings })
      else setGoogleError('Não encontrado')
    } catch {
      setGoogleError('Erro ao buscar')
    } finally {
      setGoogleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#94A3B8]" />
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-[#DC2626]">{error ?? 'Erro ao carregar'}</p>
      </div>
    )
  }

  const primaryColor = liveColor ?? settings.primaryColor ?? '#3D2B1F'

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main list */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          <div className="mb-5">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">App do Cliente</h2>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Configure a identidade e o engajamento do seu app para clientes.
            </p>
          </div>

          <SectionCard>
            <GroupLabel>Identidade</GroupLabel>
            <div className="divide-y divide-[#F1F5F9]">
              <GroupItem
                icon={<MessageSquare size={16} />}
                label="Slogan"
                value={settings.slogan ?? ''}
                onClick={() => openPanel('slogan')}
              />
              <GroupItem
                icon={<Palette size={16} />}
                label="Cor principal"
                value={settings.primaryColor ?? '#3D2B1F'}
                onClick={() => openPanel('color')}
              />
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="shrink-0 text-[#475569]"><Users size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#0F172A]">Aceita novos clientes</p>
                  <p className="mt-0.5 text-[12px] text-[#94A3B8]">
                    {settings.acceptingNewClients ? 'Aberto para novos clientes' : 'Não está aceitando'}
                  </p>
                </div>
                <Toggle
                  checked={settings.acceptingNewClients}
                  onChange={(v) => void update({ acceptingNewClients: v })}
                  label="Aceita novos clientes"
                />
              </div>
              <GroupItem
                icon={<Instagram size={16} />}
                label="Instagram"
                value={settings.instagram ?? ''}
                onClick={() => openPanel('instagram')}
              />
            </div>

            <GroupLabel>Google</GroupLabel>
            <div className="divide-y divide-[#F1F5F9]">
              <GroupItem
                icon={<MapPin size={16} />}
                label="Google Place ID"
                value={settings.googlePlaceId ?? 'Não configurado'}
                onClick={() => openPanel('google')}
              />
            </div>

            <GroupLabel>Engajamento</GroupLabel>
            <div className="divide-y divide-[#F1F5F9]">
              <GroupItem
                icon={<MessageSquare size={16} />}
                label="Mensagem de boas-vindas"
                value={settings.welcomeMessage ?? ''}
                onClick={() => openPanel('welcome')}
              />
              <GroupItem
                icon={<Gift size={16} />}
                label="Indique e ganhe"
                value={settings.referralBonus ? `R$ ${Number(settings.referralBonus).toFixed(2)}` : 'Não configurado'}
                onClick={() => openPanel('referral')}
              />
              <GroupItem
                icon={<Star size={16} />}
                label="Pontos por R$1 gasto"
                value={`${settings.pointsPerReal} ponto(s)`}
                onClick={() => openPanel('points')}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Side panel */}
      {panel && (
        <div className="flex w-[380px] shrink-0 flex-col border-l border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <h3 className="text-[14px] font-semibold text-[#0F172A]">
              {panel === 'slogan'     && 'Editar slogan'}
              {panel === 'color'      && 'Cor principal'}
              {panel === 'accepting'  && 'Aceita novos clientes'}
              {panel === 'instagram'  && 'Instagram'}
              {panel === 'google'     && 'Google Place ID'}
              {panel === 'welcome'    && 'Mensagem de boas-vindas'}
              {panel === 'referral'   && 'Indique e ganhe'}
              {panel === 'points'     && 'Pontos por R$1'}
            </h3>
            <button
              type="button"
              onClick={() => { setPanel(null); setLiveColor(null) }}
              className="text-[12px] text-[#94A3B8] hover:text-[#475569] focus-visible:outline-none"
            >
              Fechar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Slogan */}
            {panel === 'slogan' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="slogan-input">Slogan do salão</FieldLabel>
                  <TextInput
                    id="slogan-input"
                    value={fieldValue}
                    placeholder="Ex: Beleza que transforma"
                    onChange={setFieldValue}
                  />
                  <p className="text-[11px] text-[#94A3B8]">Aparece na tela inicial do app.</p>
                </div>
                <SaveButton state={saveState} onClick={() => void savePanel({ slogan: fieldValue })} />
              </div>
            )}

            {/* Color */}
            {panel === 'color' && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <ColorPicker
                      value={liveColor ?? settings.primaryColor ?? '#3D2B1F'}
                      onChange={(hex) => setLiveColor(hex)}
                      onApply={(hex) => void savePanel({ primaryColor: hex })}
                    />
                  </div>
                  <PwaPreview
                    primaryColor={primaryColor}
                    salonName={settings.name}
                    slogan={settings.slogan}
                    logoUrl={settings.logoUrl}
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  O preview ao vivo atualiza enquanto você arrasta. Clique em &quot;Aplicar cor&quot; para salvar.
                </p>
              </div>
            )}

            {/* Instagram */}
            {panel === 'instagram' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="ig-input">Perfil do Instagram</FieldLabel>
                  <TextInput
                    id="ig-input"
                    value={fieldValue}
                    placeholder="@studiobella"
                    onChange={setFieldValue}
                  />
                  <p className="text-[11px] text-[#94A3B8]">Inclua o @ no início.</p>
                </div>
                <SaveButton state={saveState} onClick={() => void savePanel({ instagram: fieldValue })} />
              </div>
            )}

            {/* Google Place */}
            {panel === 'google' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="gplace-input">Google Place ID</FieldLabel>
                  <TextInput
                    id="gplace-input"
                    value={fieldValue}
                    placeholder="ChIJ..."
                    onChange={setFieldValue}
                  />
                </div>

                <button
                  type="button"
                  onClick={detectGoogle}
                  disabled={googleLoading}
                  className="flex h-9 items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-4 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {googleLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Buscando...</>
                    : 'Detectar automaticamente'}
                </button>

                {googleResult && (
                  <div className="rounded-lg border border-[#FEF9C3] bg-[#FEFCE8] px-4 py-3">
                    <p className="text-[12px] font-semibold text-[#CA8A04]">{googleResult.name}</p>
                    <p className="mt-0.5 text-[12px] text-[#475569]">
                      ★ {googleResult.rating.toFixed(1)} · {googleResult.totalRatings} avaliações
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-[12px] font-medium text-[#2563EB] hover:underline"
                      onClick={() => setFieldValue(googleResult.name)}
                    >
                      Usar este Place ID
                    </button>
                  </div>
                )}

                {googleError && (
                  <div className="space-y-2 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3">
                    <p className="text-[12px] text-[#DC2626]">Não encontrado no Google.</p>
                    <a
                      href="https://business.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline"
                    >
                      Cadastrar no Google Meu Negócio <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                <SaveButton state={saveState} onClick={() => void savePanel({ googlePlaceId: fieldValue })} />
              </div>
            )}

            {/* Welcome message */}
            {panel === 'welcome' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="welcome-input">Mensagem de boas-vindas</FieldLabel>
                  <textarea
                    id="welcome-input"
                    value={fieldValue}
                    placeholder="Ex: Seja bem-vindo! Estamos felizes em te receber."
                    rows={4}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="w-full resize-none rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] transition-colors duration-150"
                  />
                  <p className="text-[11px] text-[#94A3B8]">Exibida logo após o cadastro do cliente no app.</p>
                </div>
                <SaveButton state={saveState} onClick={() => void savePanel({ welcomeMessage: fieldValue })} />
              </div>
            )}

            {/* Referral bonus */}
            {panel === 'referral' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="referral-input">Bônus por indicação (R$)</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8]">
                      R$
                    </span>
                    <input
                      id="referral-input"
                      type="number"
                      min={0}
                      step={1}
                      value={fieldValue}
                      placeholder="20"
                      onChange={(e) => setFieldValue(e.target.value)}
                      className="w-full rounded-md border border-[#E2E8F0] py-2 pl-9 pr-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] transition-colors duration-150 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Crédito dado ao cliente que indica um amigo.</p>
                </div>
                <SaveButton
                  state={saveState}
                  onClick={() => void savePanel({ referralBonus: fieldValue ? Number(fieldValue) : null })}
                />
              </div>
            )}

            {/* Points per real */}
            {panel === 'points' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="points-input">Pontos por R$1 gasto</FieldLabel>
                  <input
                    id="points-input"
                    type="number"
                    min={1}
                    step={1}
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] transition-colors duration-150 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-[11px] text-[#94A3B8]">Padrão: 1 ponto por R$1 gasto.</p>
                </div>
                <SaveButton
                  state={saveState}
                  onClick={() => void savePanel({ pointsPerReal: Number(fieldValue) || 1 })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed PWA preview when no panel is open */}
      {!panel && (
        <div className="pointer-events-none fixed bottom-8 right-8 z-10">
          <PwaPreview
            primaryColor={primaryColor}
            salonName={settings.name}
            slogan={settings.slogan}
            logoUrl={settings.logoUrl}
          />
        </div>
      )}
    </div>
  )
}
