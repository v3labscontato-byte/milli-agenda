import { IsString, IsInt, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator'

export class AddItemDto {
  @ValidateIf((o) => !o.productId)
  @IsString()
  serviceId?: string

  @ValidateIf((o) => !o.serviceId)
  @IsString()
  productId?: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number
}
