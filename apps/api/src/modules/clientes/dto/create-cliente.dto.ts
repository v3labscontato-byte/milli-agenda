import { IsString, IsOptional } from 'class-validator'

export class CreateClienteDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  cpf?: string

  @IsOptional()
  @IsString()
  birthDate?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  favoriteProfessionalId?: string
}
