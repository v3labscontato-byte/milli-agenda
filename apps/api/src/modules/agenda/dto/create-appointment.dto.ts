import { IsString, IsOptional, IsInt, Min } from 'class-validator'

export class CreateAppointmentDto {
  @IsString()
  clientName: string

  @IsOptional()
  @IsString()
  clientPhone?: string

  @IsOptional()
  @IsString()
  clientId?: string

  @IsString()
  serviceId: string

  @IsString()
  professionalId: string

  @IsString()
  date: string // "2026-06-26"

  @IsString()
  startTime: string // "12:30"

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number

  @IsOptional()
  @IsString()
  notes?: string
}
