import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { calcCommandTotals } from '@milli/business-rules'
import { CommandStatus } from '@milli/shared-types'
import { CreateComandaDto } from './dto/create-comanda.dto'
import { AddItemDto } from './dto/add-item.dto'
import { ProdutosService } from '../produtos/produtos.service'

type FindAllFilters = { status?: string; clientId?: string }

@Injectable()
export class ComandasService {
  constructor(
    private readonly db: DatabaseService,
    private readonly produtosService: ProdutosService,
  ) {}

  findAll(tenantId: string, filters: FindAllFilters = {}) {
    return this.db.command.findMany({
      where: {
        tenantId,
        ...(filters.status   ? { status: filters.status as CommandStatus } : {}),
        ...(filters.clientId ? { clientId: filters.clientId }              : {}),
      },
      include: {
        client: true,
        items: {
          include: {
            service: { select: { name: true } },
            product: { select: { name: true } },
          },
        },
        appointments: {
          include: {
            professional: { select: { name: true } },
            service: { select: { name: true } },
          },
          take: 1,
          orderBy: { startAt: 'desc' as const },
        },
      },
      orderBy: { openedAt: 'desc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const cmd = await this.db.command.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        items: { include: { service: true, product: true } },
        payments: true,
      },
    })
    if (!cmd) throw new NotFoundException('Command not found')
    return cmd
  }

  async reopen(tenantId: string, id: string) {
    const cmd = await this.findOne(tenantId, id)
    if (cmd.status !== CommandStatus.CLOSED) {
      throw new BadRequestException('Command is not closed')
    }
    return this.db.command.update({
      where: { id },
      data: { status: CommandStatus.OPEN, closedAt: null },
    })
  }

  async open(tenantId: string, dto: CreateComandaDto) {
    if (dto.appointmentId) {
      const existingAppt = await this.db.appointment.findFirst({
        where: { id: dto.appointmentId, tenantId },
        select: { commandId: true },
      })
      if (existingAppt?.commandId) {
        const existingCmd = await this.db.command.findFirst({
          where: { id: existingAppt.commandId },
        })
        if (existingCmd && (existingCmd.status === CommandStatus.OPEN || existingCmd.status === CommandStatus.IN_PROGRESS)) {
          return this.findOne(tenantId, existingCmd.id)
        }
      }
    }

    const command = await this.db.command.create({
      data: { tenantId, clientId: dto.clientId, notes: dto.notes },
    })
    if (dto.appointmentId) {
      const appt = await this.db.appointment.findFirst({
        where: { id: dto.appointmentId, tenantId },
        include: { service: true },
      })
      if (appt) {
        await this.db.appointment.update({
          where: { id: dto.appointmentId },
          data: { commandId: command.id },
        })
        if (appt.serviceId && appt.service) {
          await this.db.commandItem.create({
            data: {
              commandId: command.id,
              serviceId: appt.serviceId,
              quantity: 1,
              unitPrice: Number(appt.service.price),
              discount: 0,
              total: Number(appt.service.price),
            },
          })
          return this.recalculate(command.id)
        }
      }
    }
    return command
  }

  async addItem(tenantId: string, id: string, dto: AddItemDto) {
    if (!dto.serviceId && !dto.productId) {
      throw new BadRequestException('Informe serviceId ou productId')
    }
    if (dto.serviceId && dto.productId) {
      throw new BadRequestException('Informe apenas serviceId ou productId, não os dois')
    }

    const cmd = await this.findOne(tenantId, id)
    if (cmd.status === CommandStatus.CLOSED || cmd.status === CommandStatus.CANCELLED) {
      throw new BadRequestException('Cannot add items to a closed/cancelled command')
    }

    const discount = dto.discount ?? 0

    if (dto.productId) {
      const product = await this.db.product.findFirst({
        where: { id: dto.productId, tenantId, active: true },
      })
      if (!product) throw new NotFoundException('Produto não encontrado ou inativo')
      if (product.stockQuantity < dto.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stockQuantity}`,
        )
      }
      const unitPrice = Number(product.price)
      const total = dto.quantity * unitPrice - discount
      await this.db.commandItem.create({
        data: { commandId: id, productId: dto.productId, quantity: dto.quantity, unitPrice, discount, total },
      })
      await this.produtosService.adjustStock(tenantId, dto.productId, -dto.quantity)
      return this.recalculate(id)
    }

    const service = await this.db.service.findFirst({ where: { id: dto.serviceId } })
    if (!service) throw new NotFoundException('Service not found')
    const unitPrice = Number(service.price)
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
    const item = cmd.items.find((i) => i.id === itemId)
    if (!item) throw new NotFoundException('Item not found')
    if (item.productId) {
      await this.produtosService.adjustStock(tenantId, item.productId, item.quantity)
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
    console.log('[CLOSE] iniciando', { tenantId, id })
    try {
      const cmd = await this.findOne(tenantId, id)
      console.log('[CLOSE] cmd', { status: cmd.status, discountAmount: cmd.discountAmount })
      if (cmd.status !== CommandStatus.OPEN && cmd.status !== CommandStatus.IN_PROGRESS) {
        throw new BadRequestException('Command cannot be closed')
      }
      const items = await this.db.commandItem.findMany({ where: { commandId: id } })
      const itemsTotal = items.reduce((s, i) => s + Number(i.total), 0)
      console.log('[CLOSE] items:', items.length, 'total:', itemsTotal)
      const payments = await this.db.payment.findMany({ where: { commandId: id } })
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
      console.log('[CLOSE] payments:', payments.length, 'totalPaid:', totalPaid)
      const totalAmount = itemsTotal > 0 ? itemsTotal : totalPaid
      const discountAmount = Number(cmd.discountAmount ?? 0)
      const finalAmount = Math.max(0, totalAmount - discountAmount)
      console.log('[CLOSE] calculado:', { totalAmount, discountAmount, finalAmount })
      const result = await this.db.command.update({
        where: { id },
        data: {
          status: CommandStatus.CLOSED,
          closedAt: new Date(),
          totalAmount,
          discountAmount,
          finalAmount,
        },
      })
      console.log('[CLOSE] sucesso:', result.id)
      return result
    } catch (error) {
      console.error('[CLOSE ERROR]', error)
      throw error
    }
  }

  async cancel(tenantId: string, id: string) {
    const cmd = await this.findOne(tenantId, id)
    const productItems = cmd.items.filter((i) => i.productId)
    for (const item of productItems) {
      await this.produtosService.adjustStock(tenantId, item.productId!, item.quantity)
    }
    return this.db.command.update({
      where: { id },
      data: { status: CommandStatus.CANCELLED },
    })
  }

  private async recalculate(commandId: string) {
    const [items, cmd] = await Promise.all([
      this.db.commandItem.findMany({ where: { commandId } }),
      this.db.command.findUnique({ where: { id: commandId }, select: { discountAmount: true } }),
    ])
    const totals = calcCommandTotals(
      items.map((i) => ({
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
      })),
    )
    const commandDiscount = Number(cmd?.discountAmount ?? 0)
    const finalAmount = Math.max(0, totals.totalAmount - commandDiscount)
    return this.db.command.update({
      where: { id: commandId },
      data: {
        totalAmount: totals.totalAmount,
        discountAmount: commandDiscount,
        finalAmount,
      },
    })
  }
}
