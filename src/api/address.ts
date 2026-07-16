import request from '@/utils/request'
import type { Address, AddressParams } from '@/types/address'

export function getAddressList(userId: number) {
  return request.get<any, Address[]>('/address/list', { params: { userId } })
}

export function createAddress(params: AddressParams) {
  return request.post<any, Address>('/address/create', params)
}

export function updateAddress(id: number, params: Partial<AddressParams>) {
  return request.put<any, Address>(`/address/update/${id}`, params)
}

export function deleteAddress(id: number) {
  return request.delete<any, null>(`/address/delete/${id}`)
}
