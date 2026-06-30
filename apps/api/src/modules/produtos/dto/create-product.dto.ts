import { IsString, IsOptional, IsNumber, IsInt, Min, IsEnum, IsArray, IsUrl } from 'class-validator'
import { ProductUnit, ProductClassification } from '@prisma/client'

export class CreateProductDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  notes?: string

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
  @IsInt()
  @Min(0)
  maxStock?: number

  @IsOptional()
  @IsString()
  categoryId?: string | null

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsString()
  supplierName?: string

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsArray()
  @IsEnum(ProductClassification, { each: true })
  classifications?: ProductClassification[]

  @IsOptional()
  @IsString()
  location?: string
}
