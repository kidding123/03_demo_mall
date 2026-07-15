<template>
  <div class="coupon-page">
    <h2>优惠券</h2>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="领券中心" name="center">
        <div v-loading="loadingCenter" class="coupon-list">
          <div v-for="coupon in couponList" :key="coupon.id" class="coupon-card">
            <div class="coupon-left">
              <div class="coupon-amount">
                <template v-if="coupon.type === 'fixed'">¥{{ coupon.amount }}</template>
                <template v-else>{{ coupon.amount * 10 }}折</template>
              </div>
              <div class="coupon-condition">
                {{ coupon.minAmount > 0 ? `满${coupon.minAmount}元可用` : '无门槛' }}
              </div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ coupon.name }}</div>
              <div class="coupon-desc">{{ coupon.description }}</div>
              <el-button
                size="small"
                type="primary"
                :disabled="isReceived(coupon.id)"
                @click="handleReceive(coupon.id)"
              >
                {{ isReceived(coupon.id) ? '已领取' : '立即领取' }}
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的优惠券" name="my">
        <div v-loading="loadingMy">
          <el-empty v-if="myCoupons.length === 0" description="还没有领取任何优惠券" />
          <div v-for="uc in myCoupons" :key="uc.id" class="coupon-card" :class="{ used: uc.used }">
            <div class="coupon-left">
              <div class="coupon-amount">
                <template v-if="uc.coupon.type === 'fixed'">¥{{ uc.coupon.amount }}</template>
                <template v-else>{{ uc.coupon.amount * 10 }}折</template>
              </div>
              <div class="coupon-condition">
                {{ uc.coupon.minAmount > 0 ? `满${uc.coupon.minAmount}元可用` : '无门槛' }}
              </div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ uc.coupon.name }}</div>
              <div class="coupon-desc">{{ uc.coupon.description }}</div>
              <el-tag :type="uc.used ? 'info' : 'success'" size="small">
                {{ uc.used ? '已使用' : '未使用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCouponList, getMyCoupons, receiveCoupon } from '@/api/coupon'
import { useUserStore } from '@/store/user'
import type { Coupon, UserCouponWithDetail } from '@/types/coupon'

const userStore = useUserStore()

const activeTab = ref('center')
const couponList = ref<Coupon[]>([])
const myCoupons = ref<UserCouponWithDetail[]>([])
const loadingCenter = ref(false)
const loadingMy = ref(false)

function isReceived(couponId: number) {
  return myCoupons.value.some((uc) => uc.couponId === couponId)
}

async function fetchCouponList() {
  loadingCenter.value = true
  try {
    couponList.value = await getCouponList()
  } finally {
    loadingCenter.value = false
  }
}

async function fetchMyCoupons() {
  if (!userStore.userInfo) return
  loadingMy.value = true
  try {
    myCoupons.value = await getMyCoupons(userStore.userInfo.id)
  } finally {
    loadingMy.value = false
  }
}

async function handleReceive(couponId: number) {
  if (!userStore.userInfo) return
  await receiveCoupon(userStore.userInfo.id, couponId)
  ElMessage.success('领取成功')
  fetchMyCoupons()
}

onMounted(() => {
  fetchCouponList()
  fetchMyCoupons()
})
</script>

<style scoped>
.coupon-page {
  padding: 20px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
}

.coupon-card {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.coupon-card.used {
  opacity: 0.6;
}

.coupon-left {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #fff;
  background: linear-gradient(135deg, #ff9a76 0%, #f5576c 100%);
}

.coupon-amount {
  font-size: 24px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  color: #333;
}

.coupon-name {
  font-weight: bold;
}

.coupon-desc {
  font-size: 12px;
  color: #999;
}
</style>
