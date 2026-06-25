import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '../../infra/database/database.service'
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const tenant = await this.db.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      })
      if (!tenant || !tenant.active) throw new UnauthorizedException('Invalid credentials')

      const user = await this.db.user.findFirst({
        where: { email: dto.email, tenantId: tenant.id, active: true },
      })
      if (!user) throw new UnauthorizedException('Invalid credentials')

      const valid = await bcrypt.compare(dto.password, user.passwordHash)
      if (!valid) throw new UnauthorizedException('Invalid credentials')

      return this.issueTokens(user.id, tenant.id, tenant.slug, user.email, user.role)
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.error('Login error:', err)
      throw err
    }
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify<{
        sub: string; tenantId: string; tenantSlug: string; email: string; role: string
      }>(token)
      return this.issueTokens(payload.sub, payload.tenantId, payload.tenantSlug, payload.email, payload.role)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  logout() { return { message: 'Logged out successfully' } }

  private issueTokens(sub: string, tenantId: string, tenantSlug: string, email: string, role: string) {
    const payload = { sub, tenantId, tenantSlug, email, role }
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '30d' }),
    }
  }
}
