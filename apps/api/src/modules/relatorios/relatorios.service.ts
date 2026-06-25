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
    const receitaBruta = Number(todayRevenue._sum.amount ?? 0)
    const ticketMedio = completedAppts > 0 ? receitaBruta / completedAppts : 0

    return {
      date: dayStart,
      totalAppointments: totalAppts,
      completedAppointments: completedAppts,
      cancelledAppointments: cancelledAppts,
      occupancyRate,
      todayRevenue: receitaBruta,
      totalClients,
      receitaBruta,
      receitaLiquida: receitaBruta,
      despesas: 0,
      lucro: receitaBruta,
      margem: receitaBruta > 0 ? 100 : 0,
      ticketMedio,
      recebido: receitaBruta,
      aReceber: 0,
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

  async commissions(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const periodoRef = `${dateFrom.toISOString().slice(0, 7)}`

    const profs = await this.db.professional.findMany({
      where: { tenantId, active: true },
      select: {
        id: true,
        name: true,
        commissionPct: true,
        appointments: {
          where: { startAt: { gte: dateFrom, lte: dateTo }, status: AppointmentStatus.COMPLETED },
          select: {
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
      const atendimentos = p.appointments.length
      const receita = p.appointments.reduce((sum, appt) => {
        return sum + (appt.command?.payments ?? []).reduce((s, pay) => s + Number(pay.amount), 0)
      }, 0)
      const pctComissao = Number(p.commissionPct ?? 20)
      const comissaoValue = (receita * pctComissao) / 100
      return {
        professionalId: p.id,
        name: p.name,
        atendimentos,
        receita,
        pctComissao,
        comissaoValue,
        periodoRef,
        status: 'PENDING',
      }
    })
  }

  async cashflow(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)

    const payments = await this.db.payment.findMany({
      where: { tenantId, status: PaymentStatus.PAID, paidAt: { gte: dateFrom, lte: dateTo } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })

    const byDay = new Map<string, number>()
    for (const p of payments) {
      if (!p.paidAt) continue
      const key = p.paidAt.toISOString().slice(0, 10)
      byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount))
    }

    const result: { date: string; dateLabel: string; entradas: number; saidas: number; saldo: number }[] = []
    let saldoAcumulado = 0
    for (const [date, entradas] of [...byDay.entries()].sort()) {
      saldoAcumulado += entradas
      const [, m, d] = date.split('-')
      result.push({ date, dateLabel: `${d}/${m}`, entradas, saidas: 0, saldo: saldoAcumulado })
    }

    return { from: dateFrom, to: dateTo, entries: result }
  }

  async overdue(tenantId: string) {
    const now = new Date()
    const appts = await this.db.appointment.findMany({
      where: {
        tenantId,
        endAt: { lt: now },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN] },
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true, price: true } },
      },
      orderBy: { startAt: 'asc' },
    })

    return appts.map((a) => ({
      id: a.id,
      clientName: a.client.name,
      service: a.service.name,
      value: Number(a.service.price),
      date: a.startAt,
      daysOverdue: Math.floor((now.getTime() - a.endAt.getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }
}
