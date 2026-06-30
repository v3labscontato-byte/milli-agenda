import { Module } from '@nestjs/common'
import { ComandasController } from './comandas.controller'
import { ComandasService } from './comandas.service'
import { ProdutosModule } from '../produtos/produtos.module'

@Module({
  imports: [ProdutosModule],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [ComandasService],
})
export class ComandasModule {}
