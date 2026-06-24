export interface CarouselSlideConfig {
  id: string
  type: 'promocoes' | 'pacotes' | 'servicos' | 'avaliacoes' | 'afiliados'
  enabled: boolean
  order: number
  title?: string
  subtitle?: string
}

export const CAROUSEL_CONFIG: CarouselSlideConfig[] = [
  { id: 'promocoes',  type: 'promocoes',  enabled: true, order: 1 },
  { id: 'pacotes',    type: 'pacotes',    enabled: true, order: 2 },
  { id: 'servicos',   type: 'servicos',   enabled: true, order: 3 },
  { id: 'avaliacoes', type: 'avaliacoes', enabled: true, order: 4 },
  { id: 'afiliados',  type: 'afiliados',  enabled: true, order: 5 },
]
