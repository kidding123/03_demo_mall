import Mock from 'mockjs'

const hotKeywords = ['手机', '连衣裙', '空气炸锅', '口红', '零食大礼包', '运动鞋', '蓝牙耳机', '保温杯']

export function registerSearchMock() {
  Mock.mock(/\/api\/search\/hot/, 'get', () => {
    return { code: 200, message: 'success', data: hotKeywords }
  })
}
