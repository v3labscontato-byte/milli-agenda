import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { assertTransition } from '@milli/business-rules'
import { AppointmentStatus } from '@milli/shared-types'
import { CreateAppointmentDto } from './dto/create-appointment.dto'

@Injectable()
export class AgendaService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, filters: { date?: string; professionalId?: string }) {
    const where: Record<string, unknown> = { tenantId }
    if (filters.date) {
      const d = new Date(filters.date)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      where.startAt = { gte: d, lt: next }
    }
    if (filters.professionalId) where.professionalId = filters.professionalId
    return this.db.appointment.findMany({
      where,
      include: { client: true, professional: true, service: true },
      orderBy: { startAt: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const appt = await this.db.appointment.findFirst({
      where: { id, tenantId },
      include: { client: true, professional: true, service: true },
    })
    if (!appt) throw new NotFoundException('Appointment not found')
    return appt
  }

  async create(tenantId: string, dto: CreateAppointmentDto) {
    const endAt = new Date(dto.startAt)
    endAt.setMinutes(endAt.getMinutes() + dto.durationMin)
    return this.db.appointment.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        professionalId: dto.professionalId,
        serviceId: dto.serviceId,
        startAt: new Date(dto.startAt),
        endAt,
        notes: dto.notes,
      },
    })
  }

  async transition(tenantId: string, id: string, toStatus: AppointmentStatus) {
    const appt = await this.findOne(tenantId, id)
    try {
      assertTransition(appt.status as AppointmentStatus, toStatus)
    } catch (e) {
      throw new BadRequestException((e as Error).message)
    }
    return this.db.appointment.update({
      where: { id },
      data: { status: toStatus },
    })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.db.appointment.delete({ where: { id } })
  }
}
