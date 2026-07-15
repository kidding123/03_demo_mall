import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { useCartStore } from './cart'
import { useFavoriteStore } from './favorite'

export const useUserStore = defineStore('user', () => {
  // 初始化时从 localStorage 恢复登录状态，刷新页面不用重新登录
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)

  // 应用启动时如果已经是登录状态（比如刷新页面），恢复这个账号自己的购物车和收藏
  if (userInfo.value) {
    useCartStore().loadCart(userInfo.value.id)
    useFavoriteStore().loadFavorites(userInfo.value.id)
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
    // 登录/注册成功后，加载这个账号自己的购物车和收藏
    useCartStore().loadCart(info.id)
    useFavoriteStore().loadFavorites(info.id)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    // 只清空当前视图，不删除该账号的数据，下次登录还能读回来
    useCartStore().resetCart()
    useFavoriteStore().resetFavorites()
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout }
})
