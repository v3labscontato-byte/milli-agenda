import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

interface FindAllFilters {
  onlyActive?: boolean
  categoryId?: string
  brand?: string
  supplierName?: string
  lowStock?: boolean
  outOfStock?: boolean
}

@Injectable()
export class ProdutosService {
  constructor(private readonly db: DatabaseService) {}

  findAll(tenantId: string, filters: FindAllFilters = {}) {
    const { onlyActive = true, categoryId, brand, supplierName, lowStock, outOfStock } = filters
    return this.db.product.findMany({
      where: {
        tenantId,
        ...(onlyActive ? { active: true } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(brand ? { brand: { contains: brand, mode: 'insensitive' } } : {}),
        ...(supplierName ? { supplierName: { contains: supplierName, mode: 'insensitive' } } : {}),
        ...(outOfStock ? { stockQuantity: 0 } : lowStock ? { stockQuantity: { gt: 0 } } : {}),
      },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true, color: true } } },
    }).then(async (products) => {
      if (lowStock && !outOfStock) {
        return products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert)
      }
      return products
    })
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.db.product.findFirst({ where: { id, tenantId } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async create(tenantId: string, dto: CreateProductDto) {
    if (dto.maxStock !== undefined && dto.minStockAlert !== undefined && dto.maxStock < dto.minStockAlert) {
      throw new BadRequestException('maxStock deve ser maior ou igual ao minStockAlert')
    }
    return this.db.product.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        notes: dto.notes,
        price: dto.price,
        stockQuantity: dto.stockQuantity ?? 0,
        minStockAlert: dto.minStockAlert ?? 0,
        maxStock: dto.maxStock ?? null,
        categoryId: dto.categoryId ?? null,
        sku: dto.sku,
        brand: dto.brand,
        supplierName: dto.supplierName,
        unit: dto.unit ?? 'UNIT',
        imageUrl: dto.imageUrl,
        classifications: dto.classifications ?? [],
        location: dto.location,
      },
    })
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(tenantId, id)
    const newMinStock = dto.minStockAlert ?? existing.minStockAlert
    const newMaxStock = dto.maxStock !== undefined ? dto.maxStock : existing.maxStock
    if (newMaxStock !== null && newMaxStock !== undefined && newMaxStock < newMinStock) {
      throw new BadRequestException('maxStock deve ser maior ou igual ao minStockAlert')
    }
    return this.db.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity }),
        ...(dto.minStockAlert !== undefined && { minStockAlert: dto.minStockAlert }),
        ...(dto.maxStock !== undefined && { maxStock: dto.maxStock }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.supplierName !== undefined && { supplierName: dto.supplierName }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.classifications !== undefined && { classifications: dto.classifications }),
        ...(dto.location !== undefined && { location: dto.location }),
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

  async getDashboardStats(tenantId: string) {
    const products = await this.db.product.findMany({
      where: { tenantId, active: true },
      select: { price: true, stockQuantity: true, minStockAlert: true },
    })

    let totalStockValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    for (const p of products) {
      const qty = p.stockQuantity
      const price = Number(p.price)
      totalStockValue += price * qty
      if (qty === 0) outOfStockCount++
      else if (qty <= p.minStockAlert) lowStockCount++
    }

    return {
      totalProducts: products.length,
      lowStockCount,
      outOfStockCount,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
    }
  }
}
