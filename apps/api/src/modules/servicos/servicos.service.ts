import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateServicoDto } from './dto/create-servico.dto'

@Injectable()
export class ServicosService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(tenantId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const services = await this.db.service.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    })

    return Promise.all(
      services.map(async (service) => {
        const monthAppts = await this.db.appointment.findMany({
          where: {
            tenantId,
            serviceId: service.id,
            status: { in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'] },
            startAt: { gte: startOfMonth, lte: endOfMonth },
          },
        })
        const completedMonth = monthAppts.filter(a => a.status === 'COMPLETED')

        const monthlyHistory: {
          mes: string
          totalAgendamentos: number
          finalizados: number
          pendentes: number
          cancelados: number
          faturamento: number
        }[] = []

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const start = new Date(d.getFullYear(), d.getMonth(), 1)
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
          const allMonth = await this.db.appointment.findMany({
            where: { tenantId, serviceId: service.id, startAt: { gte: start, lte: end } },
          })
          const fin = allMonth.filter(a => a.status === 'COMPLETED')
          const pen = allMonth.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status))
          const can = allMonth.filter(a => a.status === 'CANCELLED')
          monthlyHistory.push({
            mes: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            totalAgendamentos: allMonth.length,
            finalizados: fin.length,
            pendentes: pen.length,
            cancelados: can.length,
            faturamento: fin.length * Number(service.price),
          })
        }

        return {
          ...service,
          metrics: {
            agendMes: monthAppts.length,
            fatMes: completedMonth.length * Number(service.price),
            monthlyHistory,
          },
        }
      })
    )
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
