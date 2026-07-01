import { Module } from '@nestjs/common'
import { PublicController } from './public.controller'
import { PublicService } from './public.service'
import { ProfissionaisModule } from '../profissionais/profissionais.module'

@Module({
  imports: [ProfissionaisModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
