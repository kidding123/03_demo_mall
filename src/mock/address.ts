import Mock from 'mockjs'
import type { Address, AddressParams } from '@/types/address'

const STORAGE_KEY = 'mall_addresses'

// 地址数据存 localStorage，按 userId 区分，不同账号互不干扰
function loadAddresses(): Address[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // 解析失败就走下面的种子数据兜底
    }
  }

  // 第一次没有数据时，给测试账号（userId=1，也就是 test 账号）预置两条地址，
  // 方便直接体验下单流程，不用先手动去添加地址
  const seed: Address[] = [
    {
      id: 1,
      userId: 1,
      name: '张三',
      phone: '138 0000 0000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区某栋 101',
      isDefault: true
    },
    {
      id: 2,
      userId: 1,
      name: '李四',
      phone: '139 0000 0000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路某号',
      isDefault: false
    }
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function saveAddresses(list: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function registerAddressMock() {
  // 获取某个用户自己的地址列表：GET /api/address/list?userId=xxx
  Mock.mock(/\/api\/address\/list(\?.*)?$/, 'get', (options: any) => {
    const url = new URL('http://mock' + options.url)
    const userId = Number(url.searchParams.get('userId'))
    const list = loadAddresses().filter((a) => a.userId === userId)
    return { code: 200, message: 'success', data: list }
  })

  // 新增地址
  Mock.mock(/\/api\/address\/create/, 'post', (options: any) => {
    const body: AddressParams = JSON.parse(options.body)
    const addresses = loadAddresses()
    const newId = addresses.length > 0 ? Math.max(...addresses.map((a) => a.id)) + 1 : 1

    // 如果这条设为默认，先把该用户名下其他地址的默认状态取消，保证同一账号只有一个默认地址
    if (body.isDefault) {
      addresses.forEach((a) => {
        if (a.userId === body.userId) a.isDefault = false
      })
    }

    const newAddress: Address = { id: newId, ...body }
    addresses.push(newAddress)
    saveAddresses(addresses)
    return { code: 200, message: 'success', data: newAddress }
  })

  // 编辑地址
  Mock.mock(/\/api\/address\/update\/\d+/, 'put', (options: any) => {
    const match = options.url.match(/\/update\/(\d+)/)
    const id = Number(match[1])
    const body: Partial<AddressParams> = JSON.parse(options.body)
    const addresses = loadAddresses()
    const index = addresses.findIndex((a) => a.id === id)
    if (index === -1) {
      return { code: 404, message: '地址不存在', data: null }
    }

    if (body.isDefault) {
      addresses.forEach((a) => {
        if (a.userId === addresses[index].userId) a.isDefault = false
      })
    }

    addresses[index] = { ...addresses[index], ...body }
    saveAddresses(addresses)
    return { code: 200, message: 'success', data: addresses[index] }
  })

  // 删除地址
  Mock.mock(/\/api\/address\/delete\/\d+/, 'delete', (options: any) => {
    const match = options.url.match(/\/delete\/(\d+)/)
    const id = Number(match[1])
    const addresses = loadAddresses()
    const index = addresses.findIndex((a) => a.id === id)
    if (index === -1) {
      return { code: 404, message: '地址不存在', data: null }
    }
    addresses.splice(index, 1)
    saveAddresses(addresses)
    return { code: 200, message: 'success', data: null }
  })
}

// 供订单、秒杀等模块内部直接读取使用（不经过 HTTP）
export function getAddressById(id: number) {
  return loadAddresses().find((a) => a.id === id)
}

export function getUserAddresses(userId: number) {
  return loadAddresses().filter((a) => a.userId === userId)
}

export function getDefaultAddressForUser(userId: number) {
  const list = getUserAddresses(userId)
  return list.find((a) => a.isDefault) || list[0]
}
