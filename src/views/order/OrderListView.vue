<template>
  <div class="order-list-page">
    <h2>我的订单</h2>

    <div v-loading="loading">
      <el-empty v-if="!loading && orderList.length === 0" description="暂无订单" />

      <div
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="router.push(`/order/${order.id}`)"
      >
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createdAt }}</span>
          <el-tag :type="statusTagType(order.status)">{{ statusText(order.status) }}</el-tag>
        </div>

        <div class="order-items">
          <img
            v-for="item in order.items"
            :key="item.productId"
            :src="item.image"
            class="item-thumb"
          />
        </div>

        <div class="order-footer">
          共 {{ order.items.length }} 件商品，实付
          <b>¥{{ order.payAmount.toFixed(2) }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '@/api/order'
import { useUserStore } from '@/store/user'
import type { Order, OrderStatus } from '@/types/order'

const router = useRouter()
const userStore = useUserStore()
const orderList = ref<Order[]>([])
const loading = ref(false)

const statusMap: Record<OrderStatus, { text: string; type: 'warning' | 'success' | 'primary' | 'info' }> = {
  pending: { text: '待付款', type: 'warning' },
  paid: { text: '已付款', type: 'success' },
  shipped: { text: '已发货', type: 'primary' },
  completed: { text: '已完成', type: 'info' }
}

function statusText(status: OrderStatus) {
  return statusMap[status]?.text || status
}

function statusTagType(status: OrderStatus) {
  return statusMap[status]?.type || 'info'
}

async function fetchOrderList() {
  if (!userStore.userInfo) return
  loading.value = true
  try {
    orderList.value = await getOrderList(userStore.userInfo.id)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrderList)
</script>

<style scoped>
.order-list-page {
  padding: 20px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 13px;
}

.order-no {
  flex: 1;
}

.order-items {
  display: flex;
  gap: 8px;
  padding: 12px 0;
}

.item-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
}

.order-footer {
  text-align: right;
  color: #666;
}

.order-footer b {
  color: #f56c6c;
  font-size: 18px;
}
</style>
