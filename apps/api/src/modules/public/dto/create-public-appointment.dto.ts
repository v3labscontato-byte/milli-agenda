import { IsString, IsEmail, IsOptional } from 'class-validator'

export class CreatePublicAppointmentDto {
  @IsString()
  name: string

  @IsString()
  phone: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsString()
  serviceId: string

  @IsString()
  professionalId: string

  @IsString()
  date: string // YYYY-MM-DD

  @IsString()
  time: string // HH:mm

  @IsOptional()
  @IsString()
  notes?: string
}
