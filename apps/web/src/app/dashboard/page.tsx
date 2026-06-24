import { mockAppointments, mockKpis } from '@/lib/mock-data'
import KpiStrip from '@/components/kpi-strip'
import AppointmentsNow from '@/components/appointments-now'
import Upcoming from '@/components/upcoming'
import AgendaTable from '@/components/agenda-table'

export const metadata = { title: 'Dashboard' }

// Server-rendered date header in Brazilian Portuguese
function todayLabel(): { date: string; weekday: string } {
  const now = new Date()
  const date = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  // Capitalise first letter
  return {
    date: date.charAt(0).toUpperCase() + date.slice(1),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  }
}

export default function DashboardPage() {
  const { date, weekday } = todayLabel()

  // Partition mock data into sections — filtering is trivial here but the
  // boundary belongs in the page, not inside the components themselves
  const activeNow = mockAppointments.filter(
    (a) => a.status === 'IN_SERVICE' || a.status === 'AWAITING_PAYMENT',
  )

  const upcoming = mockAppointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
  )

  return (
    <div className="space-y-6 pb-10">
      {/* Page heading — lives here, not in Topbar (Topbar is chrome, not content) */}
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-[#0F172A]">
          Hoje, {date}
        </h1>
        <p className="mt-0.5 text-[14px] text-[#64748B]">
          {weekday} · Salão Principal
        </p>
      </div>

      {/* Row 1: KPI strip — gap-px tile pattern (no floating card grid) */}
      <KpiStrip kpis={mockKpis} />

      {/* Row 2: Active appointments + upcoming list
          At xl: AppointmentsNow takes the wider left column;
          Upcoming is a fixed-width sidebar-style list on the right */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <AppointmentsNow appointments={activeNow} />
        <Upcoming appointments={upcoming} />
      </div>

      {/* Row 3: Full agenda table with professional filter */}
      <AgendaTable appointments={mockAppointments} />
    </div>
  )
}
