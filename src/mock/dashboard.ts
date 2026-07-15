import Mock from 'mockjs'
import { getAllProducts } from './product'
import { getAllOrders } from './order'
import { getAllUsersForStats } from './user'

const statusTextMap: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成'
}

export function registerDashboardMock() {
  Mock.mock(/\/api\/admin\/dashboard/, 'get', () => {
    const products = getAllProducts()
    const orders = getAllOrders()
    const users = getAllUsersForStats()

    // 销售额按实付金额（payAmount）统计，而不是商品原价合计（totalPrice），
    // 因为优惠券抵扣之后，用户实际付的钱才是真正的"销售额"
    const totalRevenue = orders.reduce((sum, o) => sum + o.payAmount, 0)

    // 近 7 天销售趋势：mock 阶段没有足够的历史订单数据撑起真实的趋势图，这里用随机数演示走势
    const salesTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        amount: Mock.Random.integer(1000, 12000)
      }
    })

    // 订单状态分布：基于当前真实存在的订单数据统计出来的
    const statusCount: Record<string, number> = {}
    orders.forEach((o) => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1
    })
    const statusDistribution = Object.entries(statusCount).map(([status, value]) => ({
      name: statusTextMap[status] || status,
      value
    }))

    // 商品销量 Top5：基于当前真实存在的商品数据
    const topProducts = [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p) => ({ name: p.name, sales: p.sales }))

    return {
      code: 200,
      message: 'success',
      data: {
        userCount: users.length,
        productCount: products.length,
        orderCount: orders.length,
        totalRevenue,
        salesTrend,
        statusDistribution,
        topProducts
      }
    }
  })
}
