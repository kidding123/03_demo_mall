import request from '@/utils/request'
import type { Coupon, UserCouponWithDetail } from '@/types/coupon'

export function getCouponList() {
  return request.get<any, Coupon[]>('/coupon/list')
}

export function getMyCoupons(userId: number) {
  return request.get<any, UserCouponWithDetail[]>('/coupon/my', { params: { userId } })
}

export function receiveCoupon(userId: number, couponId: number) {
  return request.post<any, void>('/coupon/receive', { userId, couponId })
}

export function useCoupon(userCouponId: number) {
  return request.post<any, void>('/coupon/use', { userCouponId })
}
