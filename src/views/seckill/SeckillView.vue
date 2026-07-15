<template>
  <div class="seckill-page">
    <div class="seckill-banner">
      <h2>限时秒杀</h2>
      <p>低至 5 折，手慢无</p>
    </div>

    <div v-loading="loading" class="seckill-grid">
      <div v-for="activity in activities" :key="activity.id" class="seckill-card">
        <img :src="activity.productImage" class="seckill-image" />
        <div class="seckill-info">
          <div class="seckill-name">{{ activity.productName }}</div>
          <div class="seckill-price">
            <span class="price">¥{{ activity.seckillPrice.toFixed(2) }}</span>
            <span class="origin-price">¥{{ activity.originalPrice.toFixed(2) }}</span>
          </div>

          <el-progress
            :percentage="soldPercentage(activity)"
            :stroke-width="8"
            :show-text="false"
            color="#f56c6c"
          />
          <div class="stock-text">已抢 {{ activity.soldCount }} 件，剩余 {{ activity.stock }} 件</div>

          <div class="countdown">
            <template v-if="isExpired(activity)">活动已结束</template>
            <template v-else>距结束 {{ countdownText(activity) }}</template>
          </div>

          <el-button
            type="danger"
            class="buy-btn"
            :disabled="activity.stock <= 0 || isExpired(activity)"
            :loading="buyingId === activity.id"
            @click="handleBuy(activity)"
          >
            {{ activity.stock <= 0 ? '已抢光' : isExpired(activity) ? '已结束' : '立即抢购' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSeckillList, buySeckill } from '@/api/seckill'
import { useUserStore } from '@/store/user'
import type { SeckillActivity } from '@/types/seckill'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activities = ref<SeckillActivity[]>([])
const loading = ref(false)
const buyingId = ref<number | null>(null)

// 每秒更新一次，用来驱动倒计时重新渲染
const now = ref(Date.now())
let timer: number | undefined

function soldPercentage(activity: SeckillActivity) {
  const total = activity.soldCount + activity.stock
  if (total === 0) return 0
  return Math.round((activity.soldCount / total) * 100)
}

function isExpired(activity: SeckillActivity) {
  return new Date(activity.endTime).getTime() <= now.value
}

function countdownText(activity: SeckillActivity) {
  const diff = new Date(activity.endTime).getTime() - now.value
  if (diff <= 0) return '00:00:00'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
}

async function fetchActivities() {
  loading.value = true
  try {
    activities.value = await getSeckillList()
  } finally {
    loading.value = false
  }
}

async function handleBuy(activity: SeckillActivity) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  buyingId.value = activity.id
  try {
    const order = await buySeckill(activity.id, userStore.userInfo!.id)
    ElMessage.success('抢购成功')
    // 前端同步扣减一下库存展示，不用等下一次刷新
    activity.stock -= 1
    activity.soldCount += 1
    router.push(`/order/${order.id}`)
  } finally {
    buyingId.value = null
  }
}

onMounted(() => {
  fetchActivities()
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.seckill-page {
  padding: 20px;
}

.seckill-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%);
  color: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.seckill-banner h2 {
  margin: 0 0 4px 0;
}

.seckill-banner p {
  margin: 0;
  opacity: 0.9;
}

.seckill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.seckill-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.seckill-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.seckill-info {
  padding: 12px;
}

.seckill-name {
  font-size: 14px;
  color: #333;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.seckill-price {
  margin: 8px 0;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin-right: 8px;
}

.origin-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.stock-text {
  font-size: 12px;
  color: #999;
  margin: 6px 0;
}

.countdown {
  font-size: 13px;
  color: #f56c6c;
  margin-bottom: 10px;
}

.buy-btn {
  width: 100%;
}
</style>
