import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, email: true, phone: true, document: true, logoUrl: true, plan: true, trialEndsAt: true, createdAt: true },
    })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }

  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    return this.db.tenant.update({
      where: { id: tenantId },
      data: dto,
      select: { id: true, name: true, slug: true, email: true, phone: true, document: true, logoUrl: true, plan: true, trialEndsAt: true, updatedAt: true },
    })
  }
}
