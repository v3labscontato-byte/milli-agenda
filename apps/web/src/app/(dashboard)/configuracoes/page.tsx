'use client'

import { useState } from 'react'
import SettingsNav, { type TabId } from '@/components/configuracoes/settings-nav'
import SectionMeuSalao     from '@/components/configuracoes/section-meu-salao'
import SectionHorarios     from '@/components/configuracoes/section-horarios'
import SectionNotificacoes from '@/components/configuracoes/section-notificacoes'
import SectionPagamentos   from '@/components/configuracoes/section-pagamentos'
import SectionSiteBooking  from '@/components/configuracoes/section-site-booking'
import SectionPlano        from '@/components/configuracoes/section-plano'
import SectionApi          from '@/components/configuracoes/section-api'
import SectionLgpd         from '@/components/configuracoes/section-lgpd'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('meu-salao')

  return (
    <div className="flex h-full overflow-hidden">
      <SettingsNav active={activeTab} onChange={setActiveTab} />
      <div className="flex-1 overflow-hidden bg-[#F8FAFC]">
        {activeTab === 'meu-salao'    && <SectionMeuSalao />}
        {activeTab === 'horarios'     && <SectionHorarios />}
        {activeTab === 'notificacoes' && <SectionNotificacoes />}
        {activeTab === 'pagamentos'   && <SectionPagamentos />}
        {activeTab === 'site-booking' && <SectionSiteBooking />}
        {activeTab === 'plano'        && <SectionPlano />}
        {activeTab === 'api'          && <SectionApi />}
        {activeTab === 'lgpd'         && <SectionLgpd />}
      </div>
    </div>
  )
}
