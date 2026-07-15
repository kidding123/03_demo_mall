import Mock from 'mockjs'
import type { Address, Order, OrderItem } from '@/types/order'

// 预置两个收货地址
const addressList: Address[] = [
  {
    id: 1,
    name: '张三',
    phone: '138 0000 0000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区某栋 101',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '139 0000 0000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路某号',
    isDefault: false
  }
]

// 订单数据存在内存里，刷新浏览器会丢失（mock 阶段的局限）
let orderList: Order[] = []
let orderSeq = 1

// 真正创建订单记录的逻辑，抽成一个函数，
// 这样 /api/order/create 接口和秒杀模块的"一键抢购"都能直接调用它，不用各写一份
export function createOrderRecord(params: {
  userId: number
  addressId: number
  items: OrderItem[]
  discountAmount?: number
}): Order {
  const address = addressList.find((a) => a.id === params.addressId)
  const totalPrice = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = params.discountAmount || 0
  const payAmount = Math.max(totalPrice - discountAmount, 0)

  const order: Order = {
    id: String(orderSeq++),
    orderNo: 'ORD' + Date.now(),
    userId: params.userId,
    items: params.items,
    totalPrice,
    discountAmount,
    payAmount,
    status: 'paid', // 简化处理：下单即视为支付成功
    address: address as Address,
    createdAt: new Date().toLocaleString()
  }
  orderList.unshift(order)
  return order
}

// 获取默认收货地址，供秒杀这种"一键下单"场景使用
export function getDefaultAddress() {
  return addressList.find((a) => a.isDefault) || addressList[0]
}

export function registerOrderMock() {
  // 地址列表
  Mock.mock(/\/api\/address\/list/, 'get', () => {
    return { code: 200, message: 'success', data: addressList }
  })

  // 创建订单
  Mock.mock(/\/api\/order\/create/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const order = createOrderRecord({
      userId: body.userId,
      addressId: body.addressId,
      items: body.items as OrderItem[],
      discountAmount: body.discountAmount
    })
    return { code: 200, message: 'success', data: order }
  })

  // 用户查看"我的订单"：GET /api/order/list?userId=xxx，只返回属于该用户的订单
  Mock.mock(/\/api\/order\/list(\?.*)?$/, 'get', (options: any) => {
    const url = new URL('http://mock' + options.url)
    const userId = Number(url.searchParams.get('userId'))
    const result = orderList.filter((o) => o.userId === userId)
    return { code: 200, message: 'success', data: result }
  })

  // 订单详情
  Mock.mock(/\/api\/order\/detail\/\w+/, 'get', (options: any) => {
    const match = options.url.match(/\/detail\/(\w+)/)
    const order = orderList.find((o) => o.id === match[1])
    return {
      code: order ? 200 : 404,
      message: order ? 'success' : '订单不存在',
      data: order || null
    }
  })

  // 管理后台：查看所有订单（不按 userId 过滤，管理员能看到所有人的订单）
  Mock.mock(/\/api\/admin\/order\/list/, 'get', () => {
    return { code: 200, message: 'success', data: orderList }
  })

  // 管理后台：更新订单状态
  Mock.mock(/\/api\/admin\/order\/status\/\w+/, 'put', (options: any) => {
    const match = options.url.match(/\/status\/(\w+)/)
    const body = JSON.parse(options.body)
    const order = orderList.find((o) => o.id === match[1])
    if (!order) {
      return { code: 404, message: '订单不存在', data: null }
    }
    order.status = body.status
    return { code: 200, message: 'success', data: order }
  })
}

// 供数据看板等内部逻辑直接读取订单数据用
export function getAllOrders() {
  return orderList
}
