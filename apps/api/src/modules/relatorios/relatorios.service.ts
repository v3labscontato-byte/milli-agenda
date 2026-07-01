import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { AppointmentStatus, PaymentStatus } from '@milli/shared-types'

@Injectable()
export class RelatoriosService {
  constructor(private readonly db: DatabaseService) {}

  private defaultRange(from?: string, to?: string) {
    const dateTo = to ? new Date(to + 'T23:59:59.999Z') : new Date()
    const dateFrom = from ? new Date(from) : new Date(dateTo.getFullYear(), dateTo.getMonth(), 1)
    return { dateFrom, dateTo }
  }

  async kpis(tenantId: string, dateStr?: string) {
    // Appointments are stored in UTC; BRT (Brasília) = UTC-3.
    // setHours() on a UTC server would compute midnight UTC, not midnight BRT,
    // so we project to BRT first, find the calendar date, then build UTC boundaries.
    const BRT_OFFSET_MS = 3 * 60 * 60 * 1000
    const now = dateStr ? new Date(dateStr) : new Date()
    const brtNow = new Date(now.getTime() - BRT_OFFSET_MS)
    const y = brtNow.getUTCFullYear()
    const m = brtNow.getUTCMonth()
    const d = brtNow.getUTCDate()
    // BRT midnight = UTC 03:00 of the same calendar day
    const dayStart = new Date(Date.UTC(y, m, d, 3, 0, 0, 0))
    const dayEnd   = new Date(Date.UTC(y, m, d + 1, 3, 0, 0, -1))

    const [totalAppts, completedAppts, cancelledAppts, todayAppts, totalClients] =
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
        this.db.appointment.findMany({
          where: { tenantId, status: AppointmentStatus.COMPLETED, startAt: { gte: dayStart, lte: dayEnd } },
          include: { service: { select: { price: true } } },
        }),
        this.db.client.count({ where: { tenantId } }),
      ])

    const occupancyRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0
    const receitaBruta = todayAppts.reduce((s, a) => s + Number(a.service?.price ?? 0), 0)
    const ticketMedio = completedAppts > 0 ? receitaBruta / completedAppts : 0

    const pendingAppts = await this.db.appointment.findMany({
      where: {
        tenantId,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        startAt: { gte: dayStart, lte: dayEnd },
      },
      include: { service: { select: { price: true } } },
    })
    const todayPending = pendingAppts.reduce((s, a) => s + Number(a.service?.price ?? 0), 0)
    const todayTotal = receitaBruta + todayPending

    return {
      date: dayStart,
      totalAppointments: totalAppts,
      completedAppointments: completedAppts,
      cancelledAppointments: cancelledAppts,
      occupancyRate,
      todayRevenue: receitaBruta,
      todayPending,
      todayTotal,
      totalClients,
      receitaBruta,
      receitaLiquida: receitaBruta,
      despesas: 0,
      lucro: receitaBruta,
      margem: receitaBruta > 0 ? 100 : 0,
      ticketMedio,
      recebido: receitaBruta,
      aReceber: todayPending,
    }
  }

  async receita(tenantId: string, from?: string, to?: string) {
    const default30d = () => { const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0, 0, 0, 0); return d }
    const dateFrom = from ? new Date(from + 'T00:00:00.000Z') : default30d()
    const dateTo = to ? new Date(to + 'T23:59:59.999Z') : new Date()

    const paid = await this.db.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.PAID,
        paidAt: { gte: dateFrom, lte: dateTo },
      },
      select: { amount: true, method: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })

    const total = paid.reduce((s, p) => s + Number(p.amount), 0)

    return {
      from: dateFrom,
      to: dateTo,
      total,
      payments: paid.map((p) => ({
        amount: String(Number(p.amount)),
        method: p.method,
        paidAt: p.paidAt,
      })),
    }
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

    const [profs, paidRecords] = await Promise.all([
      this.db.professional.findMany({
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
      }),
      this.db.commissionPayment.findMany({
        where: { tenantId, period: periodoRef },
        select: { professionalId: true, paidAt: true },
      }),
    ])

    const paidMap = new Map(paidRecords.map((r) => [r.professionalId, r.paidAt]))

    return profs.map((p) => {
      const atendimentos = p.appointments.length
      const receita = p.appointments.reduce((sum, appt) => {
        return sum + (appt.command?.payments ?? []).reduce((s, pay) => s + Number(pay.amount), 0)
      }, 0)
      const pctComissao = Number(p.commissionPct ?? 20)
      const comissaoValue = (receita * pctComissao) / 100
      const paidAt = paidMap.get(p.id) ?? null
      return {
        professionalId: p.id,
        name: p.name,
        atendimentos,
        receita,
        pctComissao,
        comissaoValue,
        periodoRef,
        status: paidAt ? 'PAID' : 'PENDING',
        paidAt,
      }
    })
  }

  async payCommission(tenantId: string, professionalId: string, dto: { period: string; amount: number }) {
    const existing = await this.db.commissionPayment.findFirst({
      where: { tenantId, professionalId, period: dto.period },
    })
    if (existing) return existing
    return this.db.commissionPayment.create({
      data: { tenantId, professionalId, period: dto.period, amount: dto.amount },
    })
  }

  async cashflow(tenantId: string, from?: string, to?: string) {
    const dateFrom = from ? new Date(from + 'T00:00:00.000Z') : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const dateTo = to ? new Date(to + 'T23:59:59.999Z') : new Date()

    const [appts, expenses] = await Promise.all([
      this.db.appointment.findMany({
        where: { tenantId, status: AppointmentStatus.COMPLETED, startAt: { gte: dateFrom, lte: dateTo } },
        include: { service: { select: { price: true } } },
        orderBy: { startAt: 'asc' },
      }),
      this.db.expense.findMany({
        where: { tenantId, data: { gte: dateFrom, lte: dateTo } },
        select: { data: true, valor: true, descricao: true },
      }),
    ])

    const entradasByDay = new Map<string, number>()
    for (const a of appts) {
      const key = a.startAt.toISOString().slice(0, 10)
      entradasByDay.set(key, (entradasByDay.get(key) ?? 0) + Number(a.service?.price ?? 0))
    }

    const saidasByDay = new Map<string, number>()
    const descricaoByDay = new Map<string, string[]>()
    for (const e of expenses) {
      const key = e.data.toISOString().slice(0, 10)
      saidasByDay.set(key, (saidasByDay.get(key) ?? 0) + Number(e.valor))
      descricaoByDay.set(key, [...(descricaoByDay.get(key) ?? []), e.descricao])
    }

    const allDays = new Set([...entradasByDay.keys(), ...saidasByDay.keys()])
    const result: { date: string; dateLabel: string; entradas: number; saidas: number; saldo: number; descricao: string }[] = []
    let saldoAcumulado = 0
    for (const date of [...allDays].sort()) {
      const entradas = entradasByDay.get(date) ?? 0
      const saidas   = saidasByDay.get(date) ?? 0
      saldoAcumulado += entradas - saidas
      const [, m, d] = date.split('-')
      const descricao = (descricaoByDay.get(date) ?? []).join(', ')
      result.push({ date, dateLabel: `${d}/${m}`, entradas, saidas, saldo: saldoAcumulado, descricao })
    }

    return { from: dateFrom, to: dateTo, entries: result }
  }

  async createExpense(tenantId: string, dto: { descricao: string; valor: number; data: string }) {
    return this.db.expense.create({
      data: {
        tenantId,
        descricao: dto.descricao,
        valor: dto.valor,
        data: new Date(dto.data + 'T12:00:00.000Z'),
      },
    })
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

  async paymentsByMethod(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const grouped = await this.db.payment.groupBy({
      by: ['method'],
      where: { tenantId, status: 'PAID', createdAt: { gte: dateFrom, lte: dateTo } },
      _sum: { amount: true },
    })
    return grouped.map((g) => ({
      method: g.method,
      total: Number(g._sum.amount ?? 0),
    }))
  }

  async topServices(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const items = await this.db.commandItem.findMany({
      where: {
        command: { tenantId, status: 'CLOSED' },
        serviceId: { not: null },
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      select: {
        unitPrice: true,
        quantity: true,
        service: { select: { name: true } },
      },
    })

    const map = new Map<string, { nome: string; qtd: number; receita: number }>()
    for (const item of items) {
      const nome = item.service?.name ?? 'Desconhecido'
      const prev = map.get(nome) ?? { nome, qtd: 0, receita: 0 }
      map.set(nome, {
        nome,
        qtd: prev.qtd + item.quantity,
        receita: prev.receita + Number(item.unitPrice) * item.quantity,
      })
    }

    return [...map.values()]
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10)
      .map((s, i) => ({ rank: i + 1, ...s }))
  }

  async listPayments(tenantId: string, from?: string, to?: string) {
    const { dateFrom, dateTo } = this.defaultRange(from, to)
    const payments = await this.db.payment.findMany({
      where: { tenantId, status: 'PAID', createdAt: { gte: dateFrom, lte: dateTo } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        method: true,
        amount: true,
        status: true,
        createdAt: true,
        command: {
          select: {
            client: { select: { name: true } },
            appointments: {
              take: 1,
              select: {
                service:      { select: { name: true } },
                professional: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    return payments.map((p) => ({
      id: p.id,
      method: p.method,
      amount: Number(p.amount),
      status: p.status,
      paidAt: p.createdAt,
      clientName: p.command?.client?.name ?? '—',
      service: p.command?.appointments?.[0]?.service?.name ?? '—',
      professional: p.command?.appointments?.[0]?.professional?.name ?? '—',
    }))
  }

  async createGoal(tenantId: string, dto: { tipo: string; periodo: string; valor: number; dataInicio: string; dataFim: string }) {
    return this.db.goal.create({
      data: {
        tenantId,
        tipo: dto.tipo,
        periodo: dto.periodo,
        valor: dto.valor,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
      },
    })
  }

  async listGoals(tenantId: string) {
    return this.db.goal.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteGoal(tenantId: string, id: string) {
    return this.db.goal.delete({ where: { id, tenantId } })
  }

  async listChartOfAccounts(tenantId: string, period?: string) {
    const p = period ?? new Date().toISOString().slice(0, 7)
    const accounts = await this.db.chartOfAccount.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      include: { entries: { where: { period: p }, take: 1 } },
    })
    return accounts.map((a) => ({
      id: a.id, nome: a.nome, tipo: a.tipo, categoria: a.categoria,
      valorPadrao: Number(a.valorPadrao ?? 0), recorrente: a.recorrente,
      diaPagamento: a.diaPagamento, ativa: a.ativa, period: p,
      entry: a.entries[0]
        ? { id: a.entries[0].id, status: a.entries[0].status, valor: Number(a.entries[0].valor), paidAt: a.entries[0].paidAt }
        : null,
    }))
  }

  async createChartOfAccount(tenantId: string, dto: {
    nome: string; tipo: string; categoria: string;
    valorPadrao?: number; diaPagamento?: number; recorrente?: boolean; ativa?: boolean
  }) {
    return this.db.chartOfAccount.create({
      data: {
        tenantId, nome: dto.nome, tipo: dto.tipo, categoria: dto.categoria,
        valorPadrao: dto.valorPadrao ?? null,
        diaPagamento: dto.diaPagamento ?? 5,
        recorrente: dto.recorrente ?? true,
        ativa: dto.ativa ?? true,
      },
    })
  }

  async deleteChartOfAccount(tenantId: string, id: string) {
    return this.db.chartOfAccount.delete({ where: { id, tenantId } })
  }

  async payChartOfAccountEntry(tenantId: string, id: string, dto: { period: string; valor: number }) {
    const account = await this.db.chartOfAccount.findFirstOrThrow({
      where: { id, tenantId }, select: { nome: true },
    })
    const entry = await this.db.chartOfAccountEntry.upsert({
      where: { chartOfAccountId_period: { chartOfAccountId: id, period: dto.period } },
      create: { tenantId, chartOfAccountId: id, period: dto.period, valor: dto.valor, status: 'PAID', paidAt: new Date() },
      update: { status: 'PAID', valor: dto.valor, paidAt: new Date() },
    })
    const expenseExists = await this.db.expense.findUnique({ where: { chartOfAccountEntryId: entry.id } })
    if (!expenseExists) {
      await this.db.expense.create({
        data: { tenantId, descricao: account.nome, valor: dto.valor, data: new Date(), chartOfAccountEntryId: entry.id },
      })
    }
    return entry
  }
}
