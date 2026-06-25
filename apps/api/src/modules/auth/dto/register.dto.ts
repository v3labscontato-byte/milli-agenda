import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator'

export enum PlanOption {
  STARTER    = 'starter',
  PRO        = 'pro',
  ENTERPRISE = 'enterprise',
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  salonName: string

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string

  @IsString()
  @MinLength(2)
  ownerName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEnum(PlanOption)
  plan?: PlanOption
}
