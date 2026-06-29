import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateClienteDto } from './dto/create-cliente.dto'

@Injectable()
export class ClientesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(tenantId: string) {
    const clients = await this.db.client.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(
      clients.map(async (client) => {
        const appointments = await this.db.appointment.findMany({
          where: { tenantId, clientId: client.id },
          include: { service: { select: { name: true, price: true } } },
          orderBy: { startAt: 'desc' },
        })

        const completed = appointments.filter((a) => a.status === 'COMPLETED')
        const upcoming = appointments
          .filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.startAt) > new Date())
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

        const totalSpent = completed.reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0)
        const visits = completed.length
        const ticketMedio = visits > 0 ? totalSpent / visits : 0

        const lastAppointment = completed[0] ?? null
        const nextAppointment = upcoming[0] ?? null

        return {
          ...client,
          metrics: {
            visits,
            totalSpent,
            ticketMedio,
            lastAppointmentAt: lastAppointment?.startAt ?? null,
            nextAppointmentAt: nextAppointment?.startAt ?? null,
            lastService: lastAppointment?.service?.name ?? null,
            history: appointments.map((a) => ({
              id: a.id,
              startAt: a.startAt,
              status: a.status,
              serviceName: a.service?.name ?? '',
              servicePrice: Number(a.service?.price ?? 0),
            })),
          },
        }
      }),
    )
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.db.client.findFirst({ where: { id, tenantId } })
    if (!client) throw new NotFoundException('Client not found')
    return client
  }

  historico(tenantId: string, id: string) {
    return this.db.appointment.findMany({
      where: { tenantId, clientId: id },
      include: { service: true, professional: true },
      orderBy: { startAt: 'desc' },
    })
  }

  create(tenantId: string, dto: CreateClienteDto) {
    return this.db.client.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone || null,
        email: dto.email || null,
        cpf: dto.cpf || null,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        notes: dto.notes || null,
        favoriteProfessionalId: dto.favoriteProfessionalId || null,
      },
    })
  }

  async update(tenantId: string, id: string, dto: Partial<CreateClienteDto>) {
    await this.findOne(tenantId, id)
    return this.db.client.update({ where: { id }, data: dto })
  }

  search(tenantId: string, q: string) {
    if (!q || q.trim().length < 2) return Promise.resolve([])
    return this.db.client.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, name: true, phone: true, clientNumber: true },
      take: 10,
      orderBy: { name: 'asc' },
    })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    const linked = await this.db.appointment.count({ where: { tenantId, clientId: id } })
    if (linked > 0) throw new ConflictException('Cliente possui agendamentos vinculados e não pode ser excluído')
    return this.db.client.delete({ where: { id } })
  }
}
