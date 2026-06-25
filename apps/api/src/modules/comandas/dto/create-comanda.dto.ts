import { IsString, IsOptional } from 'class-validator'

export class CreateComandaDto {
  @IsOptional()
  @IsString()
  clientId?: string

  @IsOptional()
  @IsString()
  appointmentId?: string

  @IsOptional()
  @IsString()
  notes?: string
}
