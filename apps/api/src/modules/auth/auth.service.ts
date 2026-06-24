import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '../../infra/database/database.service'
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.db.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    })

    if (!user || !user.active) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.issueTokens(user.id, user.tenantId, user.email, user.role)
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; tenantId: string; email: string; role: string }>(token)
      return this.issueTokens(payload.sub, payload.tenantId, payload.email, payload.role)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private issueTokens(sub: string, tenantId: string, email: string, role: string) {
    const payload = { sub, tenantId, email, role }
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '30d' }),
    }
  }
}
