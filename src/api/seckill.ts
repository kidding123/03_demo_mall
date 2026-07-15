import request from '@/utils/request'
import type { SeckillActivity } from '@/types/seckill'
import type { Order } from '@/types/order'

export function getSeckillList() {
  return request.get<any, SeckillActivity[]>('/seckill/list')
}

export function buySeckill(activityId: number, userId: number) {
  return request.post<any, Order>('/seckill/buy', { activityId, userId })
}
