import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { ProfissionaisService } from '../profissionais/profissionais.service'
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto'

@Injectable()
export class PublicService {
  constructor(
    private readonly db: DatabaseService,
    private readonly profissionaisService: ProfissionaisService,
  ) {}

  private async resolveTenantId(slug: string): Promise<string> {
    const tenant = await this.db.tenant.findUnique({ where: { slug }, select: { id: true } })
    if (!tenant) throw new NotFoundException('Salão não encontrado')
    return tenant.id
  }

  async getServices(slug: string, categoryId?: string) {
    const tenantId = await this.resolveTenantId(slug)
    return this.db.service.findMany({
      where: { tenantId, active: true, ...(categoryId ? { categoryId } : {}) },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        price: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ category: { order: 'asc' } }, { name: 'asc' }],
    })
  }

  async getProfessionals(slug: string, serviceId?: string) {
    const tenantId = await this.resolveTenantId(slug)
    return this.db.professional.findMany({
      where: {
        tenantId,
        active: true,
        ...(serviceId ? { enabledServices: { has: serviceId } } : {}),
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        avatarUrl: true,
        workDays: true,
      },
      orderBy: { name: 'asc' },
    })
  }

  async getSlots(slug: string, professionalId: string, date: string, durationMin: number) {
    const tenantId = await this.resolveTenantId(slug)
    return this.profissionaisService.disponibilidade(tenantId, professionalId, date, durationMin)
  }

  async getAppointmentsByPhone(slug: string, phone: string) {
    const tenantId = await this.resolveTenantId(slug)
    const digits = phone.replace(/\D/g, '')

    let client = await this.db.client.findFirst({
      where: { tenantId, phone },
      select: { id: true, name: true, phone: true, email: true },
    })
    if (!client && digits.length >= 8) {
      const all = await this.db.client.findMany({
        where: { tenantId },
        select: { id: true, name: true, phone: true, email: true },
      })
      const match = all.find((c) => (c.phone ?? '').replace(/\D/g, '') === digits)
      client = match ?? null
    }

    if (!client) return { client: null, appointments: [] }

    const appointments = await this.db.appointment.findMany({
      where: { tenantId, clientId: client.id },
      select: {
        id: true, status: true, startAt: true, endAt: true, notes: true,
        service: { select: { name: true, durationMin: true, price: true } },
        professional: { select: { name: true, avatarUrl: true, specialty: true } },
      },
      orderBy: { startAt: 'desc' },
    })

    return { client, appointments }
  }

  async getAppointmentById(slug: string, id: string) {
    const tenantId = await this.resolveTenantId(slug)
    const appt = await this.db.appointment.findFirst({
      where: { id, tenantId },
      select: {
        id: true, status: true, startAt: true, endAt: true, notes: true,
        service: { select: { name: true, durationMin: true, price: true } },
        professional: { select: { name: true, avatarUrl: true, specialty: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
    })
    if (!appt) throw new NotFoundException('Agendamento não encontrado')
    return appt
  }

  async cancelAppointment(slug: string, id: string, phone: string) {
    const tenantId = await this.resolveTenantId(slug)
    const digits = phone.replace(/\D/g, '')

    const appt = await this.db.appointment.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true, startAt: true, client: { select: { phone: true } } },
    })
    if (!appt) throw new NotFoundException('Agendamento não encontrado')

    const clientDigits = (appt.client?.phone ?? '').replace(/\D/g, '')
    if (!clientDigits || clientDigits !== digits) {
      throw new NotFoundException('Agendamento não encontrado')
    }

    if (appt.status === 'CANCELLED') {
      throw new BadRequestException('Agendamento já foi cancelado.')
    }

    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: { cancellationMinHours: true, cancellationFeePercent: true },
    })
    const minHours = tenant?.cancellationMinHours ?? 24
    const feePercent = tenant?.cancellationFeePercent ?? 0
    const hoursUntil = (appt.startAt.getTime() - Date.now()) / 3_600_000

    if (hoursUntil < minHours) {
      const feeMsg = feePercent > 0 ? ` Taxa de cancelamento: ${feePercent}% do valor do serviço.` : ''
      throw new BadRequestException(
        `Cancelamentos devem ser feitos com pelo menos ${minHours}h de antecedência.${feeMsg}`,
      )
    }

    return this.db.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: { id: true, status: true },
    })
  }

  // TODO: Usado pelo Google OAuth — não exposto via endpoint ainda
  async findOrCreateClientByEmail(tenantId: string, email: string, name: string) {
    const existing = await this.db.client.findFirst({ where: { tenantId, email } })
    if (existing) return existing
    return this.db.client.create({ data: { tenantId, name, email } })
  }

  async createAppointment(slug: string, dto: CreatePublicAppointmentDto) {
    const tenantId = await this.resolveTenantId(slug)

    const service = await this.db.service.findFirst({
      where: { id: dto.serviceId, tenantId, active: true },
      select: { id: true, durationMin: true },
    })
    if (!service) throw new NotFoundException('Serviço não encontrado')

    let client = await this.db.client.findFirst({ where: { tenantId, phone: dto.phone } })
    if (!client) {
      client = await this.db.client.create({
        data: { tenantId, name: dto.name, phone: dto.phone, email: dto.email ?? null },
      })
    }

    const [h, m] = dto.time.split(':').map(Number)
    const startAt = new Date(`${dto.date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
    const endAt = new Date(startAt.getTime() + service.durationMin * 60_000)

    return this.db.appointment.create({
      data: {
        tenantId,
        clientId: client.id,
        professionalId: dto.professionalId,
        serviceId: dto.serviceId,
        startAt,
        endAt,
        notes: dto.notes ?? null,
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        client: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, durationMin: true } },
        professional: { select: { id: true, name: true } },
      },
    })
  }
}
