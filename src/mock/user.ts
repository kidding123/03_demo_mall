import Mock from 'mockjs'
import type { UserInfo } from '@/types/user'

interface StoredUser {
  username: string
  password: string
  info: UserInfo
}

const STORAGE_KEY = 'mall_mock_users'

// 从 localStorage 读取"用户表"；做了兼容处理，保证测试账号、管理员账号一定存在，
// 并且旧数据缺的字段（role、disabled）都会自动补上默认值
function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  let users: StoredUser[] = []

  if (raw) {
    try {
      users = JSON.parse(raw)
    } catch {
      users = []
    }
  }

  if (!users.find((u) => u.username === 'test')) {
    users.push({
      username: 'test',
      password: '123456',
      info: {
        id: 1,
        username: 'test',
        nickname: '测试用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        phone: '138 0000 0000',
        role: 'user',
        disabled: false
      }
    })
  }

  if (!users.find((u) => u.username === 'admin')) {
    users.push({
      username: 'admin',
      password: 'admin123',
      info: {
        id: 2,
        username: 'admin',
        nickname: '管理员',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        phone: '',
        role: 'admin',
        disabled: false
      }
    })
  }

  // 旧数据缺字段的，补默认值
  users.forEach((u) => {
    if (!u.info.role) {
      u.info.role = 'user'
    }
    if (u.info.disabled === undefined) {
      u.info.disabled = false
    }
  })

  saveUsers(users)
  return users
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function registerUserMock() {
  // 登录
  Mock.mock(/\/api\/user\/login/, 'post', (options: any) => {
    const { username, password } = JSON.parse(options.body)
    const users = loadUsers()
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      return { code: 401, message: '用户名或密码错误', data: null }
    }
    if (user.info.disabled) {
      return { code: 403, message: '该账号已被禁用，请联系管理员', data: null }
    }

    return {
      code: 200,
      message: 'success',
      data: {
        token: 'mock-token-' + user.info.id + '-' + Date.now(),
        userInfo: user.info
      }
    }
  })

  // 注册（自主注册的账号一律是普通用户，管理员账号是内置的，不开放注册）
  Mock.mock(/\/api\/user\/register/, 'post', (options: any) => {
    const { username, password } = JSON.parse(options.body)
    const users = loadUsers()

    if (users.find((u) => u.username === username)) {
      return { code: 400, message: '该用户名已被注册', data: null }
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.info.id)) + 1 : 1
    const info: UserInfo = {
      id: newId,
      username,
      nickname: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      phone: '',
      role: 'user',
      disabled: false
    }

    users.push({ username, password, info })
    saveUsers(users)

    return {
      code: 200,
      message: 'success',
      data: {
        token: 'mock-token-' + info.id + '-' + Date.now(),
        userInfo: info
      }
    }
  })

  // 管理后台：获取所有用户列表（不返回密码字段）
  Mock.mock(/\/api\/admin\/user\/list/, 'get', () => {
    const users = loadUsers()
    return { code: 200, message: 'success', data: users.map((u) => u.info) }
  })

  // 管理后台：启用/禁用用户
  Mock.mock(/\/api\/admin\/user\/status\/\d+/, 'put', (options: any) => {
    const match = options.url.match(/\/status\/(\d+)/)
    const id = Number(match[1])
    const body = JSON.parse(options.body)

    const users = loadUsers()
    const user = users.find((u) => u.info.id === id)
    if (!user) {
      return { code: 404, message: '用户不存在', data: null }
    }

    user.info.disabled = body.disabled
    saveUsers(users)

    return { code: 200, message: 'success', data: user.info }
  })
}

// 供数据看板等内部逻辑直接读取用户数据用
export function getAllUsersForStats() {
  return loadUsers().map((u) => u.info)
}
