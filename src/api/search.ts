import request from '@/utils/request'

export function getHotKeywords() {
  return request.get<any, string[]>('/search/hot')
}
