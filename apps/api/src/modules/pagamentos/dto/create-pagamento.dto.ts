import { IsString, IsNumber, IsEnum, Min } from 'class-validator'
import { PaymentMethod } from '@milli/shared-types'

export class CreatePagamentoDto {
  @IsString()
  commandId: string

  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @IsNumber()
  @Min(0.01)
  amount: number
}
