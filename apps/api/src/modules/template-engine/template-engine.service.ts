import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'

@Injectable()
export class TemplateEngineService {
  constructor(private readonly db: DatabaseService) {}

  getTemplates() {
    return this.db.nichoTemplate.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { roles: true, categories: true, services: true },
    })
  }

  async getTemplate(slug: string) {
    const tpl = await this.db.nichoTemplate.findUnique({
      where: { slug },
      include: {
        roles: { orderBy: { order: 'asc' } },
        categories: { orderBy: { order: 'asc' } },
        services: { orderBy: { order: 'asc' } },
      },
    })
    if (!tpl) throw new NotFoundException('Template not found')
    return tpl
  }

  async importTemplate(tenantId: string, slug: string) {
    const tpl = await this.getTemplate(slug)

    await Promise.all(
      tpl.roles.map((r, i) =>
        this.db.professionalRole.create({
          data: { tenantId, name: r.name, order: r.order || i },
        }),
      ),
    )

    const catMap = new Map<string, string>()
    for (const cat of tpl.categories) {
      const created = await this.db.serviceCategory.create({
        data: { tenantId, name: cat.name, color: cat.color, order: cat.order },
      })
      catMap.set(cat.id, created.id)
    }

    await Promise.all(
      tpl.services.map((svc, i) =>
        this.db.service.create({
          data: {
            tenantId,
            name: svc.name,
            durationMin: svc.duration,
            price: svc.price,
            categoryId: svc.categoryId ? (catMap.get(svc.categoryId) ?? null) : null,
          },
        }),
      ),
    )

    return this.db.tenant.update({
      where: { id: tenantId },
      data: { nichoSlug: slug },
    })
  }
}
