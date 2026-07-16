import type { Address } from './address'

// 订单中的商品项
export interface OrderItem {
  productId: number
  name: string
  image: string
  price: number
  quantity: number
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed'

// 订单
export interface Order {
  id: string
  orderNo: string
  userId: number
  items: OrderItem[]
  totalPrice: number // 商品原价合计
  discountAmount: number // 优惠券抵扣的金额
  payAmount: number // 实付金额 = totalPrice - discountAmount
  status: OrderStatus
  address: Address // 下单时的收货地址快照
  createdAt: string
}

// 创建订单的请求参数
export interface CreateOrderParams {
  userId: number
  addressId: number
  items: OrderItem[]
  discountAmount?: number
}

// 重新导出 Address，保持之前 `import type { Address } from '@/types/order'` 的写法也能兼容
export type { Address }
