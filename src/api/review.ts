import request from '@/utils/request'
import type { Review, CreateReviewParams } from '@/types/review'

export function getReviewList(productId: number) {
  return request.get<any, Review[]>('/review/list', { params: { productId } })
}

export function createReview(params: CreateReviewParams) {
  return request.post<any, Review>('/review/create', params)
}
