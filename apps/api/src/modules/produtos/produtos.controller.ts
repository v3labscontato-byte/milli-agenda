import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ProdutosService } from './produtos.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get('dashboard')
  getDashboard(@TenantFromJwt() tenantId: string) {
    return this.produtosService.getDashboardStats(tenantId)
  }

  @Get()
  findAll(
    @TenantFromJwt() tenantId: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brand') brand?: string,
    @Query('supplierName') supplierName?: string,
    @Query('lowStock') lowStock?: string,
    @Query('outOfStock') outOfStock?: string,
  ) {
    return this.produtosService.findAll(tenantId, {
      onlyActive: includeInactive !== 'true',
      categoryId: categoryId || undefined,
      brand: brand || undefined,
      supplierName: supplierName || undefined,
      lowStock: lowStock === 'true',
      outOfStock: outOfStock === 'true',
    })
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.produtosService.findOne(tenantId, id)
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateProductDto) {
    return this.produtosService.create(tenantId, dto)
  }

  @Patch(':id')
  update(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.produtosService.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.produtosService.remove(tenantId, id)
  }

  @Post(':id/stock')
  adjustStock(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body('delta') delta: number,
  ) {
    return this.produtosService.adjustStock(tenantId, id, delta)
  }
}
