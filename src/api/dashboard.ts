import request from '@/utils/request'

export interface DashboardData {
  userCount: number
  productCount: number
  orderCount: number
  totalRevenue: number
  salesTrend: { date: string; amount: number }[]
  statusDistribution: { name: string; value: number }[]
  topProducts: { name: string; sales: number }[]
}

export function getDashboardData() {
  return request.get<any, DashboardData>('/admin/dashboard')
}
