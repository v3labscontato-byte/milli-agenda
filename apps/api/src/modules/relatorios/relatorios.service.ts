import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { AppointmentStatus, PaymentStatus } from '@milli/shared-types'

@Injectable()
export class RelatoriosService {
  constructor(private readonly db: DatabaseService) {}

  private defaultRange(from?: string, to?: string) {
    const dateTo = to ? new Date(to) : new Date()
    const dateFrom = from ? new Date(from) : new Date(dateTo.getFullYear(), dateTo.getMonth(), 1)
    return { dateFrom, dateTo }
  }

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

  async receita(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const payments = await this.db.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.PAID,
        paidAt: { gte: dateFrom, lte: dateTo },
      },
      select: { amount: true, method: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })

    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
    return { from: dateFrom, to: dateTo, total, payments }
  }

  async ocupacao(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const appts = await this.db.appointment.groupBy({
      by: ['status'],
      where: { tenantId, startAt: { gte: dateFrom, lte: dateTo } },
      _count: true,
    })

    const total = appts.reduce((s, a) => s + a._count, 0)
    return {
      from: dateFrom,
      to: dateTo,
      total,
      byStatus: appts.map((a) => ({ status: a.status, count: a._count })),
    }
  }

  async professionals(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const profs = await this.db.professional.findMany({
      where: { tenantId, active: true },
      select: {
        id: true,
        name: true,
        specialty: true,
        appointments: {
          where: {
            startAt: { gte: dateFrom, lte: dateTo },
            status: AppointmentStatus.COMPLETED,
          },
          select: {
            id: true,
            command: {
              select: {
                payments: {
                  where: { status: PaymentStatus.PAID },
                  select: { amount: true },
                },
              },
            },
          },
        },
      },
    })

    return profs.map((p) => {
      const completedAppts = p.appointments.length
      const revenue = p.appointments.reduce((sum, appt) => {
        const paid = (appt.command?.payments ?? []).reduce((s, pay) => s + Number(pay.amount), 0)
        return sum + paid
      }, 0)
      return { id: p.id, name: p.name, specialty: p.specialty, completedAppts, revenue }
    })
  }
}
