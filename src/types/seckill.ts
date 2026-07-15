export interface SeckillActivity {
  id: number
  productId: number
  productName: string
  productImage: string
  originalPrice: number
  seckillPrice: number
  stock: number
  soldCount: number
  endTime: string // ISO 时间字符串，前端拿来算倒计时
}
