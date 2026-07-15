import Mock from 'mockjs'

const banners = [
  { id: 1, image: 'https://picsum.photos/seed/mall-banner-1/1200/400', title: '618 大促来袭' },
  { id: 2, image: 'https://picsum.photos/seed/mall-banner-2/1200/400', title: '新品上市' },
  { id: 3, image: 'https://picsum.photos/seed/mall-banner-3/1200/400', title: '限时秒杀' }
]

export function registerBannerMock() {
  Mock.mock(/\/api\/banner\/list/, 'get', () => {
    return { code: 200, message: 'success', data: banners }
  })
}
