export type UserRole = 'user' | 'admin'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  role: UserRole
  disabled: boolean
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
}

// 登录/注册接口的返回结果
export interface AuthResult {
  token: string
  userInfo: UserInfo
}
