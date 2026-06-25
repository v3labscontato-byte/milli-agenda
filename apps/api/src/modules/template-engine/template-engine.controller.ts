import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common'
import { TemplateEngineService } from './template-engine.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'

@Controller('templates')
export class TemplateEngineController {
  constructor(private readonly service: TemplateEngineService) {}

  @Get()
  getTemplates() {
    return this.service.getTemplates()
  }

  @Get(':slug')
  getTemplate(@Param('slug') slug: string) {
    return this.service.getTemplate(slug)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/import')
  importTemplate(@TenantFromJwt() tenantId: string, @Param('slug') slug: string) {
    return this.service.importTemplate(tenantId, slug)
  }
}
