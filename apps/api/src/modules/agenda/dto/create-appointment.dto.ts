import { IsString, IsDateString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateAppointmentDto {
  @IsString()
  clientId: string

  @IsString()
  professionalId: string

  @IsString()
  serviceId: string

  @IsDateString()
  startAt: string

  @IsInt()
  @Min(5)
  durationMin: number

  @IsOptional()
  @IsString()
  notes?: string
}
