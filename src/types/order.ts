// 收货地址
export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

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
  address: Address
  createdAt: string
}

// 创建订单的请求参数
export interface CreateOrderParams {
  userId: number
  addressId: number
  items: OrderItem[]
  discountAmount?: number
}
