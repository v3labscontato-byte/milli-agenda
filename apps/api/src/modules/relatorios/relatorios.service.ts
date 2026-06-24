import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { AppointmentStatus, PaymentStatus } from '@milli/shared-types'

@Injectable()
export class RelatoriosService {
  constructor(private readonly db: DatabaseService) {}

  async kpis(tenantId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date()
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const [totalAppts, completedAppts, cancelledAppts, todayRevenue, totalClients] =
      await Promise.all([
        this.db.appointment.count({
          where: { tenantId, startAt: { gte: dayStart, lte: dayEnd } },
        }),
        this.db.appointment.count({
          where: { tenantId, status: AppointmentStatus.COMPLETED, startAt: { gte: dayStart, lte: dayEnd } },
        }),
        this.db.appointment.count({
          where: { tenantId, status: AppointmentStatus.CANCELLED, startAt: { gte: dayStart, lte: dayEnd } },
        }),
        this.db.payment.aggregate({
          where: { tenantId, status: PaymentStatus.PAID, paidAt: { gte: dayStart, lte: dayEnd } },
          _sum: { amount: true },
        }),
        this.db.client.count({ where: { tenantId } }),
      ])

    const occupancyRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0

    return {
      date: dayStart,
      totalAppointments: totalAppts,
      completedAppointments: completedAppts,
      cancelledAppointments: cancelledAppts,
      occupancyRate,
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      totalClients,
    }
  }

  async receita(tenantId: string, from: string, to: string) {
    const payments = await this.db.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.PAID,
        paidAt: { gte: new Date(from), lte: new Date(to) },
      },
      select: { amount: true, method: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })

    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
    return { from, to, total, payments }
  }

  async ocupacao(tenantId: string, from: string, to: string) {
    const appts = await this.db.appointment.groupBy({
      by: ['status'],
      where: { tenantId, startAt: { gte: new Date(from), lte: new Date(to) } },
      _count: true,
    })

    const total = appts.reduce((s, a) => s + a._count, 0)
    return {
      from,
      to,
      total,
      byStatus: appts.map((a) => ({ status: a.status, count: a._count })),
    }
  }
}
