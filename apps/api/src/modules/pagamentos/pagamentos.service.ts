import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { validatePayment, isRefundable } from '@milli/business-rules'
import { PaymentMethod, PaymentStatus } from '@milli/shared-types'
import { CreatePagamentoDto } from './dto/create-pagamento.dto'

@Injectable()
export class PagamentosService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, commandId?: string) {
    return this.db.payment.findMany({
      where: {
        tenantId,
        ...(commandId ? { commandId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async receive(tenantId: string, dto: CreatePagamentoDto) {
    const command = await this.db.command.findFirst({
      where: { id: dto.commandId, tenantId },
      include: { payments: true },
    })
    if (!command) throw new NotFoundException('Command not found')

    const alreadyPaid = command.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((s, p) => s + Number(p.amount), 0)

    const validation = validatePayment({
      amount: dto.amount,
      method: dto.method,
      commandFinalAmount: Number(command.finalAmount),
      alreadyPaid,
    })

    if (!validation.valid) throw new BadRequestException(validation.error)

    return this.db.payment.create({
      data: {
        tenantId,
        commandId: dto.commandId,
        method: dto.method,
        amount: dto.amount,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    })
  }

  async refund(tenantId: string, id: string) {
    const payment = await this.db.payment.findFirst({ where: { id, tenantId } })
    if (!payment) throw new NotFoundException('Payment not found')
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only PAID payments can be refunded')
    }
    if (!isRefundable(payment.method as unknown as PaymentMethod)) {
      throw new BadRequestException(`Payment method ${payment.method} is not refundable`)
    }
    return this.db.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    })
  }
}
