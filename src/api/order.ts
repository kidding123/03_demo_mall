import request from '@/utils/request'
import type { CreateOrderParams, Order, OrderStatus } from '@/types/order'

// 创建订单
export function createOrder(params: CreateOrderParams) {
  return request.post<any, Order>('/order/create', params)
}

// 获取当前用户自己的订单列表
export function getOrderList(userId: number) {
  return request.get<any, Order[]>('/order/list', { params: { userId } })
}

// 获取订单详情
export function getOrderDetail(id: string) {
  return request.get<any, Order>(`/order/detail/${id}`)
}

// 管理后台：获取所有用户的订单
export function getAdminOrderList() {
  return request.get<any, Order[]>('/admin/order/list')
}

// 管理后台：更新订单状态
export function updateOrderStatus(id: string, status: OrderStatus) {
  return request.put<any, Order>(`/admin/order/status/${id}`, { status })
}
