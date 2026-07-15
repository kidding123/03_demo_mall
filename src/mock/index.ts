import { registerProductMock } from './product'
import { registerOrderMock } from './order'
import { registerUserMock } from './user'
import { registerDashboardMock } from './dashboard'
import { registerBannerMock } from './banner'
import { registerReviewMock } from './review'
import { registerCouponMock } from './coupon'
import { registerSeckillMock } from './seckill'
import { registerSearchMock } from './search'

export function setupMock() {
  registerProductMock()
  registerOrderMock()
  registerUserMock()
  registerDashboardMock()
  registerBannerMock()
  registerReviewMock()
  registerCouponMock()
  registerSeckillMock()
  registerSearchMock()
}
