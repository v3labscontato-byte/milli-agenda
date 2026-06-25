import { Module } from '@nestjs/common'
import { TemplateEngineController } from './template-engine.controller'
import { TemplateEngineService } from './template-engine.service'

@Module({
  controllers: [TemplateEngineController],
  providers: [TemplateEngineService],
  exports: [TemplateEngineService],
})
export class TemplateEngineModule {}
