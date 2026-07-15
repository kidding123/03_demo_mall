import Mock from 'mockjs'

const categories = ['手机数码', '服装鞋包', '家用电器', '美妆护肤', '食品生鲜']

// 生成 30 条随机商品数据（用 let 声明，因为管理后台要能增删改它）
let productList: any[] = Mock.mock({
  'list|30': [
    {
      'id|+1': 1,
      name: '@ctitle(5, 12)',
      price: '@float(50, 5000, 2, 2)',
      originPrice: '@float(50, 5000, 2, 2)',
      'category|1': categories,
      'image': '@image("300x300", "@color", "#FFF", "商品图")',
      // 详情页多图：每个商品随机生成 4 张不同颜色的大图，用来演示切换和放大查看
      'images|4': ['@image("600x600", "@color", "#FFF", "商品图")'],
      description: '@cparagraph(2, 4)',
      'stock|0-200': 100,
      'sales|0-2000': 500,
      'rating|3-5.1': 5
    }
  ]
}).list

export function registerProductMock() {
  // 商品列表接口：GET /api/product/list?page=1&pageSize=10&category=xxx&keyword=xxx
  Mock.mock(/\/api\/product\/list(\?.*)?$/, 'get', (options: any) => {
    const url = new URL('http://mock' + options.url)
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 8)
    const category = url.searchParams.get('category')
    const keyword = url.searchParams.get('keyword')

    let result = productList
    if (category) {
      result = result.filter((item) => item.category === category)
    }
    if (keyword) {
      result = result.filter((item) => item.name.includes(keyword))
    }

    const start = (page - 1) * pageSize
    const pageData = result.slice(start, start + pageSize)

    return {
      code: 200,
      message: 'success',
      data: {
        list: pageData,
        total: result.length,
        page,
        pageSize
      }
    }
  })

  // 商品详情接口：GET /api/product/detail/:id
  Mock.mock(/\/api\/product\/detail\/\d+/, 'get', (options: any) => {
    const match = options.url.match(/\/detail\/(\d+)/)
    const id = Number(match[1])
    const item = productList.find((p) => p.id === id)
    return {
      code: item ? 200 : 404,
      message: item ? 'success' : '商品不存在',
      data: item || null
    }
  })

  // 分类列表接口：GET /api/product/categories
  Mock.mock(/\/api\/product\/categories/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: categories
    }
  })

  // 新增商品：POST /api/product/create
  Mock.mock(/\/api\/product\/create/, 'post', (options: any) => {
    const body = JSON.parse(options.body)
    const newId = productList.length > 0 ? Math.max(...productList.map((p) => p.id)) + 1 : 1
    const newProduct = {
      id: newId,
      sales: 0,
      rating: 5,
      ...body
    }
    productList.unshift(newProduct)
    return { code: 200, message: 'success', data: newProduct }
  })

  // 编辑商品：PUT /api/product/update/:id
  Mock.mock(/\/api\/product\/update\/\d+/, 'put', (options: any) => {
    const match = options.url.match(/\/update\/(\d+)/)
    const id = Number(match[1])
    const body = JSON.parse(options.body)
    const index = productList.findIndex((p) => p.id === id)
    if (index === -1) {
      return { code: 404, message: '商品不存在', data: null }
    }
    productList[index] = { ...productList[index], ...body }
    return { code: 200, message: 'success', data: productList[index] }
  })

  // 删除商品：DELETE /api/product/delete/:id
  Mock.mock(/\/api\/product\/delete\/\d+/, 'delete', (options: any) => {
    const match = options.url.match(/\/delete\/(\d+)/)
    const id = Number(match[1])
    const index = productList.findIndex((p) => p.id === id)
    if (index === -1) {
      return { code: 404, message: '商品不存在', data: null }
    }
    productList.splice(index, 1)
    return { code: 200, message: 'success', data: null }
  })
}

// 供数据看板、秒杀等内部逻辑直接读取商品数据用
export function getAllProducts() {
  return productList
}
