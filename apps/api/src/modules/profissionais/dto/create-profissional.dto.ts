import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class CreateProfissionalDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPct?: number
}
