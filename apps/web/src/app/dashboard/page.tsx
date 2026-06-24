import { mockKpis } from '@/lib/mock-data'
import KpiStrip from '@/components/kpi-strip'
import BookingsChart from '@/components/charts/bookings-chart'
import WeeklyChart from '@/components/charts/weekly-chart'
import ServicesChart from '@/components/charts/services-chart'
import VolumeChart from '@/components/charts/volume-chart'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
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


    </div>
  )
}
