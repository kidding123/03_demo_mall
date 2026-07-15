import request from '@/utils/request'

export interface Banner {
  id: number
  image: string
  title: string
}

export function getBannerList() {
  return request.get<any, Banner[]>('/banner/list')
}
