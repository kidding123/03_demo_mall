// 商品实体
export interface Product {
  id: number
  name: string
  price: number
  originPrice: number
  category: string
  image: string
  // 详情页多图，管理后台新增/编辑商品时不一定会填，所以设为可选
  images?: string[]
  description: string
  stock: number
  sales: number
  rating: number
}

// 商品列表请求参数
export interface ProductListParams {
  page?: number
  pageSize?: number
  category?: string
  keyword?: string
}

// 商品列表返回结果
export interface ProductListResult {
  list: Product[]
  total: number
  page: number
  pageSize: number
}
