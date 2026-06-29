import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { assertTransition } from '@milli/business-rules'
import { AppointmentStatus } from '@milli/shared-types'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'

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
        ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
        ...(filters.to   ? { lte: new Date(`${filters.to}T23:59:59.999Z`)   } : {}),
      }
    }

    if (filters.professionalId) where.professionalId = filters.professionalId
    if (filters.status)         where.status         = filters.status

    return this.db.appointment.findMany({
      where,
      select: {
        id: true,
        clientId: true,
        professionalId: true,
        serviceId: true,
        commandId: true,
        status: true,
        startAt: true,
        endAt: true,
        notes: true,
        client: { select: { name: true, phone: true } },
        service: { select: { name: true, durationMin: true, price: true } },
        professional: { select: { name: true, specialty: true } },
      },
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
    let clientId = dto.clientId
    if (!clientId) {
      let client: { id: string } | null = null

      if (dto.clientPhone) {
        client = await this.db.client.findFirst({
          where: { tenantId, phone: dto.clientPhone },
        })
      }

      if (!client) {
        client = await this.db.client.create({
          data: { tenantId, name: dto.clientName, phone: dto.clientPhone || null },
        })
      }
      clientId = client.id
    }

    const startAt = this.parseDateTime(dto.date, dto.startTime)
    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + (dto.durationMin ?? 60))

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
    })
  }

  async update(tenantId: string, id: string, dto: UpdateAppointmentDto) {
    await this.findOne(tenantId, id)
    const data: Record<string, unknown> = {}
    if (dto.clientId)            data.clientId = dto.clientId
    if (dto.professionalId)      data.professionalId = dto.professionalId
    if (dto.serviceId)           data.serviceId = dto.serviceId
    if (dto.notes !== undefined) data.notes = dto.notes
    if (dto.status)              data.status = dto.status
    if (dto.cancelReason)        data.notes = dto.cancelReason
    if (dto.date && dto.startTime) {
      const startAt = this.parseDateTime(dto.date, dto.startTime)
      const endAt = new Date(startAt)
      endAt.setMinutes(endAt.getMinutes() + (dto.durationMin ?? 60))
      data.startAt = startAt
      data.endAt = endAt
    }
    return this.db.appointment.update({ where: { id }, data })
  }

  private parseDateTime(date: string, time: string): Date {
    const [h, m] = time.split(':').map(Number)
    return new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
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
