'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { CLIENT } from '@/lib/booking-mock'

function Field({
  label, id, value, onChange, type = 'text', placeholder,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-content-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-content-primary placeholder:text-content-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
      />
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'saved'

export default function MeusDadosPage() {
  const router = useRouter()

  const [name, setName] = useState(CLIENT.name)
  const [email, setEmail] = useState(CLIENT.email)
  const [phone, setPhone] = useState(CLIENT.phone)
  const [birthDate, setBirthDate] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function handleSave() {
    setSaveState('saving')
    // TODO: PATCH /api/v1/clients/me when client auth is implemented
    await new Promise((r) => setTimeout(r, 800))
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-[16px] font-semibold text-content-primary">Meus Dados</h1>
      </div>

      <div className="space-y-4 px-5 py-5">
        {/* Avatar placeholder */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-medium text-[26px] font-bold text-white shadow-md"
            aria-hidden="true"
          >
            {CLIENT.initials}
          </div>
          <p className="text-[12px] text-content-subtle">Foto de perfil · em breve</p>
        </div>

        <Field label="Nome completo" id="name" value={name} onChange={setName} placeholder="Seu nome" />
        <Field label="E-mail" id="email" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" />
        <Field label="Telefone" id="phone" value={phone} onChange={setPhone} type="tel" placeholder="(11) 99999-9999" />
        <Field label="Data de nascimento" id="birth" value={birthDate} onChange={setBirthDate} type="date" />

        <button
          type="button"
          onClick={() => { void handleSave() }}
          disabled={saveState === 'saving'}
          className="mt-2 w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          {saveState === 'saving' ? 'Salvando…' : saveState === 'saved' ? 'Salvo ✓' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
