import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { getAvailableSlots } from '@milli/business-rules'
import { CreateProfissionalDto } from './dto/create-profissional.dto'

@Injectable()
export class ProfissionaisService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(tenantId: string) {
    const professionals = await this.db.professional.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return Promise.all(
      professionals.map(async (prof) => {
        const completed = await this.db.appointment.findMany({
          where: { tenantId, professionalId: prof.id, status: 'COMPLETED' },
          include: { service: { select: { name: true, price: true } } },
          orderBy: { startAt: 'desc' },
        })

        const monthAppts = await this.db.appointment.findMany({
          where: {
            tenantId,
            professionalId: prof.id,
            status: { in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'] },
            startAt: { gte: startOfMonth, lte: endOfMonth },
          },
          include: { service: { select: { name: true, price: true } } },
        })

        const allAppts = await this.db.appointment.findMany({
          where: { tenantId, professionalId: prof.id },
          select: { status: true },
        })

        const totalAgendados  = allAppts.length
        const totalFinalizados = allAppts.filter((a) => a.status === 'COMPLETED').length
        const totalPendentes  = allAppts.filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).length
        const totalCancelados = allAppts.filter((a) => a.status === 'CANCELLED').length

        const completedMonth = monthAppts.filter((a) => a.status === 'COMPLETED')
        const commissionPct = Number(prof.commissionPct ?? 0)

        const totalVisits = completed.length
        const totalFaturamento = completed.reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0)
        const ticketMedio = totalVisits > 0 ? totalFaturamento / totalVisits : 0

        const agendMes = monthAppts.length
        const fatMes = completedMonth.reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0)
        const commissionMes = (fatMes * commissionPct) / 100

        const monthlyHistory: {
          mes: string
          totalAgendamentos: number
          finalizados: number
          pendentes: number
          cancelados: number
          faturamento: number
          comissao: number
        }[] = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const start = new Date(d.getFullYear(), d.getMonth(), 1)
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
          const allMonth = await this.db.appointment.findMany({
            where: { tenantId, professionalId: prof.id, startAt: { gte: start, lte: end } },
            include: { service: { select: { price: true } } },
          })
          const finalizados = allMonth.filter((a) => a.status === 'COMPLETED')
          const pendentes = allMonth.filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status))
          const cancelados = allMonth.filter((a) => a.status === 'CANCELLED')
          const fat = finalizados.reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0)
          monthlyHistory.push({
            mes: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            totalAgendamentos: allMonth.length,
            finalizados: finalizados.length,
            pendentes: pendentes.length,
            cancelados: cancelados.length,
            faturamento: fat,
            comissao: (fat * commissionPct) / 100,
          })
        }

        return {
          ...prof,
          metrics: { totalVisits, totalFaturamento, ticketMedio, agendMes, fatMes, commissionMes, monthlyHistory, totalAgendados, totalFinalizados, totalPendentes, totalCancelados },
        }
      }),
    )
  }

  async getAppointmentsByMonth(tenantId: string, professionalId: string, month: string) {
    const [year, m] = month.split('-').map(Number)
    const start = new Date(year, m - 1, 1)
    const end = new Date(year, m, 0, 23, 59, 59)
    const appts = await this.db.appointment.findMany({
      where: { tenantId, professionalId, startAt: { gte: start, lte: end } },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true, price: true } },
      },
      orderBy: { startAt: 'asc' },
    })
    const pad = (n: number) => String(n).padStart(2, '0')
    return appts.map((a) => {
      const startAt = new Date(a.startAt)
      return {
        id: a.id,
        date: a.startAt.toISOString().slice(0, 10),
        startTime: `${pad(startAt.getUTCHours())}:${pad(startAt.getUTCMinutes())}`,
        client: a.client?.name ?? '—',
        service: a.service?.name ?? '—',
        value: Number(a.service?.price ?? 0),
        status: a.status,
      }
    })
  }

  async findOne(tenantId: string, id: string) {
    const prof = await this.db.professional.findFirst({ where: { id, tenantId } })
    if (!prof) throw new NotFoundException('Professional not found')
    return prof
  }

  async disponibilidade(tenantId: string, id: string, date: string, durationMin: number) {
    const prof = await this.findOne(tenantId, id)
    const dateObj = new Date(date)

    const [schedules, appointments, tenant] = await Promise.all([
      this.db.schedule.findMany({ where: { tenantId, professionalId: id, active: true } }),
      this.db.appointment.findMany({
        where: {
          tenantId,
          professionalId: id,
          startAt: { gte: dateObj, lt: new Date(dateObj.getTime() + 86_400_000) },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        select: { startAt: true, endAt: true },
      }),
      this.db.tenant.findUnique({
        where: { id: tenantId },
        select: { slotGapMinutes: true, minAdvanceHours: true, maxAdvanceDays: true },
      }),
    ])

    const slotGapMinutes = tenant?.slotGapMinutes ?? 30
    const minAdvanceHours = tenant?.minAdvanceHours ?? 0
    const maxAdvanceDays = tenant?.maxAdvanceDays ?? 60

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today.getTime() + maxAdvanceDays * 86_400_000)
    if (dateObj > maxDate) return []

    // Fallback: when no Schedule records exist, derive availability from workDays/workStart/workEnd
    const effectiveSchedules =
      schedules.length > 0
        ? schedules
        : prof.workDays.map((d) => ({
            dayOfWeek: d,
            startTime: prof.workStart ?? '08:00',
            endTime: prof.workEnd ?? '18:00',
          }))

    const allSlots = getAvailableSlots(dateObj, effectiveSchedules, appointments, durationMin, slotGapMinutes)

    if (minAdvanceHours === 0) return allSlots

    const earliest = new Date(Date.now() + minAdvanceHours * 3_600_000)
    return allSlots.filter((s) => s.startAt >= earliest)
  }

  create(tenantId: string, dto: CreateProfissionalDto) {
    return this.db.professional.create({ data: { tenantId, ...dto } })
  }

  async update(tenantId: string, id: string, dto: Partial<CreateProfissionalDto>) {
    await this.findOne(tenantId, id)
    return this.db.professional.update({
      where: { id },
      data: {
        ...(dto.name          !== undefined && { name: dto.name }),
        ...(dto.phone         !== undefined && { phone: dto.phone }),
        ...(dto.email         !== undefined && { email: dto.email }),
        ...(dto.specialty     !== undefined && { specialty: dto.specialty }),
        ...(dto.active        !== undefined && { active: dto.active }),
        ...(dto.commissionPct !== undefined && { commissionPct: dto.commissionPct }),
        ...(dto.workDays      !== undefined && { workDays: dto.workDays }),
        ...(dto.workStart     !== undefined && { workStart: dto.workStart }),
        ...(dto.workEnd       !== undefined && { workEnd: dto.workEnd }),
        ...(dto.cpf           !== undefined && { cpf: dto.cpf }),
        ...(dto.birthDate     !== undefined && { birthDate: dto.birthDate }),
        ...(dto.vinculo          !== undefined && { vinculo: dto.vinculo }),
        ...(dto.enabledServices       !== undefined && { enabledServices: dto.enabledServices }),
        ...(dto.allowSimultaneous     !== undefined && { allowSimultaneous: dto.allowSimultaneous }),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    const prof = await this.db.professional.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                startAt: { gte: new Date() },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
              },
            },
          },
        },
      },
    })
    if (!prof) throw new NotFoundException('Professional not found')
    if (prof._count.appointments > 0) {
      throw new ConflictException('Este profissional possui agendamentos futuros e não pode ser excluído.')
    }
    return this.db.professional.delete({ where: { id } })
  }

  getRoles(tenantId: string) {
    return this.db.professionalRole.findMany({
      where: { tenantId, status: true },
      orderBy: { order: 'asc' },
    })
  }

  createRole(tenantId: string, dto: { name: string; description?: string }) {
    return this.db.professionalRole.create({
      data: { tenantId, name: dto.name, description: dto.description },
    })
  }

  async updateRole(tenantId: string, id: string, dto: { name?: string; description?: string; order?: number }) {
    const role = await this.db.professionalRole.findFirst({ where: { id, tenantId } })
    if (!role) throw new NotFoundException('Role not found')
    return this.db.professionalRole.update({ where: { id }, data: dto })
  }

  async deleteRole(tenantId: string, id: string) {
    const role = await this.db.professionalRole.findFirst({ where: { id, tenantId } })
    if (!role) throw new NotFoundException('Role not found')
    return this.db.professionalRole.update({ where: { id }, data: { status: false } })
  }

  getSpecialties(tenantId: string) {
    return this.db.specialty.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        professionals: {
          include: { professional: { select: { id: true, name: true } } },
        },
      },
    })
  }

  async createSpecialty(tenantId: string, name: string, professionalIds: string[]) {
    const specialty = await this.db.specialty.create({ data: { tenantId, name } })
    if (professionalIds.length > 0) {
      await this.db.professionalSpecialty.createMany({
        data: professionalIds.map(professionalId => ({ professionalId, specialtyId: specialty.id })),
      })
    }
    return specialty
  }

  async updateSpecialties(tenantId: string, professionalId: string, specialtyIds: string[]) {
    await this.db.professionalSpecialty.deleteMany({ where: { professionalId } })
    if (specialtyIds.length > 0) {
      await this.db.professionalSpecialty.createMany({
        data: specialtyIds.map(specialtyId => ({ professionalId, specialtyId })),
      })
    }
    return this.findOne(tenantId, professionalId)
  }

  async updateSpecialty(tenantId: string, id: string, name: string) {
    const sp = await this.db.specialty.findFirst({ where: { id, tenantId } })
    if (!sp) throw new NotFoundException('Specialty not found')
    return this.db.specialty.update({ where: { id }, data: { name } })
  }

  async deleteSpecialty(tenantId: string, id: string) {
    const sp = await this.db.specialty.findFirst({ where: { id, tenantId } })
    if (!sp) throw new NotFoundException('Specialty not found')
    return this.db.specialty.delete({ where: { id } })
  }
}
