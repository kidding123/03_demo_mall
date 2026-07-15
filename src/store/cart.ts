import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Product } from '@/types/product'

export interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  stock: number
  checked: boolean
}

// 每个用户单独一个 key，购物车数据互不干扰
function storageKey(userId: number) {
  return `mall_cart_${userId}`
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  // 记录当前购物车属于哪个用户，未登录时是 null
  const currentUserId = ref<number | null>(null)

  // 购物车变化时，只有在明确知道是哪个用户的情况下才写回 localStorage
  watch(
    items,
    (val) => {
      if (currentUserId.value !== null) {
        localStorage.setItem(storageKey(currentUserId.value), JSON.stringify(val))
      }
    },
    { deep: true }
  )

  // 登录成功 / 刷新页面恢复登录态时调用：加载这个用户自己的购物车
  function loadCart(userId: number) {
    currentUserId.value = userId
    const raw = localStorage.getItem(storageKey(userId))
    items.value = raw ? JSON.parse(raw) : []
  }

  // 退出登录时调用：只清空当前视图（不再显示），
  // 不删除该账号存在 localStorage 里的数据，下次同一账号登录还能读回来
  function resetCart() {
    items.value = []
    currentUserId.value = null
  }

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const checkedItems = computed(() => items.value.filter((item) => item.checked))
  const checkedTotalPrice = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const checkedCount = computed(() => checkedItems.value.length)

  function addToCart(product: Product, quantity = 1) {
    const existing = items.value.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock)
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        stock: product.stock,
        checked: true
      })
    }
  }

  function updateQuantity(id: number, quantity: number) {
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock))
    }
  }

  function removeItem(id: number) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  // 下单成功后，只移除已结算（选中）的商品
  function removeCheckedItems() {
    items.value = items.value.filter((item) => !item.checked)
  }

  function toggleChecked(id: number) {
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.checked = !item.checked
    }
  }

  function toggleAllChecked(checked: boolean) {
    items.value.forEach((item) => (item.checked = checked))
  }

  return {
    items,
    totalCount,
    checkedItems,
    checkedTotalPrice,
    checkedCount,
    loadCart,
    resetCart,
    addToCart,
    updateQuantity,
    removeItem,
    removeCheckedItems,
    toggleChecked,
    toggleAllChecked
  }
})
