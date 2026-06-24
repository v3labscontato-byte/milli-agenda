import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator'

export class CreateClienteDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  notes?: string
}
