export interface Coupon {
  id: number
  name: string
  // fixed: 满减券（减固定金额）；percent: 折扣券（amount 是折扣力度，如 0.9 表示九折）
  type: 'fixed' | 'percent'
  amount: number
  minAmount: number
  description: string
}

// 用户领取优惠券的记录
export interface UserCoupon {
  id: number
  couponId: number
  userId: number
  used: boolean
  receivedAt: string
}

// 领取记录 + 优惠券详情合并在一起，方便前端展示
export interface UserCouponWithDetail extends UserCoupon {
  coupon: Coupon
}
