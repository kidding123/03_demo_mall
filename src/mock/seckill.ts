import Mock from 'mockjs'
import { getAllProducts } from './product'
import { createOrderRecord } from './order'
import { getDefaultAddressForUser } from './address'
import type { SeckillActivity } from '@/types/seckill'

let activities: SeckillActivity[] = []

// 取前 4 个商品，打 5 折作为秒杀商品，倒计时统一设成 2 小时后结束（方便演示）
function initActivities() {
  if (activities.length > 0) return
  const products = getAllProducts().slice(0, 4)
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  activities = products.map((p, index) => ({
    id: index + 1,
    productId: p.id,
    productName: p.name,
    productImage: p.image,
    originalPrice: p.price,
    seckillPrice: Number((p.price * 0.5).toFixed(2)),
    stock: 10,
    soldCount: 0,
    endTime
  }))
}

export function registerSeckillMock() {
  initActivities()

  // 秒杀活动列表
  Mock.mock(/\/api\/seckill\/list/, 'get', () => {
    return { code: 200, message: 'success', data: activities }
  })

  // 一键抢购：扣库存 + 直接生成一笔订单（用该用户自己的默认收货地址，跳过购物车和结算页）
  Mock.mock(/\/api\/seckill\/buy/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const activity = activities.find((a) => a.id === body.activityId)

    if (!activity) {
      return { code: 404, message: '活动不存在', data: null }
    }
    if (new Date(activity.endTime).getTime() < Date.now()) {
      return { code: 400, message: '活动已结束', data: null }
    }
    if (activity.stock <= 0) {
      return { code: 400, message: '手慢了，已经被抢光了', data: null }
    }

    const defaultAddress = getDefaultAddressForUser(body.userId)
    if (!defaultAddress) {
      return { code: 400, message: '请先添加一个收货地址再来抢购', data: null }
    }

    activity.stock -= 1
    activity.soldCount += 1

    const order = createOrderRecord({
      userId: body.userId,
      addressId: defaultAddress.id,
      items: [
        {
          productId: activity.productId,
          name: activity.productName,
          image: activity.productImage,
          price: activity.seckillPrice,
          quantity: 1
        }
      ]
    })

    return { code: 200, message: 'success', data: order }
  })
}
