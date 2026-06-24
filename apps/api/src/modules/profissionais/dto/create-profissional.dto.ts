import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class CreateProfissionalDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
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
