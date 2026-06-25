import { IsString } from 'class-validator'

export class ImportTemplateDto {
  @IsString() nichoSlug: string
}
