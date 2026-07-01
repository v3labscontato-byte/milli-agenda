import { IsArray, IsEmail, IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  document?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  logoUrl?: string

  @IsOptional()
  businessHours?: object

  @IsOptional()
  @IsInt()
  slotGapMinutes?: number

  @IsOptional()
  @IsInt()
  minAdvanceHours?: number

  @IsOptional()
  @IsInt()
  maxAdvanceDays?: number

  @IsOptional()
  @IsArray()
  acceptedPaymentMethods?: string[]

  @IsOptional()
  @IsString()
  slogan?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  neighborhood?: string

  @IsOptional()
  @IsString()
  cep?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string
}
