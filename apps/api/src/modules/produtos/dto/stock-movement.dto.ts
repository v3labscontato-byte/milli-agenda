import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { StockMovementType } from '@prisma/client'

export class CreateStockMovementDto {
  @IsEnum(StockMovementType)
  type: StockMovementType

  @IsInt()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number
}
