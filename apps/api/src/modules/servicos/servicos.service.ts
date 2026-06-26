import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateServicoDto } from './dto/create-servico.dto'

@Injectable()
export class ServicosService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string) {
    return this.db.service.findMany({
      where: { tenantId },
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

  getCategories(tenantId: string) {
    return this.db.serviceCategory.findMany({
      where: { tenantId, status: true },
      orderBy: { order: 'asc' },
    })
  }

  createCategory(tenantId: string, dto: { name: string; color?: string }) {
    return this.db.serviceCategory.create({
      data: { tenantId, name: dto.name, color: dto.color ?? '#2563EB' },
    })
  }

  async updateCategory(tenantId: string, id: string, dto: { name?: string; color?: string; order?: number }) {
    const cat = await this.db.serviceCategory.findFirst({ where: { id, tenantId } })
    if (!cat) throw new NotFoundException('Category not found')
    return this.db.serviceCategory.update({ where: { id }, data: dto })
  }

  async deleteCategory(tenantId: string, id: string) {
    const cat = await this.db.serviceCategory.findFirst({ where: { id, tenantId } })
    if (!cat) throw new NotFoundException('Category not found')
    return this.db.serviceCategory.update({ where: { id }, data: { status: false } })
  }
}
