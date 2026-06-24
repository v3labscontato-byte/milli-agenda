'use client'

import { useState } from 'react'
import { AlertTriangle, Search, Download, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_LGPD_LOGS } from '@/lib/configuracoes-mock'
import { Toggle, SelectInput, SectionCard, SaveButton, useSaveState } from './_primitives'

export default function SectionLgpd() {
  const [cookieConsent, setCookieConsent]       = useState(true)
  const [bookingConsent, setBookingConsent]     = useState(true)
  const [retentionYears, setRetentionYears]     = useState('2')
  const [exportSearch, setExportSearch]         = useState('')
  const [anonSearch, setAnonSearch]             = useState('')
  const [anonConfirm, setAnonConfirm]           = useState(false)
  const [saveState, triggerSave]               = useSaveState()

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-6">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Conformidade LGPD</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Ferramentas para atender a Lei Geral de Proteção de Dados.
          </p>
        </div>

        {/* Consentimento */}
        <SectionCard title="Política de Privacidade">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Toggle
                  checked={cookieConsent}
                  onChange={setCookieConsent}
                  label="Exibir aviso de cookies no site"
                />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">Exibir aviso de cookies no site</p>
                <p className="text-[12px] text-[#64748B]">Banner de consentimento exibido na primeira visita</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Toggle
                  checked={bookingConsent}
                  onChange={setBookingConsent}
                  label="Solicitar consentimento no agendamento online"
                />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">Solicitar consentimento no agendamento online</p>
                <p className="text-[12px] text-[#64748B]">Checkbox obrigatório para aceitar os termos de uso</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Retenção de dados */}
        <SectionCard title="Dados dos Clientes">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">Retenção de dados</p>
              <p className="text-[12px] text-[#64748B]">Período para manter dados após o último contato</p>
            </div>
            <SelectInput
              id="retention"
              value={retentionYears}
              onChange={setRetentionYears}
              className="w-36"
            >
              <option value="1">1 ano</option>
              <option value="2">2 anos</option>
              <option value="3">3 anos</option>
              <option value="5">5 anos</option>
              <option value="forever">Indefinidamente</option>
            </SelectInput>
          </div>
        </SectionCard>

        {/* Exportar dados */}
        <SectionCard title="Exportar Dados de Cliente">
          <p className="mb-3 text-[12px] text-[#64748B]">
            Gera um arquivo JSON com todos os dados pessoais de um cliente específico.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={exportSearch}
                onChange={(e) => setExportSearch(e.target.value)}
                placeholder="Buscar cliente por nome ou e-mail…"
                aria-label="Buscar cliente para exportar"
                className={cn(
                  'w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-8 pr-3 text-[13px] text-[#0F172A]',
                  'placeholder:text-[#94A3B8]',
                  'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                )}
              />
            </div>
            <button
              type="button"
              disabled={!exportSearch.trim()}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-md border border-[#E2E8F0] px-3 py-2',
                'text-[12px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                exportSearch.trim()
                  ? 'text-[#2563EB] hover:border-[#2563EB]'
                  : 'cursor-not-allowed text-[#CBD5E1]',
              )}
            >
              <Download size={13} aria-hidden="true" />
              Exportar JSON
            </button>
          </div>
        </SectionCard>

        {/* Anonimizar dados */}
        <SectionCard title="Anonimizar Dados de Cliente">
          <div className="space-y-3">
            <p className="text-[12px] text-[#64748B]">
              Remove permanentemente os dados pessoais identificáveis do cliente, mantendo apenas o histórico financeiro agregado.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={anonSearch}
                  onChange={(e) => { setAnonSearch(e.target.value); setAnonConfirm(false) }}
                  placeholder="Buscar cliente por nome ou e-mail…"
                  aria-label="Buscar cliente para anonimizar"
                  className={cn(
                    'w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-8 pr-3 text-[13px] text-[#0F172A]',
                    'placeholder:text-[#94A3B8]',
                    'focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
                  )}
                />
              </div>
              {!anonConfirm ? (
                <button
                  type="button"
                  disabled={!anonSearch.trim()}
                  onClick={() => setAnonConfirm(true)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-md border px-3 py-2',
                    'text-[12px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                    anonSearch.trim()
                      ? 'border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2]'
                      : 'cursor-not-allowed border-[#E2E8F0] text-[#CBD5E1]',
                  )}
                >
                  <UserX size={13} aria-hidden="true" />
                  Anonimizar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAnonSearch(''); setAnonConfirm(false) }}
                  className="flex shrink-0 items-center gap-2 rounded-md bg-[#EF4444] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
                >
                  Confirmar
                </button>
              )}
            </div>
            {anonConfirm && (
              <div className="flex items-start gap-2 rounded-md border border-[#FCA5A5] bg-[#FEE2E2] px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[#EF4444]" aria-hidden="true" />
                <p className="text-[12px] text-[#991B1B]">
                  Esta ação é <strong>irreversível</strong>. Os dados pessoais serão permanentemente removidos. Clique em Confirmar para prosseguir.
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Logs de acesso */}
        <SectionCard title="Logs de Acesso (últimos 30 dias)">
          <ul className="divide-y divide-[#F1F5F9]" role="list" aria-label="Histórico de acessos a dados">
            {MOCK_LGPD_LOGS.map((log) => (
              <li key={log.id} className="flex items-center gap-4 py-2.5 text-[12px]">
                <span className="w-12 shrink-0 font-tabular text-[#94A3B8]">{log.date}</span>
                <span className="w-10 shrink-0 font-tabular text-[#94A3B8]">{log.time}</span>
                <span className="text-[#475569]">Admin</span>
                <span className="text-[#475569]">{log.action}</span>
                <span className="font-medium text-[#0F172A]">{log.subject}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="flex justify-end pb-6">
          <SaveButton state={saveState} onClick={triggerSave} label="Salvar preferências" />
        </div>
      </div>
    </div>
  )
}
