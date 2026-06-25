import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { calcCommandTotals } from '@milli/business-rules'
import { CommandStatus } from '@milli/shared-types'
import { CreateComandaDto } from './dto/create-comanda.dto'
import { AddItemDto } from './dto/add-item.dto'

type FindAllFilters = { status?: string; clientId?: string }

@Injectable()
export class ComandasService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, filters: FindAllFilters = {}) {
    return this.db.command.findMany({
      where: {
        tenantId,
        ...(filters.status   ? { status: filters.status as CommandStatus } : {}),
        ...(filters.clientId ? { clientId: filters.clientId }              : {}),
      },
      include: { client: true, items: true },
      orderBy: { openedAt: 'desc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const cmd = await this.db.command.findFirst({
      where: { id, tenantId },
      include: { client: true, items: { include: { service: true } }, payments: true },
    })
    if (!cmd) throw new NotFoundException('Command not found')
    return cmd
  }

  async open(tenantId: string, dto: CreateComandaDto) {
    let clientId = dto.clientId
    if (!clientId) {
      if (!dto.appointmentId) throw new BadRequestException('Informe clientId ou appointmentId')
      const appt = await this.db.appointment.findFirst({ where: { id: dto.appointmentId, tenantId } })
      if (!appt) throw new NotFoundException('Appointment not found')
      clientId = appt.clientId
    }
    return this.db.command.create({
      data: { tenantId, clientId, notes: dto.notes },
    })
  }

  async addItem(tenantId: string, id: string, dto: AddItemDto) {
    const cmd = await this.findOne(tenantId, id)
    if (cmd.status === CommandStatus.CLOSED || cmd.status === CommandStatus.CANCELLED) {
      throw new BadRequestException('Cannot add items to a closed/cancelled command')
    }
    const service = await this.db.service.findFirst({ where: { id: dto.serviceId } })
    if (!service) throw new NotFoundException('Service not found')

    const unitPrice = Number(service.price)
    const discount = dto.discount ?? 0
    const total = dto.quantity * unitPrice - discount

    await this.db.commandItem.create({
      data: { commandId: id, serviceId: dto.serviceId, quantity: dto.quantity, unitPrice, discount, total },
    })

    return this.recalculate(id)
  }

  async removeItem(tenantId: string, commandId: string, itemId: string) {
    const cmd = await this.findOne(tenantId, commandId)
    if (cmd.status === CommandStatus.CLOSED || cmd.status === CommandStatus.CANCELLED) {
      throw new BadRequestException('Cannot remove items from a closed/cancelled command')
    }
    await this.db.commandItem.delete({ where: { id: itemId } })
    return this.recalculate(commandId)
  }

  async applyDiscount(tenantId: string, id: string, discountAmount: number) {
    const cmd = await this.findOne(tenantId, id)
    if (cmd.status === CommandStatus.CLOSED || cmd.status === CommandStatus.CANCELLED) {
      throw new BadRequestException('Cannot apply discount to a closed/cancelled command')
    }
    const finalAmount = Math.max(0, Number(cmd.totalAmount) - discountAmount)
    return this.db.command.update({
      where: { id },
      data: { discountAmount, finalAmount },
    })
  }

  async close(tenantId: string, id: string) {
    const cmd = await this.findOne(tenantId, id)
    if (cmd.status !== CommandStatus.OPEN && cmd.status !== CommandStatus.IN_PROGRESS) {
      throw new BadRequestException('Command cannot be closed')
    }
    return this.db.command.update({
      where: { id },
      data: { status: CommandStatus.CLOSED, closedAt: new Date() },
    })
  }

  async cancel(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.db.command.update({
      where: { id },
      data: { status: CommandStatus.CANCELLED },
    })
  }

  private async recalculate(commandId: string) {
    const items = await this.db.commandItem.findMany({ where: { commandId } })
    const totals = calcCommandTotals(
      items.map((i) => ({
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
      })),
    )
    return this.db.command.update({
      where: { id: commandId },
      data: totals,
    })
  }
}
