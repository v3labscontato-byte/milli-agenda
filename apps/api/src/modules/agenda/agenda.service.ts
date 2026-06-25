import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { assertTransition } from '@milli/business-rules'
import { AppointmentStatus } from '@milli/shared-types'
import { CreateAppointmentDto } from './dto/create-appointment.dto'

type Filters = {
  from?: string
  to?: string
  professionalId?: string
  status?: string
}

@Injectable()
export class AgendaService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, filters: Filters) {
    const where: Record<string, unknown> = { tenantId }

    if (filters.from || filters.to) {
      where.startAt = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to   ? { lte: new Date(filters.to)   } : {}),
      }
    }

    if (filters.professionalId) where.professionalId = filters.professionalId
    if (filters.status)         where.status         = filters.status

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
    // Resolver startAt
    let startAtIso: string
    if (dto.startAt) {
      startAtIso = dto.startAt
    } else if (dto.date && dto.startTime) {
      startAtIso = `${dto.date}T${dto.startTime}:00`
    } else {
      throw new BadRequestException('Informe startAt ou date+startTime')
    }
    const startAt = new Date(startAtIso)
    const duration = dto.durationMin ?? 60
    const endAt = new Date(startAt.getTime() + duration * 60_000)

    // Resolver clientId (existente ou find-or-create por nome/telefone)
    let clientId = dto.clientId
    if (!clientId) {
      if (!dto.clientName) throw new BadRequestException('Informe clientId ou clientName')
      const existing = dto.clientPhone
        ? await this.db.client.findFirst({ where: { tenantId, phone: dto.clientPhone } })
        : await this.db.client.findFirst({ where: { tenantId, name: dto.clientName } })
      if (existing) {
        clientId = existing.id
      } else {
        const created = await this.db.client.create({
          data: { tenantId, name: dto.clientName, phone: dto.clientPhone ?? null },
        })
        clientId = created.id
      }
    }

    return this.db.appointment.create({
      data: {
        tenantId,
        clientId,
        professionalId: dto.professionalId,
        serviceId: dto.serviceId,
        startAt,
        endAt,
        notes: dto.notes,
      },
      include: { client: true, professional: true, service: true },
    })
  }

  async update(tenantId: string, id: string, dto: Partial<CreateAppointmentDto>) {
    await this.findOne(tenantId, id)
    const data: Record<string, unknown> = {}
    if (dto.clientId)       data.clientId = dto.clientId
    if (dto.professionalId) data.professionalId = dto.professionalId
    if (dto.serviceId)      data.serviceId = dto.serviceId
    if (dto.notes !== undefined) data.notes = dto.notes
    if (dto.startAt) {
      data.startAt = new Date(dto.startAt)
      const endAt = new Date(dto.startAt)
      endAt.setMinutes(endAt.getMinutes() + (dto.durationMin ?? 60))
      data.endAt = endAt
    }
    return this.db.appointment.update({ where: { id }, data })
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
