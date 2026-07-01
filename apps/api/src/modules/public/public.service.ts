import { Injectable, NotFoundException } from '@nestjs/common'
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
