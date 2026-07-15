import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '@/types/product'

export interface FavoriteItem {
  id: number
  name: string
  image: string
  price: number
}

// 收藏也按账号隔离存储，思路跟购物车 store 一样
function storageKey(userId: number) {
  return `mall_favorite_${userId}`
}

export const useFavoriteStore = defineStore('favorite', () => {
  const items = ref<FavoriteItem[]>([])
  const currentUserId = ref<number | null>(null)

  watch(
    items,
    (val) => {
      if (currentUserId.value !== null) {
        localStorage.setItem(storageKey(currentUserId.value), JSON.stringify(val))
      }
    },
    { deep: true }
  )

  function loadFavorites(userId: number) {
    currentUserId.value = userId
    const raw = localStorage.getItem(storageKey(userId))
    items.value = raw ? JSON.parse(raw) : []
  }

  function resetFavorites() {
    items.value = []
    currentUserId.value = null
  }

  function isFavorite(productId: number) {
    return items.value.some((item) => item.id === productId)
  }

  // 返回切换后的状态：true 表示收藏成功，false 表示取消了收藏
  function toggleFavorite(product: Product) {
    const index = items.value.findIndex((item) => item.id === product.id)
    if (index > -1) {
      items.value.splice(index, 1)
      return false
    }
    items.value.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price
    })
    return true
  }

  function removeFavorite(productId: number) {
    items.value = items.value.filter((item) => item.id !== productId)
  }

  return { items, loadFavorites, resetFavorites, isFavorite, toggleFavorite, removeFavorite }
})
