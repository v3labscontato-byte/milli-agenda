export const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'

export const FEATURES = {
  realAuth:          USE_REAL_API,
  realClientes:      USE_REAL_API,
  realAgenda:        USE_REAL_API,
  realComandas:      USE_REAL_API,
  realPagamentos:    USE_REAL_API,
  realRelatorios:    USE_REAL_API,
  realServicos:      USE_REAL_API,
  realProfissionais: USE_REAL_API,
  realConfiguracoes: USE_REAL_API,
  realProdutos:      USE_REAL_API,
  realBooking:       USE_REAL_API,
}
