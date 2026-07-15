import Mock from 'mockjs'
import type { Review } from '@/types/review'

// 预置 60 条随机评价，随机分布在前 30 个商品下面，让商品详情页一开始就有内容可看
let reviewList: Review[] = Mock.mock({
  'list|60': [
    {
      'id|+1': 1,
      'productId|1-30': 1,
      'userId|1-5': 1,
      username: '@cname',
      avatar: '@image("60x60", "@color", "#fff", "@word(1,1)")',
      'rating|4-5': 5,
      content: '@cparagraph(1, 2)',
      createdAt: '@datetime'
    }
  ]
}).list

export function registerReviewMock() {
  // 获取某个商品的评价列表：GET /api/review/list?productId=xxx
  Mock.mock(/\/api\/review\/list(\?.*)?$/, 'get', (options: any) => {
    const url = new URL('http://mock' + options.url)
    const productId = Number(url.searchParams.get('productId'))
    const result = reviewList.filter((r) => r.productId === productId)
    return { code: 200, message: 'success', data: result }
  })

  // 提交评价：POST /api/review/create
  Mock.mock(/\/api\/review\/create/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const newReview: Review = {
      id: reviewList.length > 0 ? Math.max(...reviewList.map((r) => r.id)) + 1 : 1,
      productId: body.productId,
      userId: body.userId,
      username: body.username,
      avatar: body.avatar,
      rating: body.rating,
      content: body.content,
      createdAt: new Date().toLocaleString()
    }
    reviewList.unshift(newReview)
    return { code: 200, message: 'success', data: newReview }
  })
}
