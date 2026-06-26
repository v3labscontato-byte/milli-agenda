import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { getAvailableSlots } from '@milli/business-rules'
import { CreateProfissionalDto } from './dto/create-profissional.dto'

@Injectable()
export class ProfissionaisService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string) {
    return this.db.professional.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const prof = await this.db.professional.findFirst({ where: { id, tenantId } })
    if (!prof) throw new NotFoundException('Professional not found')
    return prof
  }

  async disponibilidade(tenantId: string, id: string, date: string, durationMin: number) {
    await this.findOne(tenantId, id)
    const dateObj = new Date(date)
    const [schedules, appointments] = await Promise.all([
      this.db.schedule.findMany({ where: { tenantId, professionalId: id, active: true } }),
      this.db.appointment.findMany({
        where: {
          tenantId,
          professionalId: id,
          startAt: { gte: dateObj, lt: new Date(dateObj.getTime() + 86_400_000) },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        select: { startAt: true, endAt: true },
      }),
    ])
    return getAvailableSlots(dateObj, schedules, appointments, durationMin)
  }

  create(tenantId: string, dto: CreateProfissionalDto) {
    return this.db.professional.create({ data: { tenantId, ...dto } })
  }

  async update(tenantId: string, id: string, dto: Partial<CreateProfissionalDto>) {
    await this.findOne(tenantId, id)
    return this.db.professional.update({
      where: { id },
      data: {
        ...(dto.name          !== undefined && { name: dto.name }),
        ...(dto.phone         !== undefined && { phone: dto.phone }),
        ...(dto.email         !== undefined && { email: dto.email }),
        ...(dto.specialty     !== undefined && { specialty: dto.specialty }),
        ...(dto.active        !== undefined && { active: dto.active }),
        ...(dto.commissionPct !== undefined && { commissionPct: dto.commissionPct }),
        ...(dto.workDays      !== undefined && { workDays: dto.workDays }),
        ...(dto.workStart     !== undefined && { workStart: dto.workStart }),
        ...(dto.workEnd       !== undefined && { workEnd: dto.workEnd }),
        ...(dto.cpf           !== undefined && { cpf: dto.cpf }),
        ...(dto.birthDate     !== undefined && { birthDate: dto.birthDate }),
        ...(dto.vinculo       !== undefined && { vinculo: dto.vinculo }),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    const prof = await this.db.professional.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                startAt: { gte: new Date() },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
              },
            },
          },
        },
      },
    })
    if (!prof) throw new NotFoundException('Professional not found')
    if (prof._count.appointments > 0) {
      throw new ConflictException('Este profissional possui agendamentos futuros e não pode ser excluído.')
    }
    return this.db.professional.delete({ where: { id } })
  }

  getRoles(tenantId: string) {
    return this.db.professionalRole.findMany({
      where: { tenantId, status: true },
      orderBy: { order: 'asc' },
    })
  }

  createRole(tenantId: string, dto: { name: string; description?: string }) {
    return this.db.professionalRole.create({
      data: { tenantId, name: dto.name, description: dto.description },
    })
  }

  async updateRole(tenantId: string, id: string, dto: { name?: string; description?: string; order?: number }) {
    const role = await this.db.professionalRole.findFirst({ where: { id, tenantId } })
    if (!role) throw new NotFoundException('Role not found')
    return this.db.professionalRole.update({ where: { id }, data: dto })
  }

  async deleteRole(tenantId: string, id: string) {
    const role = await this.db.professionalRole.findFirst({ where: { id, tenantId } })
    if (!role) throw new NotFoundException('Role not found')
    return this.db.professionalRole.update({ where: { id }, data: { status: false } })
  }
}
