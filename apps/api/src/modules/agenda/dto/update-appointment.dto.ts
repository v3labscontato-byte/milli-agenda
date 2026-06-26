import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateAppointmentDto {
  @IsOptional() @IsString() clientId?: string
  @IsOptional() @IsString() serviceId?: string
  @IsOptional() @IsString() professionalId?: string
  @IsOptional() @IsString() date?: string
  @IsOptional() @IsString() startTime?: string
  @IsOptional() @IsInt() @Min(1) durationMin?: number
  @IsOptional() @IsString() notes?: string
  @IsOptional() @IsString() status?: string
  @IsOptional() @IsString() cancelReason?: string
}
