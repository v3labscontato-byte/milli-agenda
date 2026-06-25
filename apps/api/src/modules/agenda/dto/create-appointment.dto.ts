import { IsString, IsDateString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateAppointmentDto {
  // Aceita clientId (cliente existente) OU clientName+clientPhone (find-or-create)
  @IsOptional()
  @IsString()
  clientId?: string

  @IsOptional()
  @IsString()
  clientName?: string

  @IsOptional()
  @IsString()
  clientPhone?: string

  @IsString()
  professionalId: string

  @IsString()
  serviceId: string

  // Aceita startAt ISO OU date+startTime separados
  @IsOptional()
  @IsDateString()
  startAt?: string

  @IsOptional()
  @IsString()
  date?: string  // "YYYY-MM-DD"

  @IsOptional()
  @IsString()
  startTime?: string  // "HH:MM"

  @IsOptional()
  @IsInt()
  @Min(5)
  durationMin?: number

  @IsOptional()
  @IsString()
  notes?: string
}
