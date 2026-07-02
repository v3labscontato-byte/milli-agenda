'use client'

import { useState } from 'react'
import { useConfiguracoes } from '@/hooks/use-configuracoes'
import SettingsNav, { type TabId } from '@/components/configuracoes/settings-nav'
import SectionMeuSalao     from '@/components/configuracoes/section-meu-salao'
import SectionHorarios     from '@/components/configuracoes/section-horarios'
import SectionNotificacoes from '@/components/configuracoes/section-notificacoes'
import SectionPagamentos   from '@/components/configuracoes/section-pagamentos'
import SectionSiteBooking  from '@/components/configuracoes/section-site-booking'
import SectionTiposProfissionais from '@/components/configuracoes/section-tipos-profissionais'
import SectionCategoriasServicos from '@/components/configuracoes/section-categorias-servicos'
import SectionPlano        from '@/components/configuracoes/section-plano'
import SectionApi          from '@/components/configuracoes/section-api'
import SectionLgpd         from '@/components/configuracoes/section-lgpd'
import SectionAfiliados    from '@/components/configuracoes/section-afiliados'
import SectionFidelidade   from '@/components/configuracoes/section-fidelidade'
import SectionAppCliente   from '@/components/configuracoes/section-app-cliente'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('meu-salao')
  const { settings } = useConfiguracoes()

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">Configurações</h1>
        <p className="mt-0.5 text-[13px] text-[#64748B]">
          Gerencie as informações e preferências do seu salão
        </p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SettingsNav active={activeTab} onChange={setActiveTab} />
        <div className="flex-1 overflow-hidden bg-[#F8FAFC]">
          {activeTab === 'meu-salao'    && <SectionMeuSalao />}
          {activeTab === 'horarios'     && <SectionHorarios />}
          {activeTab === 'notificacoes' && <SectionNotificacoes />}
          {activeTab === 'pagamentos'   && <SectionPagamentos />}
          {activeTab === 'site-booking' && <SectionSiteBooking settings={settings} />}
          {activeTab === 'tipos-profissionais' && <SectionTiposProfissionais />}
          {activeTab === 'categorias-servicos' && <SectionCategoriasServicos />}
          {activeTab === 'plano'        && <SectionPlano />}
          {activeTab === 'api'          && <SectionApi />}
          {activeTab === 'lgpd'         && <SectionLgpd />}
          {activeTab === 'app-cliente'  && <SectionAppCliente />}
          {activeTab === 'afiliados'    && <SectionAfiliados />}
          {activeTab === 'fidelidade'   && <SectionFidelidade />}
        </div>
      </div>
    </div>
  )
}
