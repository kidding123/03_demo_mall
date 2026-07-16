// 收货地址（跟用户账号绑定，userId 是关键字段）
export interface Address {
  id: number
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

// 新增/编辑地址的请求参数
export interface AddressParams {
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}
