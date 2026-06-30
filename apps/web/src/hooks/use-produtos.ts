'use client'
import { useCallback, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'
import { produtosApi } from '@/lib/api/produtos'

export type ProductUnit = 'UNIT' | 'ML' | 'G' | 'KG' | 'LITER'
export type ProductClassification = 'RESALE' | 'INTERNAL_USE' | 'PROCEDURE' | 'CONSUMABLE'

export interface Product {
  id: string
  name: string
  description: string
  notes: string
  price: number
  stockQuantity: number
  minStockAlert: number
  maxStock: number | null
  active: boolean
  categoryId: string | null
  category: { id: string; name: string; color: string } | null
  sku: string
  brand: string
  supplierName: string
  unit: ProductUnit
  imageUrl: string
  classifications: ProductClassification[]
  location: string
}

export interface ProductDashboardStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalStockValue: number
}

export interface ProductInput {
  name: string
  description?: string
  notes?: string
  price: number
  stockQuantity?: number
  minStockAlert?: number
  maxStock?: number | null
  categoryId?: string | null
  sku?: string
  brand?: string
  supplierName?: string
  unit?: ProductUnit
  imageUrl?: string
  classifications?: ProductClassification[]
  location?: string
  active?: boolean
}

interface ApiProduct {
  id: string
  name: string
  description: string | null
  notes: string | null
  price: number | string
  stockQuantity: number
  minStockAlert: number
  maxStock: number | null
  active: boolean
  categoryId: string | null
  category: { id: string; name: string; color: string } | null
  sku: string | null
  brand: string | null
  supplierName: string | null
  unit: ProductUnit
  imageUrl: string | null
  classifications: ProductClassification[]
  location: string | null
}

function toProduct(api: ApiProduct): Product {
  return {
    id: api.id,
    name: api.name,
    description: api.description ?? '',
    notes: api.notes ?? '',
    price: Number(api.price ?? 0),
    stockQuantity: api.stockQuantity ?? 0,
    minStockAlert: api.minStockAlert ?? 0,
    maxStock: api.maxStock ?? null,
    active: api.active,
    categoryId: api.categoryId ?? null,
    category: api.category ?? null,
    sku: api.sku ?? '',
    brand: api.brand ?? '',
    supplierName: api.supplierName ?? '',
    unit: api.unit ?? 'UNIT',
    imageUrl: api.imageUrl ?? '',
    classifications: api.classifications ?? [],
    location: api.location ?? '',
  }
}

const MOCK_STATS: ProductDashboardStats = { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalStockValue: 0 }

export function useProdutos(filters?: Record<string, string>) {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(FEATURES.realProdutos)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ProductDashboardStats>(MOCK_STATS)

  const refetch = useCallback(async () => {
    if (!FEATURES.realProdutos) return
    setLoading(true)
    setError(null)
    try {
      const [products, dashboard] = await Promise.all([
        produtosApi.list(filters) as Promise<ApiProduct[]>,
        produtosApi.dashboard() as Promise<ProductDashboardStats>,
      ])
      setData((products ?? []).map(toProduct))
      setStats(dashboard ?? MOCK_STATS)
    } catch {
      setError('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let cancelled = false
    if (!FEATURES.realProdutos) return
    setLoading(true)
    setError(null)
    Promise.all([
      produtosApi.list(filters) as Promise<ApiProduct[]>,
      produtosApi.dashboard() as Promise<ProductDashboardStats>,
    ])
      .then(([products, dashboard]) => {
        if (!cancelled) {
          setData((products ?? []).map(toProduct))
          setStats(dashboard ?? MOCK_STATS)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Erro ao carregar produtos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const create = useCallback(async (input: ProductInput) => {
    await produtosApi.create(input)
    await refetch()
  }, [refetch])

  const update = useCallback(async (id: string, input: Partial<ProductInput>) => {
    await produtosApi.update(id, input)
    await refetch()
  }, [refetch])

  const remove = useCallback(async (id: string) => {
    await produtosApi.delete(id)
    await refetch()
  }, [refetch])

  return { data, loading, error, stats, refetch, create, update, remove }
}
