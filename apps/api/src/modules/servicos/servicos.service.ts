import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateServicoDto } from './dto/create-servico.dto'

@Injectable()
export class ServicosService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string) {
    return this.db.service.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const svc = await this.db.service.findFirst({ where: { id, tenantId } })
    if (!svc) throw new NotFoundException('Service not found')
    return svc
  }

  create(tenantId: string, dto: CreateServicoDto) {
    return this.db.service.create({ data: { tenantId, ...dto } })
  }

  async update(tenantId: string, id: string, dto: Partial<CreateServicoDto>) {
    await this.findOne(tenantId, id)
    return this.db.service.update({ where: { id }, data: dto })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.db.service.update({ where: { id }, data: { active: false } })
  }
}
