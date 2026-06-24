import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator'

export class AddItemDto {
  @IsString()
  serviceId: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number
}
