'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_SALON_INFO, STATES_BR, TIMEZONES, type SalonInfo } from '@/lib/configuracoes-mock'
import { FieldLabel, TextInput, SelectInput, SectionCard, SaveButton, useSaveState } from './_primitives'

export default function SectionMeuSalao() {
  const [form, setForm] = useState<SalonInfo>(MOCK_SALON_INFO)
  const [saveState, triggerSave] = useSaveState()

  function set<K extends keyof SalonInfo>(field: K, value: SalonInfo[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">

        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Informações do Salão</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Dados exibidos no site de agendamento e nas comunicações com clientes.
          </p>
        </div>

        {/* Logo */}
        <SectionCard title="Logo">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-[10px] font-semibold text-[#94A3B8]">LOGO</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-md border border-[#E2E8F0] px-3 py-1.5',
                  'text-[12px] text-[#475569] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                )}
              >
                <Upload size={12} aria-hidden="true" />
                Alterar logo
              </button>
              <p className="text-[11px] text-[#94A3B8]">PNG ou JPG, máximo 2 MB.</p>
            </div>
          </div>
        </SectionCard>

        {/* Dados do salão */}
        <SectionCard title="Dados do Salão">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-name">Nome do Salão</FieldLabel>
              <TextInput
                id="salon-name"
                value={form.name}
                onChange={(v) => set('name', v)}
                placeholder="Nome do salão"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-phone">Telefone</FieldLabel>
                <TextInput
                  id="salon-phone"
                  value={form.phone}
                  onChange={(v) => set('phone', v)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-email">E-mail</FieldLabel>
                <TextInput
                  id="salon-email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  placeholder="contato@salao.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-cnpj">CNPJ</FieldLabel>
              <TextInput
                id="salon-cnpj"
                value={form.cnpj}
                onChange={(v) => set('cnpj', v)}
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-address">Endereço</FieldLabel>
              <TextInput
                id="salon-address"
                value={form.address}
                onChange={(v) => set('address', v)}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <FieldLabel htmlFor="salon-neighborhood">Bairro</FieldLabel>
                <TextInput
                  id="salon-neighborhood"
                  value={form.neighborhood}
                  onChange={(v) => set('neighborhood', v)}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-cep">CEP</FieldLabel>
                <TextInput
                  id="salon-cep"
                  value={form.cep}
                  onChange={(v) => set('cep', v)}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <FieldLabel htmlFor="salon-city">Cidade</FieldLabel>
                <TextInput
                  id="salon-city"
                  value={form.city}
                  onChange={(v) => set('city', v)}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-state">UF</FieldLabel>
                <SelectInput
                  id="salon-state"
                  value={form.state}
                  onChange={(v) => set('state', v)}
                >
                  {STATES_BR.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </SelectInput>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-tz">Fuso horário</FieldLabel>
                <SelectInput
                  id="salon-tz"
                  value={form.timezone}
                  onChange={(v) => set('timezone', v)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </SelectInput>
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="salon-currency">Moeda</FieldLabel>
                <SelectInput
                  id="salon-currency"
                  value={form.currency}
                  onChange={(v) => set('currency', v)}
                >
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                </SelectInput>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Redes sociais */}
        <SectionCard title="Redes Sociais">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-instagram">Instagram</FieldLabel>
              <TextInput
                id="salon-instagram"
                value={form.instagram}
                onChange={(v) => set('instagram', v)}
                placeholder="@seusalao"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="salon-whatsapp">WhatsApp</FieldLabel>
              <TextInput
                id="salon-whatsapp"
                value={form.whatsapp}
                onChange={(v) => set('whatsapp', v)}
                placeholder="(11) 99999-9999"
                type="tel"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} />
        </div>
      </div>
    </div>
  )
}
