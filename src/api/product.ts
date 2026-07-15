import request from '@/utils/request'
import type { Product, ProductListParams, ProductListResult } from '@/types/product'

// 获取商品列表(支持分页、分类筛选、关键词搜索)
export function getProductList(params: ProductListParams) {
  return request.get<any, ProductListResult>('/product/list', { params })
}

// 获取商品详情
export function getProductDetail(id: number) {
  return request.get<any, Product>(`/product/detail/${id}`)
}

// 获取分类列表
export function getCategories() {
  return request.get<any, string[]>('/product/categories')
}

// 新增商品（管理后台用）
export function createProduct(data: Partial<Product>) {
  return request.post<any, Product>('/product/create', data)
}

// 编辑商品（管理后台用）
export function updateProduct(id: number, data: Partial<Product>) {
  return request.put<any, Product>(`/product/update/${id}`, data)
}

// 删除商品（管理后台用）
export function deleteProduct(id: number) {
  return request.delete<any, null>(`/product/delete/${id}`)
}
