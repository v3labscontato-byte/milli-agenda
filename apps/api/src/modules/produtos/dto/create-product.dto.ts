import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator'

export class CreateProductDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0.01)
  price: number

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number

  @IsOptional()
  @IsString()
  categoryId?: string | null
}
