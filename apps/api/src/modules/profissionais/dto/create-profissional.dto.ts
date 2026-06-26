import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator'

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

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsArray()
  workDays?: number[]

  @IsOptional()
  @IsString()
  workStart?: string

  @IsOptional()
  @IsString()
  workEnd?: string

  @IsOptional()
  @IsString()
  cpf?: string | null

  @IsOptional()
  @IsString()
  birthDate?: string | null

  @IsOptional()
  @IsString()
  vinculo?: string | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledServices?: string[]
}
