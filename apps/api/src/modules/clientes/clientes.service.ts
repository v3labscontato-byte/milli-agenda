import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateClienteDto } from './dto/create-cliente.dto'

@Injectable()
export class ClientesService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string) {
    return this.db.client.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
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
