import Mock from 'mockjs'
import type { Coupon, UserCoupon } from '@/types/coupon'

// 预置 3 张优惠券
const coupons: Coupon[] = [
  {
    id: 1,
    name: '满100减20',
    type: 'fixed',
    amount: 20,
    minAmount: 100,
    description: '订单满 100 元可用，立减 20 元'
  },
  {
    id: 2,
    name: '满200减50',
    type: 'fixed',
    amount: 50,
    minAmount: 200,
    description: '订单满 200 元可用，立减 50 元'
  },
  {
    id: 3,
    name: '全场9折券',
    type: 'percent',
    amount: 0.9,
    minAmount: 0,
    description: '无门槛，全场商品享 9 折'
  }
]

const STORAGE_KEY = 'mall_user_coupons'

// 领取记录也存 localStorage，这样刷新页面不会丢
function loadUserCoupons(): UserCoupon[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveUserCoupons(list: UserCoupon[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function registerCouponMock() {
  // 领券中心：所有可领取的优惠券
  Mock.mock(/\/api\/coupon\/list/, 'get', () => {
    return { code: 200, message: 'success', data: coupons }
  })

  // 我的优惠券：GET /api/coupon/my?userId=xxx
  Mock.mock(/\/api\/coupon\/my(\?.*)?$/, 'get', (options: any) => {
    const url = new URL('http://mock' + options.url)
    const userId = Number(url.searchParams.get('userId'))
    const userCoupons = loadUserCoupons().filter((uc) => uc.userId === userId)
    const result = userCoupons.map((uc) => ({
      ...uc,
      coupon: coupons.find((c) => c.id === uc.couponId)
    }))
    return { code: 200, message: 'success', data: result }
  })

  // 领取优惠券
  Mock.mock(/\/api\/coupon\/receive/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const userCoupons = loadUserCoupons()

    const alreadyReceived = userCoupons.find(
      (uc) => uc.userId === body.userId && uc.couponId === body.couponId
    )
    if (alreadyReceived) {
      return { code: 400, message: '该优惠券已领取过了', data: null }
    }

    const newId = userCoupons.length > 0 ? Math.max(...userCoupons.map((uc) => uc.id)) + 1 : 1
    const newUserCoupon: UserCoupon = {
      id: newId,
      couponId: body.couponId,
      userId: body.userId,
      used: false,
      receivedAt: new Date().toLocaleString()
    }
    userCoupons.push(newUserCoupon)
    saveUserCoupons(userCoupons)

    return { code: 200, message: 'success', data: newUserCoupon }
  })

  // 使用优惠券（下单成功后调用，标记为已使用）
  Mock.mock(/\/api\/coupon\/use/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const userCoupons = loadUserCoupons()
    const target = userCoupons.find((uc) => uc.id === body.userCouponId)
    if (!target) {
      return { code: 404, message: '优惠券不存在', data: null }
    }
    target.used = true
    saveUserCoupons(userCoupons)
    return { code: 200, message: 'success', data: target }
  })
}
