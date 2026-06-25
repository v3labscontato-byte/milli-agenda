import { Injectable, NestMiddleware } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly db: DatabaseService) {}

  async use(req: any, res: any, next: () => void) {
    const tenantSlug = req.headers['x-tenant-slug'] as string | undefined

    if (!tenantSlug) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ statusCode: 400, message: 'Tenant não identificado' }))
      return
    }

    const tenant = await this.db.tenant.findUnique({
      where: { slug: tenantSlug },
    })

    if (!tenant || !tenant.active) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ statusCode: 404, message: 'Tenant não encontrado' }))
      return
    }

    req.tenant = tenant
    next()
  }
}
