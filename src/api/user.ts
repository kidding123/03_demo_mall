import request from '@/utils/request'
import type { LoginParams, RegisterParams, AuthResult, UserInfo } from '@/types/user'

export function login(params: LoginParams) {
  return request.post<any, AuthResult>('/user/login', params)
}

export function register(params: RegisterParams) {
  return request.post<any, AuthResult>('/user/register', params)
}

// 管理后台：获取所有用户
export function getAdminUserList() {
  return request.get<any, UserInfo[]>('/admin/user/list')
}

// 管理后台：启用/禁用用户
export function toggleUserStatus(id: number, disabled: boolean) {
  return request.put<any, UserInfo>(`/admin/user/status/${id}`, { disabled })
}
