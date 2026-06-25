import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@TenantFromJwt() tenantId: string) {
    return this.settingsService.getSettings(tenantId)
  }

  @Patch()
  updateSettings(@TenantFromJwt() tenantId: string, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(tenantId, dto)
  }
}
