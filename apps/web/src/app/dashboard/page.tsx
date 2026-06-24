import { mockAppointments, mockKpis } from '@/lib/mock-data'
import KpiStrip from '@/components/kpi-strip'
import Upcoming from '@/components/upcoming'
import AgendaTable from '@/components/agenda-table'
import BookingsChart from '@/components/charts/bookings-chart'
import WeeklyChart from '@/components/charts/weekly-chart'
import ServicesChart from '@/components/charts/services-chart'
import VolumeChart from '@/components/charts/volume-chart'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const upcoming = mockAppointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
  )

  return (
    <div className="space-y-8 pb-10">

      {/* ① KPI Strip */}
      <KpiStrip kpis={mockKpis} />

      {/* ② Analytics 2×2 */}
      <section aria-labelledby="analytics-heading">
        <div className="mb-4">
          <h2 id="analytics-heading" className="text-[16px] font-medium leading-[1.4] text-[#0F172A]">
            Analytics
          </h2>
          <p className="mt-0.5 text-[12px] text-[#475569]">Desempenho e tendências do salão</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <BookingsChart />
          <ServicesChart />
          <WeeklyChart />
          <VolumeChart />
        </div>
      </section>

      {/* ④ Agenda de Hoje (flex-1) + Próximos Horários (w-80 fixo) */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <AgendaTable appointments={mockAppointments} />
        </div>
        <div className="w-full xl:w-80 xl:shrink-0">
          <Upcoming appointments={upcoming} />
        </div>
      </div>

    </div>
  )
}
