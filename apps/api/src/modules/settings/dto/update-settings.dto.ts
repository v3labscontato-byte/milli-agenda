import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

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

  @IsOptional()
  @IsBoolean()
  depositRequired?: boolean

  @IsOptional()
  @IsString()
  depositType?: string

  @IsOptional()
  @IsNumber()
  depositValue?: number

  @IsOptional()
  @IsInt()
  cancellationMinHours?: number

  @IsOptional()
  @IsInt()
  cancellationFeePercent?: number

  @IsOptional()
  @IsBoolean()
  cancellationRefundSignal?: boolean

  @IsOptional()
  @IsString()
  instagram?: string

  @IsOptional()
  @IsBoolean()
  acceptingNewClients?: boolean

  @IsOptional()
  @IsString()
  welcomeMessage?: string

  @IsOptional()
  @IsString()
  googlePlaceId?: string

  @IsOptional()
  @IsNumber()
  referralBonus?: number

  @IsOptional()
  @IsInt()
  pointsPerReal?: number

  @IsOptional()
  @IsString()
  primaryColor?: string
}
