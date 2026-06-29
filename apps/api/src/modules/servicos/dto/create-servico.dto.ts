import { IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator'

export class CreateServicoDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsInt()
  @Min(5)
  durationMin: number

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsString()
  categoryId?: string | null
}
