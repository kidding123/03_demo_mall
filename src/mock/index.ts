import { registerProductMock } from './product'
import { registerAddressMock } from './address'
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
  registerAddressMock()
  registerOrderMock()
  registerUserMock()
  registerDashboardMock()
  registerBannerMock()
  registerReviewMock()
  registerCouponMock()
  registerSeckillMock()
  registerSearchMock()
}
