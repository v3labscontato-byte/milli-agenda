import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProdutosService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, onlyActive = true) {
    return this.db.product.findMany({
      where: { tenantId, ...(onlyActive ? { active: true } : {}) },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true, color: true } } },
    })
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.db.product.findFirst({ where: { id, tenantId } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  create(tenantId: string, dto: CreateProductDto) {
    return this.db.product.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stockQuantity: dto.stockQuantity ?? 0,
        minStockAlert: dto.minStockAlert ?? 0,
        categoryId: dto.categoryId ?? null,
      },
    })
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id)
    return this.db.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity }),
        ...(dto.minStockAlert !== undefined && { minStockAlert: dto.minStockAlert }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.db.product.update({ where: { id }, data: { active: false } })
  }

  async adjustStock(tenantId: string, id: string, delta: number) {
    const product = await this.findOne(tenantId, id)
    const newQuantity = product.stockQuantity + delta
    if (newQuantity < 0) {
      throw new BadRequestException(`Estoque insuficiente (disponível: ${product.stockQuantity})`)
    }
    return this.db.product.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    })
  }
}
