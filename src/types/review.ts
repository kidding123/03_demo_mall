export interface Review {
  id: number
  productId: number
  userId: number
  username: string
  avatar: string
  rating: number
  content: string
  createdAt: string
}

export interface CreateReviewParams {
  productId: number
  userId: number
  username: string
  avatar: string
  rating: number
  content: string
}
